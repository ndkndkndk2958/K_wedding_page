# Wedding Mail Worker (Google Sheets Integration)

Cloudflare Worker proxy tiếp nhận RSVP & Lời chúc, xác thực Captcha Turnstile chống spam, rồi chuyển tiếp dữ liệu để lưu trực tiếp vào **Google Sheets** (Excel trên Google Drive). 

Giữ **Google Sheets Webhook URL** trên Worker — không lộ trong `config.js`.

---

## Yêu cầu

- Tài khoản [Cloudflare](https://dash.cloudflare.com) (miễn phí)
- Một tệp **Google Sheets** lưu trên Google Drive của bạn
- Widget [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) (miễn phí)

---

## 1. Thiết lập Google Sheets & Apps Script

Để cho phép Worker ghi dữ liệu trực tiếp vào Sheet của bạn:

1. Tạo một tệp **Google Sheets** mới trên Google Drive của bạn.
2. Trên thanh menu, chọn **Tiện ích mở rộng** (Extensions) → **Apps Script**.
3. Xóa toàn bộ mã mặc định trong trình chỉnh sửa và dán vào nội dung tệp [google-apps-script.js](../docs/superpowers/instructions/google-apps-script.js).
4. Nhấp vào biểu tượng **Lưu** (Save).
5. Nhấp vào nút **Triển khai** (Deploy) ở góc trên bên phải → chọn **Triển khai mới** (New deployment).
6. Nhấp vào icon bánh răng (Select type) → chọn **Ứng dụng web** (Web app).
7. Cấu hình triển khai:
   - **Mô tả (Description):** `Wedding RSVP Sheets API`
   - **Thực thi dưới dạng (Execute as):** `Tôi` (Me - địa chỉ email Google của bạn)
   - **Ai có quyền truy cập (Who has access):** `Mọi người` (Anyone - bắt buộc để Cloudflare Worker có thể gọi)
8. Nhấp vào **Triển khai** (Deploy). Nếu được hỏi, chọn **Cấp quyền truy cập** (Authorize access) và đăng nhập bằng tài khoản Google của bạn để cấp quyền ghi vào Sheet.
9. Sau khi thành công, sao chép **URL của ứng dụng web** (Web app URL) có dạng:
   `https://script.google.com/macros/s/xxxx/exec`

*Lưu ý:* Sheet của bạn sẽ tự động tạo các cột tiêu đề dựa trên dữ liệu gửi lên ở lần gửi đầu tiên, và sẽ tự động thêm cột mới nếu có trường dữ liệu mới.

---

## 2. Tạo Turnstile widget

1. Cloudflare Dashboard → Turnstile → Add site
2. Chọn widget mode **Managed** (hoặc Non-interactive)
3. Thêm hostname: `localhost`, domain GitHub Pages, custom domain
4. Lưu **Site Key** (công khai → điền vào `config.js`) và **Secret Key** (bí mật → cấu hình trong Worker)

**Local dev:** dùng test keys của Cloudflare:
- Site key: `1x00000000000000000000AA` (luôn pass)
- Secret key: `1x0000000000000000000000000000000AA` (luôn pass)

---

## 3. Cấu hình Worker

Di chuyển vào thư mục worker:
```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
```

Mở tệp `.dev.vars` và điền key/URL của bạn:
```env
GOOGLE_SHEETS_URL="https://script.google.com/macros/s/xxxx/exec"
TURNSTILE_SECRET_KEY="secret-key-turnstile-cua-ban"
```

Chỉnh `wrangler.toml` → cập nhật danh sách domain được phép gọi API tại `ALLOWED_ORIGINS` (phân cách bằng dấu phẩy, không có dấu `/` ở cuối):
```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:8080,https://username.github.io,https://yourdomain.com"
```

---

## 4. Deploy Worker lên Cloudflare

Chạy lệnh deploy:
```bash
npm run deploy
```

Sau khi deploy thành công, cấu hình các biến bí mật (Secrets) trên production:
```bash
npx wrangler secret put GOOGLE_SHEETS_URL
# Nhập link Web App Google Apps Script bạn lấy ở Bước 1

npx wrangler secret put TURNSTILE_SECRET_KEY
# Nhập Secret Key Turnstile của bạn
```

URL Worker của bạn sau khi deploy sẽ có dạng: `https://wedding-mail.ndkndkndk2958.workers.dev/send`

---

## 5. Chạy thử nghiệm local

Terminal 1 — Worker (cổng 8787):
```bash
cd worker
npm run dev
```

Terminal 2 — Trang tĩnh (cổng 8080):
```bash
python3 -m http.server 8080
```

Mở trình duyệt truy cập `http://localhost:8080`.
