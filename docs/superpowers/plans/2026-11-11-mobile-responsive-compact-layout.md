# Mobile Responsive Compact Layout & Typography Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Balance all floating navigation buttons on mobile, compact the vertical rhythm and card layouts across all mobile sections (`#intro`, `#gallery`, `#events`, `#rsvp`, `footer`) so the page is concise, and eliminate all awkward mobile text line-breaks (`#event-maps-link`, `#guestbook-title`, `#footer-copyright`, and section headers/subtitles).

**Architecture:** Apply adaptive constraint-driven responsive rules in `tailwind.config.js` and `index.html`. Unify floating control sizes/offsets so they stay clear of card borders and section headings on narrow mobile viewports (`320px–430px`), compress mobile vertical paddings/margins by ~35–40% without altering desktop (`md:`/`lg:`) layouts, and enforce phrase-level `whitespace-nowrap` + `[text-wrap:balance]` on all multi-clause labels and headings.

**Tech Stack:** HTML5, Tailwind CSS v3 (`tailwind.config.js` -> `assets/tailwind.css`), Vanilla JavaScript ES6, Headless Chrome CDP E2E layout verification.

## Global Constraints

- **No Auto-Commits:** Never run `git commit` unless explicitly requested by the user.
- **RTK Command Prefix:** Always prefix shell commands with `rtk`.
- **Desktop Preservation:** All desktop (`md:` / `lg:`) layouts, animations, onboarding steps, and personalized guest link (`?g=...`) features must remain 100% intact.
- **Rebuild Assets:** Always run `rtk npm run build:css` after modifying `tailwind.config.js` or `index.html`.

---

## File Structure

- Modify: `tailwind.config.js:44-51` — Reduce `section-gap-mobile` token from `'72px'` to `'44px'` (`2.75rem`) while keeping `section-gap-desktop: '120px'`.
- Modify: `index.html:64-79, 166-177, 226-306, 1328-1391` — Update mobile `.safe-fixed-tl`, `.safe-fixed-tr`, `.safe-fixed-br` offsets, unify `.glass-nav` icon & pulse ring styles, compact mobile `.gallery-item`, `.wedding-cal-day`, and `.wishes-scrollview` heights.
- Modify: `index.html:2006-2029, 3091-3095` — Unify `#music-btn`, `#theme-toggle`, `#menu-btn`, and `#back-to-top` dimensions (`w-10 h-10 md:w-11 md:h-11`) and icon classes (`glass-nav-icon`).
- Modify: `index.html:2743-3090, 3608-3705, 4485-4495` — Compact mobile spacing/sizing in `#intro`, `#gallery`, `#events`, `#rsvp`, and `footer`, and apply clean responsive text-wrapping (`#event-maps-link`, `#guestbook-title`, `#footer-copyright`, `#event-venue`, and section headers).
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js` — Automated headless Chrome CDP test verifying button symmetry, total mobile page height reduction, and zero awkward line-breaks across `375px` and `390px` viewports.

---

### Task 1: Balance Floating Navigation Controls & Mobile Safe Margins (Hình 1, 7, 8)

**Files:**
- Modify: `index.html:64-79`
- Modify: `index.html:166-177`
- Modify: `index.html:291-306`
- Modify: `index.html:2006-2029`
- Modify: `index.html:3091-3095`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`

**Interfaces:**
- Consumes: Existing `#music-btn`, `#theme-toggle`, `#menu-btn`, `#back-to-top` DOM IDs and `.glass-nav` class.
- Produces: Symmetrical `40px × 40px` (`w-10 h-10`) mobile / `44px × 44px` (`md:w-11 md:h-11`) desktop floating buttons positioned at `0.75rem` (`12px`) from mobile screen edges so they do not sit inside card borders or collide with section titles.

- [ ] **Step 1: Write the failing mobile layout & button symmetry test**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`:

```javascript
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9236;
const BASE_URL = 'http://127.0.0.1:8088';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() {
    this.ws.close();
  }
}

async function evalExpr(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.text);
  }
  return res.result.value;
}

(async () => {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    'about:blank',
  ]);
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await new Promise((r) => setTimeout(r, 1000));

    // Dismiss onboarding to inspect main page
    await evalExpr(cdp, `
      document.getElementById('ob-skip-to-site-btn')?.click();
      true;
    `);
    await new Promise((r) => setTimeout(r, 900));

    const metrics = await evalExpr(cdp, `(() => {
      const music = document.getElementById('music-btn').getBoundingClientRect();
      const theme = document.getElementById('theme-toggle').getBoundingClientRect();
      const menu = document.getElementById('menu-btn').getBoundingClientRect();
      const btt = document.getElementById('back-to-top').getBoundingClientRect();
      const musicIcon = getComputedStyle(document.getElementById('music-icon')).fontSize;
      const themeIcon = getComputedStyle(document.getElementById('theme-icon')).fontSize;
      const menuIcon = getComputedStyle(document.getElementById('menu-icon')).fontSize;
      const mapsLink = document.getElementById('event-maps-link');
      const mapsSpan = mapsLink.querySelector('span:last-child') || mapsLink;
      const guestbookH3 = document.querySelector('#rsvp h3.text-on-background:not(.mb-1)');
      const copyrightEl = document.getElementById('footer-copyright');
      const copyrightSpans = Array.from(copyrightEl.querySelectorAll('span.whitespace-nowrap'));

      return {
        btnWidths: [music.width, theme.width, menu.width, btt.width],
        btnHeights: [music.height, theme.height, menu.height, btt.height],
        musicLeft: music.left,
        menuRightGap: window.innerWidth - menu.right,
        iconSizes: [musicIcon, themeIcon, menuIcon],
        pageHeight: document.documentElement.scrollHeight,
        mapsLinkClientHeight: mapsLink.clientHeight,
        guestbookSpansCount: guestbookH3 ? guestbookH3.querySelectorAll('span.whitespace-nowrap').length : 0,
        copyrightSpansCount: copyrightSpans.length,
      };
    })()`);

    console.log('METRICS:', JSON.stringify(metrics, null, 2));

    const allSameSize = metrics.btnWidths.every((w) => Math.abs(w - 40) <= 1) &&
                        metrics.btnHeights.every((h) => Math.abs(h - 40) <= 1);
    const allSameIcons = new Set(metrics.iconSizes).size === 1;
    const edgeAligned = Math.abs(metrics.musicLeft - 12) <= 1 && Math.abs(metrics.menuRightGap - 12) <= 1;
    const compactPage = metrics.pageHeight <= 4450;
    const mapsSingleLine = metrics.mapsLinkClientHeight <= 52;
    const guestbookWrappedCleanly = metrics.guestbookSpansCount >= 2;
    const copyrightWrappedCleanly = metrics.copyrightSpansCount >= 2;

    if (!allSameSize || !allSameIcons || !edgeAligned || !compactPage || !mapsSingleLine || !guestbookWrappedCleanly || !copyrightWrappedCleanly) {
      console.error('FAIL:', {
        allSameSize,
        allSameIcons,
        edgeAligned,
        compactPage,
        mapsSingleLine,
        guestbookWrappedCleanly,
        copyrightWrappedCleanly,
      });
      process.exitCode = 1;
    } else {
      console.log('PASS: All mobile responsive checks succeeded!');
    }
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`
Expected: FAIL (`allSameSize: false`, `allSameIcons: false`, `edgeAligned: false`, `compactPage: false`, `mapsSingleLine: false`, `guestbookWrappedCleanly: false`, `copyrightWrappedCleanly: false`).

- [ ] **Step 3: Unify floating buttons CSS and HTML in `index.html`**

Update `.safe-fixed-tl`, `.safe-fixed-tr`, `.safe-fixed-br`, `.glass-nav-icon`, and `#music-btn.playing` in `index.html`:

```css
    /* Nút cố định — tôn trọng safe-area khi zoom / notch, gọn sát mép trên mobile */
    .safe-fixed-tl {
      top: max(0.75rem, env(safe-area-inset-top, 0px));
      left: max(0.75rem, env(safe-area-inset-left, 0px));
    }

    .safe-fixed-tr {
      top: max(0.75rem, env(safe-area-inset-top, 0px));
      right: max(0.75rem, env(safe-area-inset-right, 0px));
    }

    .safe-fixed-br {
      bottom: max(0.875rem, env(safe-area-inset-bottom, 0px));
      right: max(0.75rem, env(safe-area-inset-right, 0px));
    }

    @media (min-width: 768px) {
      .safe-fixed-tl {
        top: max(1.5rem, env(safe-area-inset-top, 0px));
        left: max(1.5rem, env(safe-area-inset-left, 0px));
      }

      .safe-fixed-tr {
        top: max(1.5rem, env(safe-area-inset-top, 0px));
        right: max(1.5rem, env(safe-area-inset-right, 0px));
      }

      .safe-fixed-br {
        bottom: max(2rem, env(safe-area-inset-bottom, 0px));
        right: max(1.5rem, env(safe-area-inset-right, 0px));
      }
    }
```

Update `.glass-nav .glass-nav-icon` and `#music-btn.playing` in `index.html`:

```css
    .glass-nav .glass-nav-icon {
      font-size: 1.25rem;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      color: var(--color-primary);
      transition: transform 0.3s ease, color 0.3s ease;
    }

    @media (min-width: 768px) {
      .glass-nav .glass-nav-icon {
        font-size: 1.375rem;
      }
    }

    html.dark .glass-nav .glass-nav-icon {
      color: var(--color-primary);
    }
```

And replace `#music-btn.playing` outer 10px halo with a tight, balanced 3px pulse so `#music-btn` never looks oversized or overlaps `#theme-toggle` (Hình 1):

```css
    /* Music toggle pulse when playing — viền nhịp mảnh cân đối với các nút khác */
    #music-btn.playing {
      border-color: var(--color-primary);
      animation: musicPulse 2.4s ease-in-out infinite;
    }

    @keyframes musicPulse {
      0%,
      100% {
        box-shadow: 0 4px 14px -2px rgba(38, 28, 24, 0.14), 0 0 0 0 var(--music-pulse);
      }

      50% {
        box-shadow: 0 4px 14px -2px rgba(38, 28, 24, 0.14), 0 0 0 3.5px transparent;
      }
    }
```

Update the 4 floating buttons HTML in `index.html` (`#music-btn`, `#theme-toggle`, `#menu-btn`, `#back-to-top`) to use identical `w-10 h-10 md:w-11 md:h-11` sizes and `glass-nav-icon`:

```html
  <!-- Music & Theme toggles: Xếp dọc đồng bộ trên cả Thiệp và Trang chính -->
  <div class="fixed safe-fixed-tl z-[100] flex flex-col items-center gap-2">
    <button aria-label="Bật/tắt nhạc nền"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
      id="music-btn" title="Bật nhạc nền">
      <span class="material-symbols-outlined glass-nav-icon" id="music-icon">volume_off</span>
    </button>
    <button aria-label="Bật/tắt chế độ tối"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
      id="theme-toggle" title="Chế độ tối">
      <span class="material-symbols-outlined glass-nav-icon" id="theme-icon">dark_mode</span>
    </button>
  </div>
  <audio id="bg-music" loop preload="auto"></audio>

  <!-- Modern Hamburger Navigation -->
  <header class="fixed safe-fixed-tr z-[100]">
    <button aria-label="Mở menu điều hướng"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
      id="menu-btn">
      <span class="material-symbols-outlined glass-nav-icon" id="menu-icon">menu</span>
    </button>
  </header>
```

And `#back-to-top` (`index.html:3091-3095`):

```html
  <button aria-label="Quay lại đầu trang"
    class="glass-nav fixed safe-fixed-br z-[100] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
    id="back-to-top" title="Quay lại đầu trang">
    <span class="material-symbols-outlined glass-nav-icon">keyboard_double_arrow_up</span>
  </button>
```

---

### Task 2: Compact Mobile Vertical Rhythm & Section Layouts (Hình 2–9)

**Files:**
- Modify: `tailwind.config.js:44-51`
- Modify: `index.html:226-232, 1328-1390, 2743-3090, 3691-3704, 4485-4495`
- Modify: `assets/tailwind.css` (generated via `rtk npm run build:css`)

**Interfaces:**
- Consumes: `py-section-gap-mobile`, `.gallery-item`, `.wedding-cal-day`, `.wishes-scrollview`, `#intro`, `#gallery`, `#events`, `#rsvp`, `footer`.
- Produces: Compact mobile vertical spacing (`section-gap-mobile: '44px'`) and streamlined mobile cards across all sections while keeping `md:` and `lg:` desktop layouts untouched.

- [ ] **Step 1: Update `section-gap-mobile` in `tailwind.config.js`**

Modify `tailwind.config.js:44-51`:

```javascript
      spacing: {
        gutter: '24px',
        'margin-mobile': '20px',
        'section-gap-mobile': '44px',
        'container-max': '1140px',
        'section-gap-desktop': '120px',
        unit: '8px',
      },
```

- [ ] **Step 2: Compact mobile CSS rules for `.gallery-item`, `.wedding-cal-day`, and `.wishes-scrollview` in `index.html`**

In `index.html`, update `.gallery-item`:

```css
    /* Gallery grid */
    .gallery-item {
      aspect-ratio: 4 / 4.6;
      position: relative;
    }

    @media (min-width: 768px) {
      .gallery-item {
        aspect-ratio: 3 / 4;
      }
    }
```

In `index.html`, update `.wedding-calendar-grid`, `.wedding-cal-day`, and `.wishes-scrollview`:

```css
    /* Lịch Tháng ở mục Sự Kiện Trọng Đại (#events) */
    .wedding-calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.2rem;
      text-align: center;
    }
    .wedding-cal-day {
      aspect-ratio: 1 / 1;
      width: 100%;
      max-width: 2.15rem;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      font-size: 0.8125rem;
      position: relative;
      transition: all 0.2s ease;
    }
    @media (min-width: 768px) {
      .wedding-calendar-grid {
        gap: 0.35rem;
      }
      .wedding-cal-day {
        max-width: 2.5rem;
        font-size: 0.875rem;
      }
    }
```

```css
    /* ScrollView cho Sổ Lưu Bút Gia Đình & Bạn Bè (#wishes-display) */
    .wishes-scrollview {
      max-height: 270px;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-right: 0.375rem;
      scrollbar-width: thin;
      scrollbar-color: var(--color-outline) transparent;
    }
    @media (min-width: 768px) {
      .wishes-scrollview {
        max-height: 390px;
        padding-right: 0.5rem;
      }
    }
```

- [ ] **Step 3: Compact mobile section headers, cards, and paddings in `#intro`, `#gallery`, `#events`, `#rsvp`, and `footer` (`index.html:2743-3090`)**

Update `#intro` (`index.html:2743-2789`) so both Groom and Bride cards are compact and fit within one mobile screen:

```html
  <!-- 2. Introduction Section (Couple) -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop max-w-container-max mx-auto px-margin-mobile md:px-gutter scroll-section"
    id="intro">
    <div class="text-center mb-7 md:mb-20 px-10 sm:px-0 reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">The Couple</p>
      <h2 class="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-5 whitespace-nowrap">Cô Dâu &amp; Chú Rể</h2>
      <div class="flex items-center justify-center gap-3 md:gap-4">
        <div class="h-px w-12 md:w-16 bg-outline/60"></div>
        <span class="material-symbols-outlined text-primary text-base md:text-lg" style="font-variation-settings: 'FILL' 1;">favorite</span>
        <div class="h-px w-12 md:w-16 bg-outline/60"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 lg:gap-28 items-start">
      <!-- Chú rể -->
      <div class="flex flex-col items-center text-center reveal reveal-left reveal-delay-1 bg-card/70 dark:bg-card/50 py-6 px-5 md:p-10 rounded-3xl border border-outline-variant/80 shadow-luxury">
        <div class="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 mb-3 md:mb-4 p-2 md:p-2.5 rounded-full border border-outline/50 bg-surface-lowest/40 shadow-inner">
          <div class="w-full h-full rounded-full overflow-hidden ring-1 ring-outline/30 shadow-xl">
            <img alt="Chú rể" class="w-full h-full object-cover rounded-full prevent-download"
              id="groom-photo" />
          </div>
          <div
            class="absolute -bottom-3.5 md:-bottom-4 left-1/2 -translate-x-1/2 bg-card px-5 md:px-7 py-1.5 md:py-2 rounded-full shadow-luxury border border-outline/40 min-w-[10rem] md:min-w-[11rem] max-w-[min(100vw-3rem,17rem)]">
            <p class="font-label-caps text-[10px] tracking-[0.25em] text-on-surface-variant uppercase mb-0.5">Chú Rể</p>
            <h4 class="font-headline-sm text-lg md:text-2xl italic text-primary text-center whitespace-nowrap leading-snug" id="groom-name">
            </h4>
          </div>
        </div>
      </div>

      <!-- Cô dâu -->
      <div class="flex flex-col items-center text-center reveal reveal-right reveal-delay-2 bg-card/70 dark:bg-card/50 py-6 px-5 md:p-10 rounded-3xl border border-outline-variant/80 shadow-luxury">
        <div class="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 mb-3 md:mb-4 p-2 md:p-2.5 rounded-full border border-outline/50 bg-surface-lowest/40 shadow-inner">
          <div class="w-full h-full rounded-full overflow-hidden ring-1 ring-outline/30 shadow-xl">
            <img alt="Cô dâu" class="w-full h-full object-cover rounded-full prevent-download"
              id="bride-photo" />
          </div>
          <div
            class="absolute -bottom-3.5 md:-bottom-4 left-1/2 -translate-x-1/2 bg-card px-5 md:px-7 py-1.5 md:py-2 rounded-full shadow-luxury border border-outline/40 min-w-[10rem] md:min-w-[11rem] max-w-[min(100vw-3rem,17rem)]">
            <p class="font-label-caps text-[10px] tracking-[0.25em] text-on-surface-variant uppercase mb-0.5">Cô Dâu</p>
            <h4 class="font-headline-sm text-lg md:text-2xl italic text-primary text-center whitespace-nowrap leading-snug" id="bride-name">
            </h4>
          </div>
        </div>
      </div>
    </div>
  </section>
```

Update `#gallery` (`index.html:2793-2806`):

```html
  <!-- 3. Wedding Gallery Grid -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface dark:bg-surface-lowest scroll-section overflow-x-clip" id="gallery">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter mb-7 md:mb-14">
      <div class="text-center px-10 sm:px-0 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">Captured Moments</p>
        <h2 class="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-background italic mb-2.5 md:mb-4 whitespace-nowrap">Album Hình Cưới</h2>
        <p class="font-body-md text-sm md:text-base text-on-surface-variant max-w-xl mx-auto italic [text-wrap:balance]">Từng nhịp thở, từng ánh mắt, được gói
          trọn trong những khung hình.</p>
      </div>
    </div>
    <div
      class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-7 max-w-container-max mx-auto px-margin-mobile md:px-gutter pb-2 md:pb-8"
      id="gallery-container"></div>
  </section>
```

---

### Task 3: Fix All Mobile Responsive Text-Wrapping Issues & Compact `#events`, `#rsvp`, `footer` (Hình 4–9)

**Files:**
- Modify: `index.html:2810-3090`
- Modify: `index.html:3608-3705`
- Modify: `index.html:4485-4495`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`

**Interfaces:**
- Consumes: `#event-maps-link`, `#event-venue`, `#guestbook-title`, `#footer-copyright`, `#wishes-display`.
- Produces: Single-line `"XEM BẢN ĐỒ CHỈ ĐƯỜNG"` on mobile, balanced non-orphaning `"Sổ Lưu Bút Gia Đình & Bạn Bè"` and `"© 2027 Đăng Khoa & Cẩm Nhung. Made with love."`, and compact `#events`, `#rsvp`, and `footer` sections.

- [ ] **Step 1: Update `#events`, `#rsvp`, and `footer` HTML in `index.html:2810-3090`**

Update `#events` (`index.html:2810-2910`):

```html
  <!-- 4. Wedding Banquet Details & Calendar -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-background scroll-section" id="events">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      <div class="text-center mb-7 md:mb-16 px-10 sm:px-0 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">The Celebration</p>
        <h2 class="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-5 whitespace-nowrap">Sự Kiện Trọng Đại</h2>
        <div class="flex items-center justify-center gap-3 md:gap-4">
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
          <span class="material-symbols-outlined text-primary text-base md:text-lg">diamond</span>
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-10 max-w-5xl mx-auto items-stretch">
        <!-- Cột 1: Thông tin Tiệc Chúc Mừng -->
        <div class="bg-card p-2.5 md:p-4 rounded-3xl shadow-luxury-lg border border-outline-variant flex flex-col reveal reveal-scale reveal-delay-1">
          <div class="border border-outline/40 rounded-2xl p-5 md:p-10 flex flex-col items-center justify-between text-center relative overflow-hidden flex-1">
            <div class="w-full flex flex-col items-center">
              <div class="w-12 h-12 md:w-15 md:h-15 rounded-full bg-surface-container flex items-center justify-center mb-3 md:mb-5 border border-outline/30 p-2.5 md:p-3.5">
                <span class="material-symbols-outlined text-2xl md:text-3xl text-primary">celebration</span>
              </div>
              <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.25em] uppercase mb-1.5 md:mb-2">Trân Trọng Kính Mời</p>
              <h3 class="font-headline-sm text-2xl sm:text-3xl md:text-4xl italic text-on-background mb-4 md:mb-8 whitespace-nowrap" id="event-title"></h3>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full border-y border-outline-variant/80 py-4 md:py-7">
                <div class="flex flex-col items-center justify-center sm:border-r sm:border-outline-variant/80 sm:pr-6 w-full sm:w-1/2 text-center">
                  <div class="flex items-center gap-1.5 text-primary mb-1 md:mb-2">
                    <span class="material-symbols-outlined text-base md:text-lg">schedule</span>
                    <p class="font-label-caps text-label-caps tracking-[0.22em] whitespace-nowrap">THỜI GIAN</p>
                  </div>
                  <p class="font-headline-sm text-xl md:text-2xl font-semibold text-on-background mb-0.5 md:mb-1 whitespace-nowrap" id="event-time"></p>
                  <p class="font-body-md text-sm md:text-base text-on-surface-variant [text-wrap:balance]" id="event-date"></p>
                </div>

                <div class="flex flex-col items-center justify-center sm:pl-6 w-full sm:w-1/2 text-center">
                  <div class="flex items-center gap-1.5 text-primary mb-1 md:mb-2">
                    <span class="material-symbols-outlined text-base md:text-lg">location_on</span>
                    <p class="font-label-caps text-label-caps tracking-[0.22em] whitespace-nowrap">ĐỊA ĐIỂM</p>
                  </div>
                  <p class="font-body-md text-base md:text-lg font-semibold text-on-background mb-0.5 md:mb-1 [text-wrap:balance]" id="event-venue"></p>
                  <p class="font-body-md text-on-surface-variant italic text-xs md:text-sm [text-wrap:balance]" id="event-address"></p>
                </div>
              </div>
            </div>

            <a class="mt-5 md:mt-8 bg-primary text-white dark:text-surface-lowest px-4 sm:px-8 py-3.5 md:py-4 rounded-full font-label-caps text-[10.5px] sm:text-label-caps font-semibold tracking-[0.12em] sm:tracking-[0.22em] whitespace-nowrap transition-all duration-300 hover:bg-tertiary hover:shadow-lg active:scale-95 shadow-md flex items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto"
              href="#" id="event-maps-link" target="_blank" rel="noopener noreferrer">
              <span class="material-symbols-outlined text-base sm:text-lg shrink-0">map</span>
              <span class="whitespace-nowrap">XEM BẢN ĐỒ CHỈ ĐƯỜNG</span>
            </a>
          </div>
        </div>

        <!-- Cột 2: Tờ Lịch Tháng theo lời mời -->
        <div class="bg-card p-2.5 md:p-4 rounded-3xl shadow-luxury-lg border border-outline-variant flex flex-col reveal reveal-scale reveal-delay-2" id="wedding-calendar-card">
          <div class="border border-outline/40 rounded-2xl p-5 md:p-10 flex flex-col justify-between text-center relative overflow-hidden flex-1">
            <div>
              <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.25em] uppercase mb-1">Save The Date</p>
              <h3 class="font-headline-sm text-xl sm:text-2xl md:text-3xl italic text-primary mb-4 md:mb-6 whitespace-nowrap" id="calendar-month-title">Tháng 04 / 2027</h3>

              <!-- Tiêu đề các thứ trong tuần -->
              <div class="wedding-calendar-grid border-b border-outline-variant/70 pb-2 mb-2 font-label-caps text-[10px] md:text-[11px] tracking-widest text-on-surface-variant uppercase">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span class="text-primary font-bold">CN</span>
              </div>

              <!-- Lưới ngày trong tháng (render tự động từ event.dateText) -->
              <div class="wedding-calendar-grid font-body-md text-on-background" id="wedding-calendar-days"></div>
            </div>

            <!-- Bộ đếm ngược ngày chung đôi -->
            <div class="mt-4 pt-4 md:mt-6 md:pt-5 border-t border-outline-variant/70">
              <p class="font-label-caps text-[10px] tracking-[0.18em] sm:tracking-[0.22em] text-on-surface-variant uppercase mb-2.5 md:mb-3 whitespace-nowrap">Đếm ngược đến giờ khai tiệc</p>
              <div class="grid grid-cols-4 gap-2 md:gap-2.5 max-w-xs mx-auto" id="wedding-countdown">
                <div class="bg-surface-container/70 rounded-xl py-1.5 md:py-2 px-1 border border-outline/25">
                  <span class="block font-headline-sm text-lg md:text-2xl font-bold text-primary" id="cd-days">00</span>
                  <span class="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant uppercase">Ngày</span>
                </div>
                <div class="bg-surface-container/70 rounded-xl py-1.5 md:py-2 px-1 border border-outline/25">
                  <span class="block font-headline-sm text-lg md:text-2xl font-bold text-primary" id="cd-hours">00</span>
                  <span class="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant uppercase">Giờ</span>
                </div>
                <div class="bg-surface-container/70 rounded-xl py-1.5 md:py-2 px-1 border border-outline/25">
                  <span class="block font-headline-sm text-lg md:text-2xl font-bold text-primary" id="cd-mins">00</span>
                  <span class="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant uppercase">Phút</span>
                </div>
                <div class="bg-surface-container/70 rounded-xl py-1.5 md:py-2 px-1 border border-outline/25">
                  <span class="block font-headline-sm text-lg md:text-2xl font-bold text-primary" id="cd-secs">00</span>
                  <span class="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant uppercase">Giây</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
```

Update `#rsvp` and `footer` (`index.html:2914-3090`):

```html
  <!-- 5. RSVP & Wishes Section (Gộp chung Form "Bạn sẽ đến chứ?" + Sổ Lưu Bút) -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface-container relative scroll-section" id="rsvp">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
      <div class="text-center mb-7 md:mb-16 px-10 sm:px-0 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">R.S.V.P &amp; Guestbook</p>
        <h2 class="font-headline-md text-[1.65rem] sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-4 whitespace-nowrap">Hiện Diện &amp; Lời Chúc</h2>
        <div class="flex items-center justify-center gap-3 md:gap-4">
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
          <span class="material-symbols-outlined text-primary text-base md:text-lg" style="font-variation-settings: 'FILL' 1;">favorite</span>
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-10 max-w-5xl mx-auto items-stretch">
        <!-- Cột 1: Form hợp nhất "Bạn sẽ đến chứ?" -->
        <div class="bg-card p-5 md:p-10 rounded-3xl shadow-luxury border border-outline-variant flex flex-col justify-between reveal reveal-up">
          <div>
            <div class="text-center mb-4 pb-3.5 md:mb-6 md:pb-5 border-b border-outline-variant/70">
              <div class="inline-flex items-center gap-2 text-primary mb-1">
                <span class="h-px w-8 bg-outline/50"></span>
                <span class="material-symbols-outlined text-xl md:text-2xl">mail</span>
                <span class="h-px w-8 bg-outline/50"></span>
              </div>
              <h3 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-1 whitespace-nowrap">Bạn sẽ đến chứ?</h3>
              <p class="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto [text-wrap:balance]">
                Hãy cho chúng tôi biết để chuẩn bị đón tiếp bạn thật chu đáo nhé!
              </p>
              <p class="font-label-caps text-[10px] text-primary tracking-[0.15em] mt-1.5" id="rsvp-deadline"></p>
            </div>
```

And in `#rsvp` Cột 2 (`Sổ Lưu Bút Gia Đình & Bạn Bè`, `index.html:3034-3071`):

```html
        <!-- Cột 2: Sổ Lưu Bút Gia Đình & Bạn Bè -->
        <div class="bg-card p-5 md:p-10 rounded-3xl shadow-luxury border border-outline-variant flex flex-col reveal reveal-up reveal-delay-1">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3.5 md:mb-6 md:pb-5 border-b border-outline-variant/80">
            <div>
              <p class="font-label-caps text-label-caps text-primary tracking-[0.22em] uppercase mb-1">Warmest Wishes</p>
              <h3 class="font-headline-sm text-[1.2rem] sm:text-2xl italic text-on-background leading-snug" id="guestbook-title">
                <span class="inline-block whitespace-nowrap">Sổ Lưu Bút</span>
                <span class="inline-block whitespace-nowrap">Gia Đình &amp; Bạn Bè</span>
              </h3>
            </div>
            <div class="h-0.5 w-14 bg-primary mt-2.5 sm:mt-0"></div>
          </div>
          <div class="wishes-scrollview flex flex-col gap-3 md:gap-4 flex-1" id="wishes-display">
            <div class="bg-surface/70 dark:bg-surface-container p-4 md:p-6 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm shrink-0">
              <p class="font-body-md text-sm md:text-base italic text-on-surface mb-2 md:mb-3 leading-relaxed">"Chúc hai con trăm năm hạnh phúc, đầu bạc răng long, sớm có thiên thần nhỏ nhé!"</p>
              <p class="font-label-caps text-label-caps text-primary tracking-widest">— Gia Đình Hai Bên</p>
            </div>
```

And in `footer` (`index.html:3075-3089`):

```html
  <!-- Footer -->
  <footer class="bg-background py-10 md:py-20 w-full text-center scroll-section border-t border-outline-variant/60">
    <div class="max-w-container-max mx-auto px-margin-mobile flex flex-col items-center gap-unit reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase mb-1.5 md:mb-2">Forever &amp; Always</p>
      <div class="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-2.5 md:mb-4" id="footer-names"></div>
      <p class="font-body-md text-sm md:text-base text-on-surface-variant max-w-lg mb-4 md:mb-6 italic [text-wrap:balance]" id="footer-message"></p>
      <button
        class="mb-4 md:mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline/45 text-primary hover:bg-primary/10 font-label-caps text-xs tracking-[0.2em] whitespace-nowrap transition-all cursor-pointer relative z-20"
        id="footer-reopen-invitation-btn" onclick="reopenOnboardingDeck()" type="button">
        <span class="material-symbols-outlined text-sm">auto_stories</span>
        <span class="whitespace-nowrap">Xem lại lời mời</span>
      </button>
      <div class="h-px w-20 bg-outline/40 mb-4 md:mb-6"></div>
      <p class="font-label-caps text-[10px] sm:text-label-caps text-outline tracking-[0.12em] sm:tracking-[0.2em] leading-relaxed [text-wrap:balance]" id="footer-copyright"></p>
    </div>
  </footer>
```

- [ ] **Step 2: Format `#event-venue`, `#ob-event-venue`, `#footer-copyright`, and wish cards in `initWeddingContent()` (`index.html:3608-3705`)**

In `index.html:3608-3705`, add `formatVenueName` and `formatCopyrightText` helpers so neither venue names with `" - "` nor copyright sentences with `"Made with love."` ever wrap with orphan words/hyphens:

```javascript
        function formatWeddingDate(d) {
          if (!d) return '';
          return d.replace(/(Ngày\s+\d+|Tháng\s+\d+|Năm\s+\d+)/g, '<span class="inline-block whitespace-nowrap">$1</span>');
        }

        function formatVenueName(name) {
          if (!name) return '';
          const parts = String(name).split(/\s*-\s*/);
          if (parts.length === 2) {
            return `<span class="inline-block whitespace-nowrap">${parts[0]}</span> <span class="inline-block whitespace-nowrap">- ${parts[1]}</span>`;
          }
          return name;
        }

        function formatCopyrightText(text) {
          if (!text) return '';
          const parts = String(text).trim().split(/\.\s+/);
          if (parts.length >= 2) {
            return parts
              .map((p) => {
                const clean = p.endsWith('.') ? p : `${p}.`;
                return `<span class="inline-block whitespace-nowrap">${clean}</span>`;
              })
              .join(' ');
          }
          return `<span class="inline-block whitespace-nowrap">${text}</span>`;
        }
```

And apply them to `#event-venue`, `#ob-event-venue`, `#footer-copyright`, and `#wishes-display`:

```javascript
        document.getElementById('event-venue').innerHTML = formatVenueName(event.venueName);
        ...
        if (elEventVenue) elEventVenue.innerHTML = formatVenueName(event.venueName);
        ...
        document.getElementById('footer-copyright').innerHTML = formatCopyrightText(footer.copyright);
```

And update dynamic wish cards in `initWeddingContent()` (`index.html:3697`) and RSVP submit handlers to use `p-4 md:p-6` and `text-sm md:text-base mb-2 md:mb-3`:

```javascript
            card.className = 'bg-surface/70 dark:bg-surface-container p-4 md:p-6 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm shrink-0';
            card.innerHTML = `
              <p class="font-body-md text-sm md:text-base italic text-on-surface mb-2 md:mb-3 leading-relaxed">"${String(w.message || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"</p>
              <p class="font-label-caps text-label-caps text-primary tracking-widest">— ${String(w.name || '').replace(/</g, '&lt;')}</p>
            `;
```

- [ ] **Step 3: Rebuild Tailwind CSS and run the mobile responsive verification script**

Run:
```bash
rtk npm run build:css
rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js
```
Expected: `PASS: All mobile responsive checks succeeded!`

- [ ] **Step 4: Run previous personalized guest E2E test to verify zero regression**

Run:
```bash
rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guest_e2e.js
```
Expected: `ALL E2E CHECKS PASSED!`
