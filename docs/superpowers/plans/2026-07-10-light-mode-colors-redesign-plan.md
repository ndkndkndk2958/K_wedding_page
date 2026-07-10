# Thiết kế lại màu sắc giao diện Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cập nhật hệ thống màu sắc Light Mode trên trang thiệp cưới theo bảng màu lãng mạn lôi cuốn Warm Terracotta & Deep Wine để nâng cao tính thẩm mỹ và độ tương phản (đáp ứng chuẩn WCAG AA).

**Architecture:** 
1. Cập nhật các biến màu (CSS custom properties) của bảng màu `light` trong `colors.js`.
2. Cập nhật các giá trị tĩnh liên quan đến màu sắc cũ trong `index.html` (màu bóng đổ glassmorphism, màu sóng xung động music pulse, nền menu điện thoại).
3. Biên dịch lại CSS bằng Tailwind CLI (`npm run build:css`).

**Tech Stack:** JavaScript, HTML5, CSS Variables, Tailwind CSS (v3).

## Global Constraints
- Đảm bảo giữ nguyên các cấu hình của chế độ Dark Mode (`dark` theme).
- Đảm bảo toàn bộ chữ và nút bấm chính trên Light Mode đạt độ tương phản tối thiểu 4.5:1 (chuẩn WCAG AA).
- Không tự ý tái cấu trúc file cấu trúc chung của dự án khi không cần thiết.

---

### Task 1: Cập nhật màu sắc Light Mode trong `colors.js`

**Files:**
- Modify: `colors.js:5-40`

**Interfaces:**
- Consumes: None
- Produces: Hệ thống biến màu sắc `light` trong `THEME_PALETTES`.

- [ ] **Step 1: Cập nhật các giá trị màu sắc trong `colors.js`**

Thay thế khối `light` trong `THEME_PALETTES` bằng các giá trị màu mới.

```javascript
    light: {
        primary: '#B0656B',
        secondary: '#F8ECEB',
        tertiary: '#90474D',
        background: '#FDF8F7',
        surface: '#FCF3F2',
        surfaceLowest: '#FCF3F2',
        onBackground: '#4A1519',
        onSurface: '#4A1519',
        onSurfaceVariant: 'rgba(74, 21, 25, 0.7)',
        outline: '#B0656B',
        outlineVariant: '#E2C8CA',
        surfaceContainer: '#F8ECEB',
        card: '#ffffff',
        surfaceContainerHigh: '#ffffff',
        surfaceContainerHighest: '#ffffff',
        hero: {
            nameGradient: 'linear-gradient(135deg, #4A1519 0%, #B0656B 45%, #D68F95 70%, #4A1519 100%)',
            nameGlow: 'drop-shadow(0 2px 8px rgba(74, 21, 25, 0.3)) drop-shadow(0 4px 20px rgba(176, 101, 107, 0.2))',
            ampersand: '#B0656B',
            dateText: '#4A1519',
            halo: 'radial-gradient(ellipse at center, rgba(176, 101, 107, 0.2) 0%, rgba(253, 248, 247, 0.15) 50%, transparent 70%)',
            divider: 'linear-gradient(90deg, transparent, rgba(176, 101, 107, 0.8), rgba(248, 236, 235, 1), rgba(176, 101, 107, 0.8), transparent)',
            dividerGlow: '0 0 12px rgba(176, 101, 107, 0.4)',
            ampersandGlow: '0 0 25px rgba(176, 101, 107, 0.5), 0 0 50px rgba(144, 71, 77, 0.3), 0 1px 10px rgba(74, 21, 25, 0.3)',
        },
        petals: ['#F2D6D8', '#E3B5B8', '#C58C91'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(176, 101, 107, 0.35) 30%, rgba(176, 101, 107, 0.55) 50%, rgba(176, 101, 107, 0.35) 70%, transparent 95%)',
        musicPulse: 'rgba(176, 101, 107, 0.4)',
        form: { error: '#8B0000', success: '#B0656B' },
        glass: {
            background: 'rgba(253, 248, 247, 0.65)',
            border: 'rgba(176, 101, 107, 0.2)',
        },
    },
```

- [ ] **Step 2: Chạy kiểm tra cú pháp file javascript**

Chạy: `node -c colors.js`
Expected: Không có lỗi cú pháp nào xuất hiện.

- [ ] **Step 3: Commit các thay đổi màu sắc**

```bash
git add colors.js
git commit -m "feat: update light mode colors to Warm Terracotta & Deep Wine"
```

---

### Task 2: Cập nhật các màu tĩnh trong `index.html`

**Files:**
- Modify: `index.html` (Các dòng chứa mã màu RGB cũ của music pulse, glass shadow và mobile menu)

**Interfaces:**
- Consumes: Cấu trúc biến màu trong Task 1.
- Produces: CSS được đồng bộ với tông màu mới trên `index.html`.

- [ ] **Step 1: Cập nhật bóng đổ của Glassmorphism Navigation**

Tìm dòng `box-shadow` dưới `.glass-nav` ở chế độ sáng (dòng 106):
```css
        box-shadow:
          0 4px 18px rgba(130, 60, 60, 0.2),
          0 2px 6px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
```
Sửa thành shadow màu Deep Wine thẫm:
```css
        box-shadow:
          0 4px 18px rgba(74, 21, 25, 0.25),
          0 2px 6px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
```

- [ ] **Step 2: Cập nhật màu nền Mobile Menu Overlay**

Tìm dòng `html.light #mobile-menu` (dòng 134-136):
```css
      html.light #mobile-menu {
        background: rgba(225, 130, 130, 0.7);
      }
```
Sửa thành màu của Warm Terracotta ấm:
```css
      html.light #mobile-menu {
        background: rgba(176, 101, 107, 0.85);
      }
```

- [ ] **Step 3: Cập nhật màu kết thúc của Music Pulse**

Tìm `@keyframes musicPulse` ở dòng 207-210:
```css
      @keyframes musicPulse {
        0%, 100% { box-shadow: 0 0 0 0 var(--music-pulse); }
        50% { box-shadow: 0 0 0 8px rgba(212, 163, 163, 0); }
      }
```
Sửa `rgba(212, 163, 163, 0)` (hồng nhạt cũ) thành `rgba(176, 101, 107, 0)` (hồng đất mới):
```css
      @keyframes musicPulse {
        0%, 100% { box-shadow: 0 0 0 0 var(--music-pulse); }
        50% { box-shadow: 0 0 0 8px rgba(176, 101, 107, 0); }
      }
```

- [ ] **Step 4: Commit thay đổi trong `index.html`**

```bash
git add index.html
git commit -m "style: update static inline styles and transitions in index.html for color sync"
```

---

### Task 3: Biên dịch lại CSS và Kiểm thử

**Files:**
- Modify: `assets/tailwind.css` (Tự động biên dịch)

**Interfaces:**
- Consumes: `colors.js`, `index.html`, `tailwind.config.js`
- Produces: CSS build cuối cùng áp dụng cho trang web.

- [ ] **Step 1: Biên dịch lại CSS bằng Tailwind**

Run: `npm run build:css`
Expected: Biên dịch thành công mà không có lỗi. File `assets/tailwind.css` được làm mới.

- [ ] **Step 2: Chạy server local để kiểm thử**

Khởi động server thử nghiệm bằng python:
`python3 -m http.server 8080 &`

- [ ] **Step 3: Kiểm tra trực quan trên trình duyệt**

Truy cập: `http://localhost:8080/`
Xác minh:
1. Chuyển đổi qua lại giữa Light/Dark mode hoạt động mượt mà.
2. Ở Light Mode, tông màu kem ấm hiển thị hài hòa, các dòng chữ chính (`onBackground`) hiển thị cực kì đậm nét, dễ đọc.
3. Các nút bấm chính và phụ có tương phản rõ rệt, màu chữ trắng trên nền hồng đất nổi bật và tinh tế.
4. Tên hai nhân vật chính hiển thị hiệu ứng gradient đỏ vang - hồng đất lấp lánh đẹp mắt trên banner đầu trang.

- [ ] **Step 4: Dọn dẹp tiến trình server chạy ngầm**

Chạy lệnh kill tiến trình python server (ví dụ: `kill %1` hoặc tìm PID của python server và kill).

- [ ] **Step 5: Commit CSS được build**

```bash
git add assets/tailwind.css
git commit -m "build: compile assets/tailwind.css with new light theme styles"
```
