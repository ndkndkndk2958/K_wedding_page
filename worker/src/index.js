const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const MAX_FIELD_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 200;

/** @type {Map<string, { count: number; resetAt: number }>} */
const rateLimitStore = new Map();

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return corsResponse(null, 204, request, env);
        }

        if (url.pathname !== '/send' || request.method !== 'POST') {
            return jsonResponse({ success: false, message: 'Not found' }, 404, request, env);
        }

        if (!isOriginAllowed(request, env)) {
            return jsonResponse({ success: false, message: 'Origin not allowed' }, 403, request, env);
        }

        const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (isRateLimited(clientIp)) {
            return jsonResponse({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }, 429, request, env);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ success: false, message: 'Invalid JSON' }, 400, request, env);
        }

        const { subject, fields, turnstileToken } = body || {};

        if (!turnstileToken || typeof turnstileToken !== 'string') {
            return jsonResponse({ success: false, message: 'Vui lòng hoàn thành xác minh captcha.' }, 400, request, env);
        }

        const turnstileOk = await verifyTurnstile(turnstileToken, clientIp, env);
        if (!turnstileOk) {
            return jsonResponse({ success: false, message: 'Xác minh captcha thất bại, vui lòng thử lại.' }, 403, request, env);
        }

        if (!subject || typeof subject !== 'string' || subject.length > MAX_SUBJECT_LENGTH) {
            return jsonResponse({ success: false, message: 'Tiêu đề không hợp lệ.' }, 400, request, env);
        }

        if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
            return jsonResponse({ success: false, message: 'Dữ liệu form không hợp lệ.' }, 400, request, env);
        }

        for (const [key, value] of Object.entries(fields)) {
            if (typeof value !== 'string' || value.length > MAX_FIELD_LENGTH) {
                return jsonResponse({ success: false, message: `Trường "${key}" không hợp lệ.` }, 400, request, env);
            }
        }

        const googleSheetsUrl = env.GOOGLE_SHEETS_URL;

        if (!googleSheetsUrl) {
            return jsonResponse({ success: false, message: 'Server chưa cấu hình link Google Sheets.' }, 500, request, env);
        }

        const sent = await sendToGoogleSheets(googleSheetsUrl, fields);
        if (!sent.ok) {
            return jsonResponse({ success: false, message: sent.message }, 502, request, env);
        }
        return jsonResponse({ success: true }, 200, request, env);
    },
};

async function sendToGoogleSheets(url, fields) {
    const payload = {
        ...fields,
        'Thời gian gửi': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            redirect: 'follow', // Quan trọng: Google Apps Script yêu cầu follow redirect (302)
        });

        if (!res.ok) {
            return { ok: false, message: 'Không thể ghi dữ liệu lên Google Sheets.' };
        }

        const data = await res.json();
        if (!data.success) {
            return { ok: false, message: data.error || 'Google Sheets từ chối ghi dữ liệu.' };
        }

        return { ok: true };
    } catch (err) {
        return { ok: false, message: `Lỗi kết nối tới Google Sheets: ${err.message}` };
    }
}

function getAllowedOrigins(env) {
    return (env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
}

function isOriginAllowed(request, env) {
    const allowed = getAllowedOrigins(env);
    if (allowed.length === 0) return false;

    const origin = request.headers.get('Origin');
    if (origin && allowed.includes(origin)) return true;

    const referer = request.headers.get('Referer');
    if (referer) {
        try {
            const refererOrigin = new URL(referer).origin;
            if (allowed.includes(refererOrigin)) return true;
        } catch {
            // ignore invalid referer
        }
    }

    return false;
}

async function verifyTurnstile(token, remoteip, env) {
    const secret = env.TURNSTILE_SECRET_KEY;
    if (!secret) return false;

    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);
    if (remoteip && remoteip !== 'unknown') {
        form.set('remoteip', remoteip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
    });

    const data = await res.json();
    return data.success === true;
}

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    entry.count += 1;
    return entry.count > RATE_LIMIT_MAX;
}

function corsHeaders(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = getAllowedOrigins(env);
    const headers = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };

    if (origin && allowed.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Vary'] = 'Origin';
    }

    return headers;
}

function jsonResponse(data, status, request, env) {
    return corsResponse(JSON.stringify(data), status, request, env, {
        'Content-Type': 'application/json',
    });
}

function corsResponse(body, status, request, env, extraHeaders = {}) {
    return new Response(body, {
        status,
        headers: {
            ...corsHeaders(request, env),
            ...extraHeaders,
        },
    });
}
