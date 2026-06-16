# Deploy lên GitHub Pages

URL live: **https://ndkndkndk2958.github.io/K_wedding_page/**

## Đã deploy sẵn

| Thành phần | URL / giá trị |
|---|---|
| Cloudflare Worker | `https://wedding-mail.ndkndkndk2958.workers.dev/send` |
| GitHub Actions | `.github/workflows/deploy-pages.yml` |

## Bước bạn cần làm (Turnstile — một lần)

Test Turnstile key **không** chạy trên domain thật. Tạo widget production:

1. [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. **Add site** → tên `K-wedding-page`
3. Hostnames: `ndkndkndk2958.github.io`, `localhost`
4. Copy **Site Key** và **Secret Key**
5. Cập nhật Worker secret:
   ```bash
   cd worker
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```
## GitHub Pages

**Không cần** cấu hình GitHub Variables — `config.js` tự dùng Worker production khi chạy trên `ndkndkndk2958.github.io`, và `localhost` khi dev local.

1. Repo **Settings → Pages → Build and deployment**
2. Source: **GitHub Actions**
3. Push lên `main` → workflow tự deploy

## Sau mỗi lần đổi Worker secrets

```bash
cd worker && npm run deploy -- --secrets-file .dev.vars
```
