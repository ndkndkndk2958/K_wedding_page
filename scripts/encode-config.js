const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../config.src.js');
const distPath = path.join(__dirname, '../config.js');

if (!fs.existsSync(srcPath)) {
    console.error('Source file config.src.js not found!');
    process.exit(1);
}

// Load plaintext config object
const WEDDING_CONFIG = require(srcPath);
const jsonStr = JSON.stringify(WEDDING_CONFIG);

// Convert to UTF-8 buffer and XOR with key 42
const jsonBytes = Buffer.from(jsonStr, 'utf8');
const xorBytes = Buffer.alloc(jsonBytes.length);
for (let i = 0; i < jsonBytes.length; i++) {
    xorBytes[i] = jsonBytes[i] ^ 42;
}

// Encode to Base64
const encoded = xorBytes.toString('base64');

const outputContent = `// ============================================================
// CẤU HÌNH THIỆP CƯỚI (ĐÃ MÃ HÓA)
// Chỉnh sửa cấu hình tại config.src.js và chạy "npm run build:config" để cập nhật file này.
// ============================================================
window._encodedConfig = "${encoded}";
`;

fs.writeFileSync(distPath, outputContent, 'utf8');
console.log('Successfully compiled config.src.js -> config.js');
