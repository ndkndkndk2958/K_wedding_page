# Tích hợp Google Sheets (Excel trên Drive) để lưu dữ liệu RSVP & Lời chúc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi backend từ gửi email (Resend/Web3Forms) sang lưu trực tiếp vào Google Sheets trên Google Drive của người dùng bằng cách tích hợp Google Apps Script Web App và cập nhật Cloudflare Worker.

**Architecture:**
1. Cấu hình Cloudflare Worker để tiếp nhận request, xác thực Captcha Turnstile như bình thường, rồi gửi payload JSON tới Google Apps Script Web App URL (`GOOGLE_SHEETS_URL`).
2. Viết mã Google Apps Script để nhận dữ liệu từ Worker và tự động cập nhật, tự tạo cột tiêu đề nếu chưa có.
3. Cập nhật tài liệu hướng dẫn cấu hình trong `worker/README.md`.

**Tech Stack:** JavaScript, Cloudflare Workers, Google Apps Script, Google Sheets.

## Global Constraints
- Bảo toàn tính năng xác thực Cloudflare Turnstile để chống spam.
- Trả về mã JSON phản hồi tương thích 100% với giao diện frontend ở `index.html`.
- Google Sheets URL phải được cấu hình thông qua biến môi trường của Worker (`wrangler.toml` hoặc biến bí mật Cloudflare).

---

### Task 1: Thiết lập mã Google Apps Script (Người dùng thực hiện)

**Files:**
- Create: `docs/superpowers/instructions/google-apps-script.js` (Tệp tài liệu lưu mã để người dùng sao chép)

**Interfaces:**
- Consumes: None
- Produces: API Endpoint của Google Apps Script Web App.

- [ ] **Step 1: Tạo tệp hướng dẫn chứa mã Google Apps Script**

Tạo tệp `docs/superpowers/instructions/google-apps-script.js` chứa mã Apps Script tối ưu giúp ghi dữ liệu động vào sheet:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Lấy tiêu đề cột hiện tại
    var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    
    // Nếu sheet trống, tự động tạo tiêu đề từ keys của data
    if (sheet.getLastRow() === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
    }
    
    // Nếu xuất hiện key mới trong data chưa có ở headers, tự động thêm cột mới
    var keys = Object.keys(data);
    var newKeys = keys.filter(function(key) {
      return headers.indexOf(key) === -1;
    });
    
    if (newKeys.length > 0) {
      var startCol = headers.length + 1;
      sheet.getRange(1, startCol, 1, newKeys.length).setValues([newKeys]);
      headers = headers.concat(newKeys);
    }
    
    // Ánh xạ dữ liệu khớp theo cột tiêu đề
    var row = headers.map(function(header) {
      return data[header] !== undefined ? data[header] : "";
    });
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

- [ ] **Step 2: Commit file tài liệu hướng dẫn Google Apps Script**

```bash
git add docs/superpowers/instructions/google-apps-script.js
git commit -m "docs: create Google Apps Script source file for Google Sheets webhook"
```

---

### Task 2: Cập nhật Cloudflare Worker để chuyển tiếp dữ liệu lên Google Sheets

**Files:**
- Modify: `worker/src/index.js`
- Modify: `worker/wrangler.toml`
- Modify: `worker/.dev.vars.example`

**Interfaces:**
- Consumes: `GOOGLE_SHEETS_URL` từ môi trường (env).
- Produces: API endpoint chuyển tiếp dữ liệu lên Google Sheets.

- [ ] **Step 1: Thay thế logic gửi email bằng gửi Google Sheets trong `worker/src/index.js`**

Tìm khối code xử lý email ở dòng 62-102:
```javascript
        const accessKey = env.WEB3FORMS_ACCESS_KEY;
        const resendKey = env.RESEND_API_KEY;
        const recipient = env.RECIPIENT_EMAIL;

        if (!recipient) {
            return jsonResponse({ success: false, message: 'Server chưa cấu hình email nhận.' }, 500, request, env);
        }

        const messageBody = Object.entries(fields)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        if (resendKey) {
            const sent = await sendViaResend({
                apiKey: resendKey,
                to: recipient,
                subject,
                text: messageBody,
                from: env.RESEND_FROM || 'Wedding RSVP <onboarding@resend.dev>',
            });
            if (!sent.ok) {
                return jsonResponse({ success: false, message: sent.message }, 502, request, env);
            }
            return jsonResponse({ success: true }, 200, request, env);
        }

        if (accessKey) {
            const web3 = await sendViaWeb3Forms({
                accessKey,
                recipient,
                subject,
                fromName: fields['Tên'] || 'Khách mời',
                messageBody,
            });
            if (!web3.ok) {
                return jsonResponse({ success: false, message: web3.message }, 502, request, env);
            }
            return jsonResponse({ success: true }, 200, request, env);
        }

        return jsonResponse({ success: false, message: 'Server chưa cấu hình dịch vụ email.' }, 500, request, env);
```

Thay thế bằng logic gọi Google Sheets:
```javascript
        const googleSheetsUrl = env.GOOGLE_SHEETS_URL;

        if (!googleSheetsUrl) {
            return jsonResponse({ success: false, message: 'Server chưa cấu hình link Google Sheets.' }, 500, request, env);
        }

        const sent = await sendToGoogleSheets(googleSheetsUrl, fields);
        if (!sent.ok) {
            return jsonResponse({ success: false, message: sent.message }, 502, request, env);
        }
        return jsonResponse({ success: true }, 200, request, env);
```

- [ ] **Step 2: Định nghĩa hàm `sendToGoogleSheets` trong `worker/src/index.js`**

Xóa bỏ các hàm `sendViaResend` và `sendViaWeb3Forms` không dùng đến nữa (dòng 106-161), thay vào đó viết hàm `sendToGoogleSheets`:

```javascript
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
```

- [ ] **Step 3: Cập nhật tệp cấu hình môi trường của Worker**

Sửa `worker/wrangler.toml` để bổ sung biến môi trường mới và hướng dẫn cấu hình:
Tìm khối `[vars]` trong `worker/wrangler.toml` nếu có, hoặc thêm vào:
```toml
[vars]
# GOOGLE_SHEETS_URL = "Link web app Apps Script của bạn"
```

Sửa `worker/.dev.vars.example` để hướng dẫn khai báo biến bí mật:
```env
TURNSTILE_SECRET_KEY="0x4AAAAAADlq199999999999"
ALLOWED_ORIGINS="http://localhost:8080,https://ndkndkndk2958.github.io"
GOOGLE_SHEETS_URL="https://script.google.com/macros/s/xxxx/exec"
```

- [ ] **Step 4: Commit thay đổi trong Worker**

```bash
git add worker/src/index.js worker/wrangler.toml worker/.dev.vars.example
git commit -m "feat: replace email logic with Google Sheets webhook redirect in Worker"
```

---

### Task 3: Cập nhật tài liệu hướng dẫn sử dụng

**Files:**
- Modify: `worker/README.md`

**Interfaces:**
- Consumes: Toàn bộ cấu hình Google Sheets từ Task 1 và Task 2.
- Produces: Tài liệu hướng dẫn sử dụng cho người dùng để tự cấu hình Sheet của họ.

- [ ] **Step 1: Viết hướng dẫn tích hợp Google Sheets cụ thể vào `worker/README.md`**

Đọc và cập nhật `worker/README.md` hướng dẫn chi tiết cách tạo Google Sheet, mở Apps Script, dán mã, deploy dưới dạng Web App, và cấu hình biến `GOOGLE_SHEETS_URL` trong Wrangler/Cloudflare Dashboard.

- [ ] **Step 2: Commit tài liệu**

```bash
git add worker/README.md
git commit -m "docs: update worker README with Google Sheets setup guide"
```
