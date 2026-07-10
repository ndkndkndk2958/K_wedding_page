# Tối ưu hóa Font chữ Lãng mạn & Bay bổng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa hệ thống font chữ theo phong cách "Lãng mạn & Bay bổng" bằng cách tích hợp thêm font **Alex Brush** và sử dụng font script (**Great Vibes** / **Alex Brush**) cho các thành phần chữ tiêu đề nghệ thuật (như tên cô dâu chú rể ở Hero), kết hợp với font **Montserrat** cho văn bản để tăng tính thẩm mỹ lãng mạn.

**Architecture:**
1. Thêm liên kết Google Fonts cho `Alex Brush` và `Great Vibes` trong đầu trang `index.html`.
2. Định nghĩa các nhóm font mới (`font-script`, `font-alex`) trong `tailwind.config.js` và CSS của `index.html`.
3. Cập nhật các class của tiêu đề tên ở phần Hero và các chi tiết trang trí để áp dụng font script mềm mại.
4. Biên dịch lại CSS bằng Tailwind CLI (`npm run build:css`).

**Tech Stack:** HTML5, CSS3, Tailwind CSS (v3), Google Fonts (Alex Brush, Great Vibes, Montserrat, Playfair Display).

## Global Constraints
- Giữ nguyên các cấu hình Dark/Light Mode đã hoàn thành.
- Các chữ dạng script nghệ thuật phải hiển thị ở định dạng chữ viết hoa chữ cái đầu (Title Case), tránh viết hoa toàn bộ (All-caps) để đảm bảo tính dễ đọc.
- Không thay đổi cấu trúc dữ liệu trong `config.js`.

---

### Task 1: Tải và cấu hình font chữ trong `index.html` và `tailwind.config.js`

**Files:**
- Modify: `index.html:27-33`
- Modify: `tailwind.config.js:38-47`

**Interfaces:**
- Consumes: None
- Produces: Các biến font `font-script` (Great Vibes) và `font-alex` (Alex Brush) khả dụng trong Tailwind và CSS.

- [ ] **Step 1: Cập nhật thẻ liên kết Google Fonts trong `index.html`**

Tìm dòng liên kết font hiện tại:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&amp;family=Montserrat:ital,wght@0,100..900;1,100..900&amp;family=Great+Vibes&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
```
Thay thế bằng cách thêm `family=Alex+Brush` vào đường dẫn Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&amp;family=Montserrat:ital,wght@0,100..900;1,100..900&amp;family=Great+Vibes&amp;family=Alex+Brush&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
```

- [ ] **Step 2: Cập nhật CSS tùy chỉnh trong `index.html`**

Tìm dòng:
```css
      .font-script { font-family: 'Great Vibes', cursive; }
```
Thay thế/bổ sung thêm class `.font-alex` cho font Alex Brush:
```css
      .font-script { font-family: 'Great Vibes', cursive; }
      .font-alex { font-family: 'Alex Brush', cursive; }
```

- [ ] **Step 3: Cấu hình font trong `tailwind.config.js`**

Tìm khối `fontFamily` trong `tailwind.config.js`:
```javascript
      fontFamily: {
        'headline-sm': ['Playfair Display', 'serif'],
        'body-md': ['Montserrat', 'sans-serif'],
        'display-lg-mobile': ['Playfair Display', 'serif'],
        'body-lg': ['Montserrat', 'sans-serif'],
        'label-caps': ['Montserrat', 'sans-serif'],
        'display-lg': ['Playfair Display', 'serif'],
        'headline-md': ['Playfair Display', 'serif'],
        script: ['Great Vibes', 'cursive'],
      },
```
Bổ sung `alex: ['Alex Brush', 'cursive']` vào cấu hình:
```javascript
      fontFamily: {
        'headline-sm': ['Playfair Display', 'serif'],
        'body-md': ['Montserrat', 'sans-serif'],
        'display-lg-mobile': ['Playfair Display', 'serif'],
        'body-lg': ['Montserrat', 'sans-serif'],
        'label-caps': ['Montserrat', 'sans-serif'],
        'display-lg': ['Playfair Display', 'serif'],
        'headline-md': ['Playfair Display', 'serif'],
        script: ['Great Vibes', 'cursive'],
        alex: ['Alex Brush', 'cursive'],
      },
```

- [ ] **Step 4: Commit thay đổi cấu hình font**

```bash
git add index.html tailwind.config.js
git commit -m "feat: load and configure Alex Brush script font in index.html and tailwind config"
```

---

### Task 2: Áp dụng font nghệ thuật cho tên Cô dâu & Chú rể ở phần Hero

**Files:**
- Modify: `index.html:233-248`, `index.html:430-440`

**Interfaces:**
- Consumes: Các class font cấu hình từ Task 1.
- Produces: Tên cô dâu chú rể hiển thị bằng font script lãng mạn.

- [ ] **Step 1: Cập nhật CSS cho `.hero-name` trong `index.html`**

Tìm định nghĩa `.hero-name` ở dòng 233-244:
```css
      .hero-name {
        background: var(--hero-name-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: var(--hero-name-glow);
        font-weight: 600;
        letter-spacing: 0.04em;
        max-width: 100%;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
```
Thay đổi font chữ của `.hero-name` thành font script (`Great Vibes` thông qua class `font-script`), tăng kích thước và bỏ tracking viết hoa (vì font cursive không nên giãn chữ nhiều):
```css
      .hero-name {
        font-family: 'Great Vibes', cursive;
        background: var(--hero-name-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: var(--hero-name-glow);
        max-width: 100%;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
```

- [ ] **Step 2: Cập nhật các class hiển thị tên tại phần HTML Hero**

Tìm phần hiển thị tên cô dâu chú rể ở dòng 430-440:
```html
<h1 class="hero-name font-headline-md text-6xl md:text-[84px] leading-tight mb-2 tracking-wide reveal reveal-up reveal-delay-1" id="hero-groom-name"></h1>
<span class="hero-ampersand font-script text-6xl md:text-8xl my-4 reveal reveal-scale reveal-delay-2">&amp;</span>
<h1 class="hero-name font-headline-md text-6xl md:text-[84px] leading-tight mb-8 tracking-wide reveal reveal-up reveal-delay-3" id="hero-bride-name"></h1>
```
Thay thế bằng cách gỡ bỏ class tiêu đề serif (`font-headline-md`) và tăng kích thước hiển thị (`text-7xl md:text-[96px]`) cho phù hợp với font script mềm mại:
```html
<h1 class="hero-name text-7xl md:text-[96px] leading-tight mb-2 reveal reveal-up reveal-delay-1" id="hero-groom-name"></h1>
<span class="hero-ampersand font-alex text-7xl md:text-9xl my-4 reveal reveal-scale reveal-delay-2">&amp;</span>
<h1 class="hero-name text-7xl md:text-[96px] leading-tight mb-8 reveal reveal-up reveal-delay-3" id="hero-bride-name"></h1>
```
*Lưu ý:* Sử dụng `font-alex` (Alex Brush) cho ký tự `&` để tạo sự cách điệu khác biệt tinh tế so với tên dùng `Great Vibes`.

- [ ] **Step 3: Commit thay đổi**

```bash
git add index.html
git commit -m "style: apply cursive fonts to groom and bride names and ampersand in Hero section"
```

---

### Task 3: Biên dịch lại CSS và Kiểm thử trực quan

**Files:**
- Modify: `assets/tailwind.css` (Tự động biên dịch)

**Interfaces:**
- Consumes: Cấu hình Tailwind và index.html
- Produces: CSS build cuối cùng hỗ trợ các font mới.

- [ ] **Step 1: Biên dịch lại CSS**

Run: `npm run build:css`
Expected: Biên dịch thành công, hoàn thành trong khoảng 1-2 giây.

- [ ] **Step 2: Chạy server local để kiểm tra**

Chạy: `python3 -m http.server 8080 &`

- [ ] **Step 3: Xác minh hiển thị trên trình duyệt**

Truy cập: `http://localhost:8080/`
Xác minh:
1. Tên chú rể "Đăng Khoa" và cô dâu "Cẩm Nhung" ở phần Hero hiển thị bằng font Great Vibes mềm mại, uốn lượn đẹp mắt, sắc nét với hiệu ứng gradient đỏ vang-hồng đất.
2. Ký tự `&` hiển thị cách điệu bằng font Alex Brush tinh tế.
3. Các phần văn bản nội dung khác giữ nguyên font Montserrat sạch sẽ, hiện đại và cực kì dễ đọc.
4. Đóng tiến trình python server khi hoàn tất.

- [ ] **Step 4: Commit CSS build cuối cùng**

```bash
git add assets/tailwind.css
git commit -m "build: compile tailwind CSS containing new font config"
```
