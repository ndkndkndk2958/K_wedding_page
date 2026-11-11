# Luxury Modern UI/UX Redesign (Light & Dark Mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp toàn diện UI/UX trang web thiệp mời cưới theo phong cách "Quiet Luxury & High-End Editorial Stationery" hiện đại, sang trọng và đồng bộ hoàn hảo cho cả Light Mode (Editorial Ivory & Champagne Bronze) lẫn Dark Mode (Midnight Velvet & Luminous Champagne Gold).

**Architecture:**
1. Chuẩn hóa hệ thống Design Tokens trong `colors.js` và `tailwind.config.js` (sửa lỗi `rounded-full` bị ghi đè thành `0.75rem`, bổ sung thang bo góc và bảng màu Quiet Luxury đạt chuẩn tương phản WCAG AA/AAA cho cả 2 chế độ sáng/tối).
2. Nâng cấp CSS hệ thống trong `index.html`: hiệu ứng Ken Burns cho Hero slideshow, mặt kính Glassmorphism tinh tế, khung viền kép kiểu thiệp ép kim (double-inset border), hiệu ứng hover gallery và thanh cuộn tùy chỉnh.
3. Tái cấu trúc giao diện các phân khu (`#home`, `#intro`, `#gallery`, `#events`, `#rsvp`, `footer`, `#mobile-menu`) theo bố cục tạp chí cao cấp (Editorial Layout), bảo toàn 100% ID phần tử và toàn bộ logic JavaScript hiện có.

**Tech Stack:** HTML5, CSS3 Custom Properties, Tailwind CSS v3.4, Vanilla JavaScript.

## Global Constraints

- Bảo toàn tuyệt đối toàn bộ tính năng và ID DOM hiện tại (`#home`, `#intro`, `#gallery`, `#events`, `#rsvp`, `#hero-slideshow`, `#hero-overlay`, `#hero-groom-name`, `#hero-bride-name`, `#hero-date`, `#hero-invitation`, `#slideshow-dots`, `#scroll-hint`, `#groom-photo`, `#groom-name`, `#groom-father`, `#groom-mother`, `#bride-photo`, `#bride-name`, `#bride-father`, `#bride-mother`, `#gallery-container`, `#event-title`, `#event-time`, `#event-date`, `#event-venue`, `#event-address`, `#event-maps-link`, `#rsvp-form`, `#wsvp-form`/`#wishes-form`, `#wishes-display`, `#lightbox`, `#form-popup`, `#music-btn`, `#theme-toggle`, `#menu-btn`, `#back-to-top`).
- Không tự động chạy `git commit` trừ khi người dùng yêu cầu rõ ràng.
- Độ tương phản chữ chính (`onBackground`, `onSurface`) trên nền đạt chuẩn tối thiểu WCAG AA (4.5:1) ở cả Light Mode và Dark Mode.

---

### Task 1: Chuẩn hóa cấu hình Tailwind CSS và sửa lỗi Border Radius trong `tailwind.config.js`

**Files:**
- Modify: `tailwind.config.js:24-58`

**Interfaces:**
- Consumes: CSS Custom Properties từ `colors.js`
- Produces: Các class tiện ích Tailwind (`rounded-full`, `rounded-2xl`, `rounded-3xl`, `shadow-luxury`, `shadow-luxury-dark`) hoạt động chuẩn xác.

- [ ] **Step 1: Cập nhật `borderRadius` và `boxShadow` trong `tailwind.config.js`**

Mở `tailwind.config.js` và cập nhật khối `borderRadius` (khôi phục `full: '9999px'` để các nút tròn, chấm slideshow và khung ảnh tròn hiển thị đúng hình tròn) cùng với `boxShadow` sang trọng:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './config.src.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-lowest': 'var(--color-surface-lowest)',
        'on-background': 'var(--color-on-background)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',
        'surface-container': 'var(--color-surface-container)',
        card: 'var(--color-card)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        luxury: '0 20px 50px -12px rgba(36, 28, 24, 0.08), 0 4px 16px -4px rgba(36, 28, 24, 0.04)',
        'luxury-lg': '0 28px 65px -15px rgba(36, 28, 24, 0.14), 0 8px 24px -6px rgba(36, 28, 24, 0.06)',
      },
      spacing: {
        gutter: '24px',
        'margin-mobile': '20px',
        'section-gap-mobile': '72px',
        'container-max': '1140px',
        'section-gap-desktop': '120px',
        unit: '8px',
      },
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
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-lg-mobile': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'headline-md': ['36px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'headline-sm': ['24px', { lineHeight: '1.4' }],
        'body-lg': ['18px', { lineHeight: '1.7' }],
        'body-md': ['15px', { lineHeight: '1.7' }],
        'label-caps': ['11px', { lineHeight: '1.5', letterSpacing: '0.2em' }],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

- [ ] **Step 2: Kiểm tra cú pháp `tailwind.config.js`**

Run: `node -c tailwind.config.js`
Expected: Không có lỗi cú pháp.

---

### Task 2: Nâng cấp hệ thống bảng màu Quiet Luxury cho Light Mode & Dark Mode trong `colors.js`

**Files:**
- Modify: `colors.js:5-76`

**Interfaces:**
- Consumes: `document.documentElement.classList` (`light` / `dark`)
- Produces: Biến CSS `--color-*`, `--hero-*`, `--glass-*`, `--section-divider`, `--music-pulse`, `--petal-default` cho cả Light Mode (Editorial Silk Ivory & Champagne Bronze) và Dark Mode (Midnight Obsidian & Luminous Champagne Gold).

- [ ] **Step 1: Cập nhật `THEME_PALETTES` trong `colors.js`**

Thay thế đối tượng `THEME_PALETTES` trong `colors.js` bằng bảng màu hiện đại, sang trọng mới:

```javascript
const THEME_PALETTES = {
    light: {
        primary: '#9A6B56',                  // Burnished Rose Bronze — sang trọng, ấm áp
        secondary: '#E8DDD1',                // Soft Champagne Silk
        tertiary: '#734B3A',                 // Deep Espresso Bronze
        background: '#FAF7F2',               // Editorial Silk Ivory
        surface: '#F4EFE7',                  // Warm Pearl Cream
        surfaceLowest: '#EFE8DD',            // Cashmere Cream
        onBackground: '#261C18',             // Deep Espresso Charcoal (WCAG AAA)
        onSurface: '#261C18',                // Deep Espresso Charcoal
        onSurfaceVariant: 'rgba(38, 28, 24, 0.68)',
        outline: '#C2A88E',                  // Champagne Gold Line
        outlineVariant: '#E4DAD0',           // Delicate Ivory Hairline
        surfaceContainer: '#F3ECE2',         // Elevated Cream Container
        card: '#FFFFFF',                     // Pure Crisp Paper Card
        surfaceContainerHigh: '#FFFFFF',
        surfaceContainerHighest: '#FFFFFF',
        hero: {
            nameGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFF6EE 40%, #F3DEC8 75%, #FFFFFF 100%)',
            nameGlow: 'drop-shadow(0 4px 18px rgba(18, 12, 10, 0.45)) drop-shadow(0 2px 6px rgba(154, 107, 86, 0.35))',
            ampersand: '#F3DEC8',
            dateText: '#FFFDF9',
            halo: 'radial-gradient(ellipse at center, rgba(18, 12, 10, 0.28) 0%, rgba(18, 12, 10, 0.12) 48%, transparent 72%)',
            divider: 'linear-gradient(90deg, transparent, rgba(243, 222, 200, 0.85), #FFFFFF, rgba(243, 222, 200, 0.85), transparent)',
            dividerGlow: '0 0 14px rgba(243, 222, 200, 0.45)',
            ampersandGlow: '0 0 28px rgba(243, 222, 200, 0.55), 0 2px 12px rgba(0, 0, 0, 0.45)',
        },
        petals: ['#F2E2D8', '#E6CEC0', '#D4B2A0'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(194, 168, 142, 0.35) 30%, rgba(154, 107, 86, 0.6) 50%, rgba(194, 168, 142, 0.35) 70%, transparent 95%)',
        musicPulse: 'rgba(154, 107, 86, 0.38)',
        form: { error: '#9E2A2B', success: '#6B705C' },
        glass: {
            background: 'rgba(250, 247, 242, 0.76)',
            border: 'rgba(194, 168, 142, 0.45)',
        },
    },
    dark: {
        primary: '#DFC19D',                  // Luminous Champagne Gold
        secondary: '#B89B78',                // Antique Warm Bronze
        tertiary: '#CCA67E',                 // Burnished Gold Hover
        background: '#0F0D0C',               // Midnight Velvet Obsidian
        surface: '#151210',                  // Rich Espresso Night
        surfaceLowest: '#0A0908',            // Deepest Onyx
        onBackground: '#F4EFE8',             // Crisp Silk Parchment
        onSurface: '#F4EFE8',                // Crisp Silk Parchment
        onSurfaceVariant: 'rgba(244, 239, 232, 0.68)',
        outline: '#7A6550',                  // Muted Gold Border
        outlineVariant: '#332B24',           // Subtle Dark Bronze Hairline
        surfaceContainer: '#1A1614',         // Velvet Card Container
        card: '#211C19',                     // Elevated Obsidian Card
        surfaceContainerHigh: '#28221E',
        surfaceContainerHighest: '#322B26',
        hero: {
            nameGradient: 'linear-gradient(150deg, #FFFFFF 0%, #F7E7D3 38%, #DFC19D 72%, #FFFFFF 100%)',
            nameGlow: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.65)) drop-shadow(0 2px 14px rgba(223, 193, 157, 0.3))',
            ampersand: '#DFC19D',
            dateText: '#F7E7D3',
            halo: 'radial-gradient(ellipse at center, rgba(15, 13, 12, 0.42) 0%, rgba(15, 13, 12, 0.18) 50%, transparent 72%)',
            divider: 'linear-gradient(90deg, transparent, rgba(223, 193, 157, 0.75), rgba(255, 255, 255, 0.9), rgba(223, 193, 157, 0.75), transparent)',
            dividerGlow: '0 0 16px rgba(223, 193, 157, 0.4)',
            ampersandGlow: '0 0 36px rgba(223, 193, 157, 0.5), 0 2px 16px rgba(0, 0, 0, 0.5)',
        },
        petals: ['#DFC19D', '#6E5340', '#4A372B'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(122, 101, 80, 0.3) 30%, rgba(223, 193, 157, 0.55) 50%, rgba(122, 101, 80, 0.3) 70%, transparent 95%)',
        musicPulse: 'rgba(223, 193, 157, 0.38)',
        form: { error: '#FFB4AB', success: '#DFC19D' },
        glass: {
            background: 'rgba(26, 22, 20, 0.72)',
            border: 'rgba(223, 193, 157, 0.25)',
        },
    },
};
```

- [ ] **Step 2: Kiểm tra cú pháp `colors.js`**

Run: `node -c colors.js`
Expected: Không có lỗi cú pháp.

---

### Task 3: Nâng cấp CSS hiệu ứng sang trọng (Glassmorphism, Ken Burns Slideshow, Luxury Framing & Mobile Menu) trong `index.html`

**Files:**
- Modify: `index.html:138-335`

**Interfaces:**
- Consumes: CSS Variables từ `colors.js`
- Produces: Các class `.glass-nav`, `#mobile-menu`, `.slideshow-image`, `.luxury-card`, `.ornament-line`, `.gallery-item` với hiệu ứng hiện đại cho cả Light và Dark Mode.

- [ ] **Step 1: Cập nhật phần `<style>` trong `index.html` (từ `.slideshow-image` đến `.hero-date-text`)**

Thay thế đoạn CSS từ `.slideshow-image` (dòng 138) đến `.hero-date-text` (dòng 331) trong `index.html` bằng bộ style tinh chỉnh:

```css
    .slideshow-image {
      transition: opacity 1.8s cubic-bezier(0.22, 1, 0.36, 1), transform 8s ease-out;
      transform: scale(1.06);
    }

    .slideshow-image.active-slide {
      transform: scale(1);
    }

    /* Glassmorphism Navigation */
    .glass-nav {
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      box-shadow:
        0 8px 24px -4px rgba(38, 28, 24, 0.14),
        0 2px 6px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    html.dark .glass-nav {
      box-shadow:
        0 8px 28px -4px rgba(0, 0, 0, 0.65),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .glass-nav .glass-nav-icon {
      font-size: 1.5rem;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      color: var(--color-tertiary);
      transition: transform 0.3s ease, color 0.3s ease;
    }

    html.dark .glass-nav .glass-nav-icon {
      color: var(--color-primary);
    }

    /* Full Screen Menu */
    #mobile-menu {
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
      transform: translateY(-100%);
      opacity: 0;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }

    html.light #mobile-menu {
      background: rgba(250, 247, 242, 0.94);
    }

    html.dark #mobile-menu {
      background: rgba(15, 13, 12, 0.94);
    }

    #mobile-menu.active {
      transform: translateY(0);
      opacity: 1;
    }

    #mobile-menu nav a {
      position: relative;
      transition: color 0.3s ease, transform 0.3s ease;
      color: var(--color-on-background);
    }

    #mobile-menu nav a::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -6px;
      width: 0;
      height: 1px;
      background: var(--color-primary);
      transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), left 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }

    #mobile-menu nav a:hover {
      color: var(--color-primary);
    }

    #mobile-menu nav a:hover::after {
      width: 48%;
      left: 26%;
    }

    /* Gallery grid */
    .gallery-item {
      aspect-ratio: 3 / 4;
      position: relative;
    }

    .gallery-item img {
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .gallery-item:hover img {
      transform: scale(1.05);
    }

    .gallery-item::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 13, 12, 0.35) 0%, transparent 45%);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .gallery-item:hover::after {
      opacity: 1;
    }

    /* Ảnh lẻ cuối cùng — căn giữa (2 cột mobile, item trực tiếp trong grid) */
    #gallery-container>.gallery-item:last-child:nth-child(odd) {
      grid-column: 1 / -1;
      justify-self: center;
      width: calc((100% - 1rem) / 2);
    }

    /* Hàng cuối lẻ — căn giữa bằng flex (tablet+ 3 cột) */
    .gallery-last-row {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: 1rem;
      width: 100%;
    }

    .gallery-last-row__item {
      flex-shrink: 0;
      width: calc((100% - 1rem) / 2);
    }

    @media (min-width: 768px) {
      #gallery-container>.gallery-item:last-child:nth-child(odd) {
        grid-column: auto;
        justify-self: auto;
        width: auto;
      }

      .gallery-last-row {
        gap: 1.75rem;
      }

      .gallery-last-row__item {
        width: calc((100% - 3.5rem) / 3);
      }
    }

    /* Music toggle pulse when playing */
    #music-btn.playing {
      animation: musicPulse 2.2s ease-in-out infinite;
    }

    @keyframes musicPulse {
      0%,
      100% {
        box-shadow: 0 0 0 0 var(--music-pulse);
      }

      50% {
        box-shadow: 0 0 0 10px rgba(154, 107, 86, 0);
      }
    }

    /* Hero — Editorial Luxury Typography */
    .hero-content {
      will-change: transform, opacity;
      width: 100%;
      max-width: 100%;
    }

    .hero-names-wrap {
      position: relative;
      padding: 1.5rem 1rem;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .hero-names-wrap::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--hero-halo);
      pointer-events: none;
      z-index: -1;
    }

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

    .hero-ampersand {
      color: var(--hero-ampersand);
      text-shadow: var(--hero-ampersand-glow);
    }

    .hero-divider {
      background: var(--hero-divider);
      height: 1px;
      box-shadow: var(--hero-divider-glow);
    }

    .hero-date-text {
      color: var(--hero-date-text);
    }
```

- [ ] **Step 2: Cập nhật hàm `initHeaderSlideshow` và `showSlide` trong `index.html` để đồng bộ hiệu ứng Ken Burns và chấm chỉ báo dạng viên thuốc (pill indicator)**

Trong `index.html` (khoảng dòng 1226-1246 và 1466-1484), cập nhật `initHeaderSlideshow` và `showSlide`:

```javascript
      function initHeaderSlideshow(headerImages) {
        const container = document.getElementById('hero-slideshow');
        const overlay = document.getElementById('hero-overlay');

        headerImages.forEach((url, i) => {
          const slide = document.createElement('div');
          slide.className = `slideshow-image absolute inset-0 bg-cover bg-center ${i === 0 ? 'active-slide' : ''}`;
          slide.style.backgroundImage = `url('${url}')`;
          slide.style.opacity = i === 0 ? '1' : '0';
          container.insertBefore(slide, overlay);
        });

        const dotsContainer = document.getElementById('slideshow-dots');
        dotsContainer.innerHTML = '';
        headerImages.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.setAttribute('aria-label', `Ảnh ${i + 1}`);
          dot.className = `h-1.5 rounded-full transition-all duration-500 ${i === 0 ? 'w-8 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'}`;
          dot.addEventListener('click', () => goToSlide(i));
          dotsContainer.appendChild(dot);
        });
      }
```

Và cập nhật `showSlide(index)`:

```javascript
      function showSlide(index) {
        const slides = getSlides();
        const dots = getDots();
        if (!slides.length) return;

        slides.forEach((slide, i) => {
          slide.style.opacity = i === index ? '1' : '0';
          slide.classList.toggle('active-slide', i === index);
        });
        dots.forEach((dot, i) => {
          if (i === index) {
            dot.classList.add('w-8', 'bg-white');
            dot.classList.remove('w-2', 'bg-white/45');
          } else {
            dot.classList.remove('w-8', 'bg-white');
            dot.classList.add('w-2', 'bg-white/45');
          }
        });
        currentSlide = index;
      }
```

Và cập nhật `createGalleryItem(src, index)`:

```javascript
      function createGalleryItem(src, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-item reveal reveal-up overflow-hidden rounded-2xl bg-card p-1.5 md:p-2.5 shadow-luxury border border-outline-variant/80';
        wrapper.style.transitionDelay = `${(index % 3) * 0.1}s`;
        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover rounded-xl prevent-download';
        img.src = src;
        img.alt = `Ảnh cưới ${index + 1}`;
        img.loading = 'lazy';
        img.setAttribute('draggable', 'false');
        wrapper.appendChild(img);

        wrapper.addEventListener('click', () => openLightbox(index));

        return wrapper;
      }
```

Và cập nhật phần tạo thẻ lời chúc mới trong `initWishesForm` (khoảng dòng 1810-1816):

```javascript
            const display = document.getElementById('wishes-display');
            const newWish = document.createElement('div');
            newWish.className = 'bg-surface/70 dark:bg-surface-container p-6 md:p-8 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm fade-in';
            newWish.innerHTML = `
                    <p class="font-body-md italic text-on-surface mb-4 leading-relaxed">"${message.replace(/"/g, '&quot;')}"</p>
                    <p class="font-label-caps text-label-caps text-primary tracking-widest">— ${name.replace(/</g, '&lt;')}</p>
                `;
            display.prepend(newWish);
```

---

### Task 4: Thiết kế lại Bố cục HTML theo phong cách Luxury Editorial trong `index.html`

**Files:**
- Modify: `index.html:577-884`

**Interfaces:**
- Consumes: Các class Tailwind & CSS Variables từ Task 1, 2, 3.
- Produces: Giao diện hoàn chỉnh cho Floating Navigation, Full-screen Editorial Menu, Hero Section, Couple & Family Section, Gallery Section, Event Invitation Card, RSVP & Guestbook 2 cột trên Desktop, Footer và Modals.

- [ ] **Step 1: Cập nhật toàn bộ khối HTML `<body>` (từ dòng 577 đến dòng 884 trước `<script src="config.js"></script>`)**

Thay thế đoạn HTML từ `<!-- Music & Theme toggles -->` (dòng 577) đến hết `#form-popup` (dòng 883) bằng cấu trúc Editorial Luxury dưới đây:

```html
  <!-- Music & Theme toggles -->
  <div class="fixed safe-fixed-tl z-[100] flex flex-col gap-3">
    <button aria-label="Bật/tắt nhạc nền"
      class="glass-nav w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
      id="music-btn" title="Nhạc nền">
      <span class="material-symbols-outlined glass-nav-icon" id="music-icon">volume_off</span>
    </button>
    <button aria-label="Bật/tắt chế độ tối"
      class="glass-nav w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
      id="theme-toggle" title="Chế độ tối">
      <span class="material-symbols-outlined glass-nav-icon" id="theme-icon">dark_mode</span>
    </button>
  </div>
  <audio id="bg-music" loop preload="auto"></audio>

  <!-- Modern Hamburger Navigation -->
  <header class="fixed safe-fixed-tr z-[100]">
    <button aria-label="Mở menu điều hướng"
      class="glass-nav w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
      id="menu-btn">
      <span class="material-symbols-outlined glass-nav-icon" id="menu-icon">menu</span>
    </button>
  </header>

  <!-- Full-screen Editorial Menu Overlay -->
  <div class="fixed inset-0 z-[90] flex flex-col items-center justify-center hidden px-6" id="mobile-menu">
    <div class="text-center mb-10">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase mb-3">Wedding Invitation</p>
      <div class="h-px w-16 bg-outline/50 mx-auto"></div>
    </div>
    <nav class="flex flex-col gap-7 text-center">
      <a class="font-headline-sm text-2xl md:text-3xl italic" href="#home" onclick="toggleMenu()">Phần Mở Đầu</a>
      <a class="font-headline-sm text-2xl md:text-3xl italic" href="#intro" onclick="toggleMenu()">Gia Đình &amp; Cặp Đôi</a>
      <a class="font-headline-sm text-2xl md:text-3xl italic" href="#gallery" onclick="toggleMenu()">Album Hình Cưới</a>
      <a class="font-headline-sm text-2xl md:text-3xl italic" href="#events" onclick="toggleMenu()">Sự Kiện Trọng Đại</a>
      <a class="font-headline-sm text-2xl md:text-3xl italic" href="#rsvp" onclick="toggleMenu()">Xác Nhận &amp; Lời Chúc</a>
    </nav>
    <div class="mt-12 flex items-center gap-3 text-outline/70">
      <div class="h-px w-10 bg-outline/40"></div>
      <span class="material-symbols-outlined text-sm text-primary" style="font-variation-settings: 'FILL' 1;">favorite</span>
      <div class="h-px w-10 bg-outline/40"></div>
    </div>
  </div>

  <!-- 1. Hero Slideshow Banner -->
  <section
    class="relative hero-screen flex flex-col items-center justify-center text-center overflow-hidden overflow-x-clip"
    id="home">
    <div class="absolute inset-0 z-0" id="hero-slideshow">
      <div class="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65 dark:from-black/60 dark:via-black/40 dark:to-black/75" id="hero-overlay"></div>
    </div>
    <div class="relative z-10 fade-in text-white px-gutter hero-content max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-3 mb-4 reveal reveal-up">
        <span class="h-px w-8 bg-white/60"></span>
        <span class="font-label-caps text-[11px] tracking-[0.35em] uppercase text-white/90">The Wedding Celebration</span>
        <span class="h-px w-8 bg-white/60"></span>
      </div>
      <div class="flex flex-col items-center hero-names-wrap">
        <h1 class="hero-name text-7xl md:text-[96px] leading-tight mb-1 reveal reveal-up reveal-delay-1"
          id="hero-groom-name"></h1>
        <span class="hero-ampersand font-alex text-6xl md:text-8xl my-2 reveal reveal-scale reveal-delay-2">&amp;</span>
        <h1 class="hero-name text-7xl md:text-[96px] leading-tight mb-6 reveal reveal-up reveal-delay-3"
          id="hero-bride-name"></h1>
      </div>
      <div class="hero-divider w-40 mx-auto mb-6 reveal reveal-scale reveal-delay-3"></div>
      <div class="inline-block px-7 py-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 mb-5 reveal reveal-up reveal-delay-3">
        <p class="font-headline-sm text-lg md:text-2xl tracking-[0.28em] hero-date-text"
          id="hero-date"></p>
      </div>
      <p class="font-body-lg text-base md:text-lg italic opacity-95 max-w-xl mx-auto text-white/90 drop-shadow reveal reveal-up reveal-delay-4 leading-relaxed"
        id="hero-invitation"></p>
    </div>
    <div class="absolute bottom-8 left-0 right-0 z-20 hero-bottom-controls">
      <div id="slideshow-dots"></div>
      <a aria-label="Cuộn xuống" class="text-white/85 hover:text-white transition-opacity" href="#intro" id="scroll-hint">
        <span class="material-symbols-outlined text-3xl animate-bounce block">keyboard_double_arrow_down</span>
      </a>
    </div>
  </section>

  <div aria-hidden="true" class="section-divider reveal"></div>

  <!-- 2. Introduction Section (Couple & Families) -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop max-w-container-max mx-auto px-margin-mobile md:px-gutter scroll-section"
    id="intro">
    <div class="text-center mb-16 md:mb-20 reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-3">Our Families &amp; Couple</p>
      <h2 class="font-headline-md text-3xl md:text-headline-md text-on-background italic mb-5">Gia Đình &amp; Cặp Đôi</h2>
      <div class="flex items-center justify-center gap-4">
        <div class="h-px w-16 bg-outline/60"></div>
        <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">favorite</span>
        <div class="h-px w-16 bg-outline/60"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 lg:gap-28 items-start">
      <!-- Chú rể -->
      <div class="flex flex-col items-center text-center reveal reveal-left reveal-delay-1 bg-card/70 dark:bg-card/50 p-8 md:p-10 rounded-3xl border border-outline-variant/80 shadow-luxury">
        <div class="relative w-60 h-60 md:w-72 md:h-72 mb-10 p-2.5 rounded-full border border-outline/50 bg-surface-lowest/40 shadow-inner">
          <div class="w-full h-full rounded-full overflow-hidden ring-1 ring-outline/30 shadow-xl">
            <img alt="Chú rể" class="w-full h-full object-cover rounded-full prevent-download"
              id="groom-photo" />
          </div>
          <div
            class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card px-7 py-2 rounded-full shadow-luxury border border-outline/40 min-w-[11rem] max-w-[min(100vw-3rem,17rem)]">
            <p class="font-label-caps text-[10px] tracking-[0.25em] text-on-surface-variant uppercase mb-0.5">Chú Rể</p>
            <h4 class="font-headline-sm text-xl md:text-2xl italic text-primary text-center break-words leading-snug" id="groom-name">
            </h4>
          </div>
        </div>
        <div class="mt-4 pt-6 border-t border-outline-variant/70 w-full max-w-xs space-y-1.5">
          <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.22em] mb-2.5">PHỤ HUYNH NHÀ TRAI</p>
          <p class="font-body-md text-on-surface-variant">Ông: <strong class="text-on-background font-semibold" id="groom-father"></strong></p>
          <p class="font-body-md text-on-surface-variant">Bà: <strong class="text-on-background font-semibold" id="groom-mother"></strong></p>
        </div>
      </div>

      <!-- Cô dâu -->
      <div class="flex flex-col items-center text-center reveal reveal-right reveal-delay-2 bg-card/70 dark:bg-card/50 p-8 md:p-10 rounded-3xl border border-outline-variant/80 shadow-luxury">
        <div class="relative w-60 h-60 md:w-72 md:h-72 mb-10 p-2.5 rounded-full border border-outline/50 bg-surface-lowest/40 shadow-inner">
          <div class="w-full h-full rounded-full overflow-hidden ring-1 ring-outline/30 shadow-xl">
            <img alt="Cô dâu" class="w-full h-full object-cover rounded-full prevent-download"
              id="bride-photo" />
          </div>
          <div
            class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card px-7 py-2 rounded-full shadow-luxury border border-outline/40 min-w-[11rem] max-w-[min(100vw-3rem,17rem)]">
            <p class="font-label-caps text-[10px] tracking-[0.25em] text-on-surface-variant uppercase mb-0.5">Cô Dâu</p>
            <h4 class="font-headline-sm text-xl md:text-2xl italic text-primary text-center break-words leading-snug" id="bride-name">
            </h4>
          </div>
        </div>
        <div class="mt-4 pt-6 border-t border-outline-variant/70 w-full max-w-xs space-y-1.5">
          <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.22em] mb-2.5">PHỤ HUYNH NHÀ GÁI</p>
          <p class="font-body-md text-on-surface-variant">Ông: <strong class="text-on-background font-semibold" id="bride-father"></strong></p>
          <p class="font-body-md text-on-surface-variant">Bà: <strong class="text-on-background font-semibold" id="bride-mother"></strong></p>
        </div>
      </div>
    </div>
  </section>

  <div aria-hidden="true" class="section-divider reveal"></div>

  <!-- 3. Wedding Gallery Grid -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface dark:bg-surface-lowest scroll-section overflow-x-clip" id="gallery">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter mb-14">
      <div class="text-center reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-3">Captured Moments</p>
        <h2 class="font-headline-md text-3xl md:text-headline-md text-on-background italic mb-4">Album Hình Cưới</h2>
        <p class="font-body-md text-on-surface-variant max-w-xl mx-auto italic">Từng nhịp thở, từng ánh mắt, được gói
          trọn trong những khung hình.</p>
      </div>
    </div>
    <div
      class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 max-w-container-max mx-auto px-margin-mobile md:px-gutter pb-8"
      id="gallery-container"></div>
  </section>

  <div aria-hidden="true" class="section-divider reveal"></div>

  <!-- 4. Wedding Banquet Details -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-background scroll-section" id="events">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      <div class="text-center mb-14 md:mb-16 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-3">The Celebration</p>
        <h2 class="font-headline-md text-3xl md:text-headline-md text-on-background italic mb-5">Sự Kiện Trọng Đại</h2>
        <div class="flex items-center justify-center gap-4">
          <div class="h-px w-16 bg-outline/60"></div>
          <span class="material-symbols-outlined text-primary text-lg">diamond</span>
          <div class="h-px w-16 bg-outline/60"></div>
        </div>
      </div>

      <div class="max-w-2xl mx-auto reveal reveal-scale reveal-delay-1">
        <!-- Outer Luxury Stationery Frame -->
        <div class="bg-card p-3 md:p-4 rounded-3xl shadow-luxury-lg border border-outline-variant">
          <!-- Inner Gold-Leaf Border Frame -->
          <div class="border border-outline/40 rounded-2xl p-8 md:p-14 flex flex-col items-center text-center relative overflow-hidden">
            <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline/30">
              <span class="material-symbols-outlined text-3xl text-primary">celebration</span>
            </div>
            <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.25em] uppercase mb-2">Trân Trọng Kính Mời</p>
            <h3 class="font-headline-sm text-3xl md:text-4xl italic text-on-background mb-10" id="event-title"></h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full border-y border-outline-variant/80 py-8">
              <div class="flex flex-col items-center justify-center md:border-r md:border-outline-variant/80 md:pr-6">
                <div class="flex items-center gap-2 text-primary mb-2">
                  <span class="material-symbols-outlined text-lg">schedule</span>
                  <p class="font-label-caps text-label-caps tracking-[0.22em]">THỜI GIAN</p>
                </div>
                <p class="font-headline-sm text-2xl font-semibold text-on-background mb-1" id="event-time"></p>
                <p class="font-body-md text-on-surface-variant" id="event-date"></p>
              </div>

              <div class="flex flex-col items-center justify-center md:pl-6">
                <div class="flex items-center gap-2 text-primary mb-2">
                  <span class="material-symbols-outlined text-lg">location_on</span>
                  <p class="font-label-caps text-label-caps tracking-[0.22em]">ĐỊA ĐIỂM</p>
                </div>
                <p class="font-body-md text-lg font-semibold text-on-background mb-1" id="event-venue"></p>
                <p class="font-body-md text-on-surface-variant italic text-sm" id="event-address"></p>
              </div>
            </div>

            <a class="mt-10 bg-primary text-white dark:text-surface-lowest px-10 py-4 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.22em] transition-all duration-300 hover:bg-tertiary hover:shadow-lg active:scale-95 shadow-md flex items-center gap-3"
              href="#" id="event-maps-link" target="_blank">
              <span class="material-symbols-outlined text-lg">map</span> XEM BẢN ĐỒ CHỈ ĐƯỜNG
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div aria-hidden="true" class="section-divider reveal"></div>

  <!-- 5. RSVP & Wishes Section -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface-container relative scroll-section" id="rsvp">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
      <div class="text-center mb-14 md:mb-16 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-3">R.S.V.P &amp; Guestbook</p>
        <h2 class="font-headline-md text-3xl md:text-headline-md text-on-background italic mb-4">Hiện Diện &amp; Lời Chúc</h2>
        <div class="flex items-center justify-center gap-4">
          <div class="h-px w-16 bg-outline/60"></div>
          <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">favorite</span>
          <div class="h-px w-16 bg-outline/60"></div>
        </div>
      </div>

      <!-- 2-Column Forms on Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto items-stretch">
        <!-- RSVP Form Card -->
        <div class="bg-card p-8 md:p-12 rounded-3xl shadow-luxury border border-outline-variant flex flex-col justify-between reveal reveal-up">
          <div>
            <div class="text-center mb-8 pb-6 border-b border-outline-variant/70">
              <span class="material-symbols-outlined text-3xl text-primary mb-2">mark_email_read</span>
              <h3 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-2">Xác Nhận Tham Dự</h3>
              <p class="font-body-md text-on-surface-variant italic text-sm" id="rsvp-deadline"></p>
            </div>
            <form class="space-y-6" id="rsvp-form" novalidate>
              <div>
                <label
                  class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2.5"
                  for="rsvp-name">Tên của bạn + Mối quan hệ</label>
                <input
                  class="w-full bg-surface/60 dark:bg-surface-lowest/60 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3.5 rounded-xl font-body-md text-on-background placeholder:text-on-surface-variant/50 transition-all outline-none"
                  id="rsvp-name" placeholder="VD: Khoa HDGames, Nhung 12A1..." required type="text" />
                <p class="text-tertiary text-xs mt-1.5 hidden" id="rsvp-name-error"></p>
              </div>
              <div>
                <label
                  class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2.5"
                  for="rsvp-guests">Số lượng khách tham dự</label>
                <input
                  class="w-full bg-surface/60 dark:bg-surface-lowest/60 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3.5 rounded-xl font-body-md text-on-background transition-all outline-none"
                  id="rsvp-guests" inputmode="numeric" max="20" min="1" required type="number" value="1" />
                <p class="text-tertiary text-xs mt-1.5 hidden" id="rsvp-guests-error"></p>
              </div>
              <p class="form-status hidden mb-4" id="rsvp-status"></p>

              <button
                class="w-full bg-primary text-white dark:text-surface-lowest py-4 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.22em] transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                id="rsvp-submit" type="submit">XÁC NHẬN THAM DỰ</button>
            </form>
          </div>
        </div>

        <!-- Wishes Form Card -->
        <div
          class="bg-card p-8 md:p-12 rounded-3xl shadow-luxury border border-outline-variant flex flex-col justify-between reveal reveal-up reveal-delay-1">
          <div>
            <div class="text-center mb-8 pb-6 border-b border-outline-variant/70">
              <span class="material-symbols-outlined text-3xl text-primary mb-2">edit_note</span>
              <h3 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-2">Gửi Lời Chúc Phúc</h3>
              <p class="font-body-md text-on-surface-variant italic text-sm">Mọi lời chúc là món quà vô giá với chúng mình</p>
            </div>
            <form class="space-y-6" id="wishes-form" novalidate>
              <div>
                <label
                  class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2.5"
                  for="wish-name">Tên của bạn + Mối quan hệ</label>
                <input
                  class="w-full bg-surface/60 dark:bg-surface-lowest/60 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3.5 rounded-xl font-body-md text-on-background placeholder:text-on-surface-variant/50 transition-all outline-none"
                  id="wish-name" placeholder="VD: Khoa HDGames, Nhung 12A1..." required type="text" />
                <p class="text-tertiary text-xs mt-1.5 hidden" id="wish-name-error"></p>
              </div>
              <div>
                <label
                  class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2.5"
                  for="wish-message">Lời chúc tốt đẹp</label>
                <textarea
                  class="w-full bg-surface/60 dark:bg-surface-lowest/60 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3.5 rounded-xl font-body-md text-on-background placeholder:text-on-surface-variant/50 resize-none transition-all outline-none"
                  id="wish-message" placeholder="Nhập lời chúc phúc của bạn gửi tới cô dâu & chú rể..." required
                  rows="3"></textarea>
                <p class="text-tertiary text-xs mt-1.5 hidden" id="wish-message-error"></p>
              </div>
              <p class="form-status hidden mb-4" id="wish-status"></p>

              <button
                class="w-full bg-primary text-white dark:text-surface-lowest py-4 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.22em] transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                id="wish-submit" type="submit">GỬI LỜI CHÚC</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Guestbook Display -->
      <div class="max-w-5xl mx-auto mt-14 bg-card p-8 md:p-12 rounded-3xl shadow-luxury border border-outline-variant reveal reveal-up reveal-delay-2">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-5 border-b border-outline-variant/80">
          <div>
            <p class="font-label-caps text-label-caps text-primary tracking-[0.22em] uppercase mb-1">Warmest Wishes</p>
            <h3 class="font-headline-sm text-2xl italic text-on-background">Sổ Lưu Bút Gia Đình &amp; Bạn Bè</h3>
          </div>
          <div class="h-0.5 w-14 bg-primary mt-3 md:mt-0"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin" id="wishes-display">
          <div class="bg-surface/70 dark:bg-surface-container p-6 md:p-8 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm">
            <p class="font-body-md italic text-on-surface mb-4 leading-relaxed">"Chúc hai con trăm năm hạnh phúc, đầu bạc răng long nhé!"</p>
            <p class="font-label-caps text-label-caps text-primary tracking-widest">— Gia Đình</p>
          </div>
          <div class="bg-surface/70 dark:bg-surface-container p-6 md:p-8 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm">
            <p class="font-body-md italic text-on-surface mb-4 leading-relaxed">"Mừng cho đôi bạn trẻ đã tìm thấy bến đỗ bình yên."</p>
            <p class="font-label-caps text-label-caps text-primary tracking-widest">— Bạn Thân Cấp 3</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-background py-16 md:py-24 w-full text-center scroll-section border-t border-outline-variant/60">
    <div class="max-w-container-max mx-auto px-margin-mobile flex flex-col items-center gap-unit reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase mb-2">Forever &amp; Always</p>
      <div class="font-script text-5xl md:text-6xl text-primary mb-4" id="footer-names"></div>
      <p class="font-body-md text-on-surface-variant max-w-lg mb-8 italic" id="footer-message"></p>
      <div class="h-px w-20 bg-outline/40 mb-6"></div>
      <p class="font-label-caps text-label-caps text-outline tracking-[0.2em]" id="footer-copyright"></p>
    </div>
  </footer>

  <button aria-label="Quay lại đầu trang"
    class="glass-nav fixed safe-fixed-br z-[100] w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
    id="back-to-top" title="Quay lại đầu trang">
    <span class="material-symbols-outlined glass-nav-icon">keyboard_double_arrow_up</span>
  </button>

  <!-- Lightbox Modal for Gallery -->
  <div id="lightbox"
    class="fixed inset-0 z-[200] hidden bg-black/95 flex items-center justify-center backdrop-blur-md transition-opacity duration-300 opacity-0 select-none">
    <button id="lightbox-close"
      class="absolute top-6 right-6 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15"
      aria-label="Đóng">
      <span class="material-symbols-outlined text-2xl">close</span>
    </button>
    <button id="lightbox-prev"
      class="absolute left-4 md:left-8 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15"
      aria-label="Ảnh trước">
      <span class="material-symbols-outlined text-3xl">chevron_left</span>
    </button>
    <div id="lightbox-content" class="relative max-w-[92%] max-h-[88%] flex items-center justify-center">
      <img id="lightbox-img" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl prevent-download" src=""
        alt="Ảnh cưới xem đầy đủ" draggable="false">
    </div>
    <button id="lightbox-next"
      class="absolute right-4 md:right-8 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15"
      aria-label="Ảnh tiếp">
      <span class="material-symbols-outlined text-3xl">chevron_right</span>
    </button>
  </div>

  <!-- Form Popup Modal (Success / Error) -->
  <div id="form-popup"
    class="fixed inset-0 hidden bg-black/65 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 opacity-0 select-none"
    style="z-index: 9999;">
    <div id="form-popup-card"
      class="bg-card border border-outline/30 p-8 md:p-10 rounded-3xl shadow-luxury-lg max-w-sm w-[90%] text-center transform scale-95 transition-transform duration-300 relative">
      <div class="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/30"
        id="form-popup-icon-container">
        <span class="material-symbols-outlined text-3xl" id="form-popup-icon">favorite</span>
      </div>
      <h3 class="font-headline-sm text-2xl italic text-on-background mb-3" id="form-popup-title">Gửi thành công!</h3>
      <p class="font-body-md text-on-surface-variant mb-8" id="form-popup-message">Cảm ơn bạn đã gửi phản hồi.</p>
      <button id="form-popup-close"
        class="w-full bg-primary text-white dark:text-surface-lowest py-4 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.2em] transition-all hover:bg-tertiary active:scale-95 shadow-md">ĐỒNG
        Ý</button>
    </div>
  </div>
```

- [ ] **Step 2: Cập nhật text mặc định của nút `rsvp-submit` trong hàm `initRsvpForm` (`index.html`)**

Trong hàm `initRsvpForm` (khoảng dòng 1723 và 1741), cập nhật chuỗi `'XÁC NHẬN'` thành `'XÁC NHẬN THAM DỰ'` để khớp với nhãn nút mới:

```javascript
          setFormStatus(statusEl, '');
          setSubmitLoading(submitBtn, true, 'XÁC NHẬN THAM DỰ');
```
và ở khối `finally`:
```javascript
          } finally {
            setSubmitLoading(submitBtn, false, 'XÁC NHẬN THAM DỰ');
          }
```

---

### Task 5: Biên dịch CSS, Cập nhật tài liệu `COLOR_GUIDE.md` và Kiểm thử toàn diện

**Files:**
- Modify: `assets/tailwind.css`
- Modify: `COLOR_GUIDE.md:36-52`

**Interfaces:**
- Consumes: `tailwind.config.js`, `colors.js`, `index.html`, `src/input.css`
- Produces: File `assets/tailwind.css` đã minify và tài liệu bảng màu đồng bộ.

- [ ] **Step 1: Biên dịch lại Tailwind CSS**

Run: `npm run build:css`
Expected: Lệnh kết thúc với exit code 0 và cập nhật `assets/tailwind.css`.

- [ ] **Step 2: Kiểm tra toàn bộ ID DOM bắt buộc trong `index.html`**

Run:
```bash
node -e '
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const requiredIds = [
  "petals", "music-btn", "music-icon", "theme-toggle", "theme-icon", "bg-music",
  "menu-btn", "menu-icon", "mobile-menu", "home", "hero-slideshow", "hero-overlay",
  "hero-groom-name", "hero-bride-name", "hero-date", "hero-invitation",
  "slideshow-dots", "scroll-hint", "intro", "groom-photo", "groom-name",
  "groom-father", "groom-mother", "bride-photo", "bride-name", "bride-father",
  "bride-mother", "gallery", "gallery-container", "events", "event-title",
  "event-time", "event-date", "event-venue", "event-address", "event-maps-link",
  "rsvp", "rsvp-deadline", "rsvp-form", "rsvp-name", "rsvp-name-error",
  "rsvp-guests", "rsvp-guests-error", "rsvp-status", "rsvp-submit",
  "wishes-form", "wish-name", "wish-name-error", "wish-message",
  "wish-message-error", "wish-status", "wish-submit", "wishes-display",
  "footer-names", "footer-message", "footer-copyright", "back-to-top",
  "lightbox", "lightbox-close", "lightbox-prev", "lightbox-content",
  "lightbox-img", "lightbox-next", "form-popup", "form-popup-card",
  "form-popup-icon-container", "form-popup-icon", "form-popup-title",
  "form-popup-message", "form-popup-close"
];
const missing = requiredIds.filter(id => !html.includes(`id="${id}"`));
if (missing.length) { console.error("Missing IDs:", missing); process.exit(1); }
console.log("All " + requiredIds.length + " DOM IDs verified!");
'
```
Expected: `All 64 DOM IDs verified!`

- [ ] **Step 3: Cập nhật bảng mã màu trong `COLOR_GUIDE.md`**

Cập nhật bảng màu trong `COLOR_GUIDE.md` (dòng 36-52) phản ánh bộ mã màu Quiet Luxury mới trong `colors.js`:

```markdown
| Tên biến CSS | Mã màu (Light / Dark) | Vai trò & Nơi sử dụng trong Web |
| :--- | :--- | :--- |
| **`primary`**<br>`--color-primary` | `#9A6B56` / `#DFC19D` | **Màu nhấn chủ đạo (Burnished Rose Bronze / Luminous Champagne Gold):**<br>• Nhãn phụ đề (Overline caps) và điểm nhấn trang trí.<br>• Tên cô dâu & chú rể ở phần giới thiệu gia đình.<br>• Màu nền nút bấm chính (Chỉ đường, Xác nhận RSVP, Gửi lời chúc).<br>• Icon trái tim, kim cương và biểu tượng sự kiện.<br>• Viền nhấn bên trái của thẻ Lời chúc. |
| **`secondary`**<br>`--color-secondary` | `#E8DDD1` / `#B89B78` | **Màu phụ (Soft Champagne Silk / Antique Warm Bronze):**<br>• Chữ tiêu đề phụ ("PHỤ HUYNH NHÀ TRAI/GÁI") ở chế độ tối. |
| **`tertiary`**<br>`--color-tertiary` | `#734B3A` / `#CCA67E` | **Màu nhấn phụ (Deep Espresso Bronze / Burnished Gold):**<br>• Màu icon điều hướng (glass-nav) ở chế độ sáng.<br>• Trạng thái hover của các nút bấm chính (`hover:bg-tertiary`).<br>• Chữ tiêu đề phụ ở chế độ sáng. |
| **`background`**<br>`--color-background` | `#FAF7F2` / `#0F0D0C` | **Màu nền chính trang web (Editorial Silk Ivory / Midnight Velvet Obsidian):**<br>• Nền toàn bộ trang (`<body>`), section Sự Kiện (`#events`) và chân trang (`<footer>`). |
| **`surface`**<br>`--color-surface` | `#F4EFE7` / `#151210` | **Nền bề mặt phụ:**<br>• Nền của section Album ảnh cưới (`#gallery`) ở chế độ sáng và nền ô input. |
| **`surfaceLowest`**<br>`--color-surface-lowest` | `#EFE8DD` / `#0A0908` | **Nền bề mặt sâu nhất:**<br>• Nền của section Album ảnh cưới (`#gallery`) ở chế độ tối. |
| **`onBackground`**<br>`--color-on-background` | `#261C18` / `#F4EFE8` | **Màu chữ chính (Deep Espresso Charcoal / Crisp Silk Parchment):**<br>• Chữ tiêu đề lớn và nội dung chính toàn trang đạt chuẩn tương phản WCAG AAA. |
| **`onSurface`**<br>`--color-on-surface` | `#261C18` / `#F4EFE8` | **Màu chữ trên các thẻ/hộp:**<br>• Nội dung lời chúc hiển thị trong sổ lưu bút. |
| **`onSurfaceVariant`**<br>`--color-on-surface-variant` | `rgba(38, 28, 24, 0.68)` /<br>`rgba(244, 239, 232, 0.68)` | **Màu chữ phụ/mờ:**<br>• Lời trích dẫn, địa chỉ chi tiết sự kiện, dòng bản quyền. |
| **`outline`**<br>`--color-outline` | `#C2A88E` / `#7A6550` | **Màu viền Champagne Gold:**<br>• Khung viền kép (inset border) của thiệp mời sự kiện, khung ảnh cô dâu chú rể và đường kẻ trang trí. |
| **`outlineVariant`**<br>`--color-outline-variant` | `#E4DAD0` / `#332B24` | **Nét viền mảnh (Hairline border):**<br>• Viền ngoài của các thẻ Card, khung ảnh Gallery và đường phân cách trong form. |
| **`surfaceContainer`**<br>`--color-surface-container` | `#F3ECE2` / `#1A1614` | **Hộp chứa nội dung:**<br>• Nền của section RSVP & Lời chúc (`#rsvp`). |
| **`card`**<br>`--color-card` | `#FFFFFF` / `#211C19` | **Màu nền thẻ card nổi bật:**<br>• Nền thẻ Gia đình, khung ảnh Gallery, thiệp Sự kiện, hộp nhập RSVP/Lời chúc và Sổ lưu bút. |
```

- [ ] **Step 4: Commit (Optional - chỉ chạy khi người dùng yêu cầu rõ ràng)**

```bash
# git add tailwind.config.js colors.js index.html assets/tailwind.css COLOR_GUIDE.md
# git commit -m "feat(ui): redesign wedding page with modern luxury editorial light & dark themes"
```
