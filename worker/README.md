# Wedding Mail Worker

Cloudflare Worker proxy gửi RSVP & lời chúc. Giữ **API key** và **email nhận** trên server — không lộ trong `config.js`.

## Yêu cầu

- Tài khoản [Cloudflare](https://dash.cloudflare.com) (miễn phí)
- **[Resend](https://resend.com)** (khuyến nghị) — gửi email từ server hoạt động trên free tier
- Widget [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) (miễn phí)

> **Lưu ý Web3Forms:** API Web3Forms **chặn gọi từ server** trên gói miễn phí (chỉ client-side). Worker vẫn hỗ trợ `WEB3FORMS_ACCESS_KEY` nếu bạn có gói Pro + safelist IP, nhưng **khuyến nghị dùng Resend**.

## 1. Tạo Resend API key

1. Đăng ký [resend.com](https://resend.com)
2. API Keys → Create API Key
3. Free tier: gửi từ `onboarding@resend.dev` tới email đã verify (đủ cho thiệp cưới)
4. Production: verify domain → đặt `RESEND_FROM` (vd. `Wedding <rsvp@yourdomain.com>`)

Nếu từng commit Web3Forms access key lên git → tạo key Resend mới, **không** tái dùng key cũ.

## 2. Tạo Turnstile widget

1. Cloudflare Dashboard → Turnstile → Add site
2. Chọn widget mode **Managed** (hoặc Non-interactive cho ít friction hơn)
3. Thêm hostname: `localhost`, domain GitHub Pages, custom domain
4. Lưu **Site Key** (công khai → `config.js`) và **Secret Key** (chỉ Worker)

**Local dev:** dùng test keys của Cloudflare:

- Site key: `1x00000000000000000000AA` (luôn pass)
- Secret key: `1x0000000000000000000000000000000AA` (luôn pass)

## 3. Cấu hình Worker

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
# Chỉnh .dev.vars với key thật
```

Chỉnh `wrangler.toml` → `ALLOWED_ORIGINS` (không có dấu `/` cuối):

```toml
ALLOWED_ORIGINS = "http://localhost:8080,https://your-username.github.io,https://yourdomain.com"
```

Nếu repo GitHub Pages ở subpath `https://user.github.io/repo-name/`, origin vẫn là `https://user.github.io` — thêm cả custom domain nếu có.

## 4. Deploy Worker

```bash
cd worker
npm run deploy
```

Sau deploy, set secrets production:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RECIPIENT_EMAIL
# Tuỳ chọn khi đã verify domain Resend:
npx wrangler secret put RESEND_FROM
```

(Tuỳ chọn Web3Forms Pro: `npx wrangler secret put WEB3FORMS_ACCESS_KEY`)

URL Worker: `https://wedding-mail.ndkndkndk2958.workers.dev/send`

Xem [DEPLOY.md](../DEPLOY.md) để deploy GitHub Pages.

## 5. Cập nhật config.js (trang tĩnh)

```js
email: {
    endpoint: 'https://wedding-mail.<account>.workers.dev/send',
},
turnstile: {
    siteKey: '0x...', // site key thật từ Turnstile Dashboard
},
```

## 6. Chạy local

Terminal 1 — Worker:

```bash
cd worker
npm run dev
```

Terminal 2 — trang tĩnh:

```bash
python3 -m http.server 8080
```

Mở `http://localhost:8080` — `config.js` mặc định dùng `http://localhost:8787/send`.

## 7. Deploy GitHub Pages

1. Push repo lên GitHub
2. Settings → Pages → deploy từ branch `main` (hoặc `gh-pages`)
3. Cập nhật `ALLOWED_ORIGINS` trong `wrangler.toml` với URL Pages thật, chạy lại `npm run deploy`
4. Cập nhật `email.endpoint` trong `config.js` sang URL Worker production

Secret **không** đưa vào GitHub — chỉ nằm trong Cloudflare Worker secrets.

## Bảo mật

| Lớp | Mô tả |
|-----|--------|
| Origin whitelist | Chỉ domain được phép gọi Worker |
| Turnstile | Chống bot trên form |
| Rate limit | Tối đa 5 request/phút/IP |
| Secrets | Resend API key + email chỉ trên Worker |

Tuỳ chọn thêm: Resend domain verification; Web3Forms Domain Restriction (gói Pro).
