# Mobile Responsive Layout & Web Loading / Animation Performance Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Balance mobile floating buttons, compact overly tall mobile sections, fix all responsive text line-breaks, permanently eliminate the initial-load UI glitch (`olume_off` / `ark_mode` icon font FOUT + font-swap flash) with inline SVG icons and an adaptive Preloader screen, and optimize animations and media loading for 60fps smoothness across both weak and strong networks.

**Architecture:**
- **Phase 1 (Tasks 1–3 — Mobile Responsive & Typography):** Unify `.safe-fixed-*` floating button dimensions/spacing (`40px` square mobile / `44px` desktop, `0.75rem` edge offset), reduce `section-gap-mobile` (`72px -> 44px`), tighten mobile cards across `#intro`, `#gallery`, `#events`, `#rsvp`, `footer`, and add `whitespace-nowrap` phrase wrappers + `[text-wrap:balance]` on multi-word CTAs, headings, venue names, and footer copyright.
- **Phase 2 (Tasks 4–6 — Zero-Glitch Load & Network-Adaptive Animation Performance):** Replace the heavy external `Material Symbols Outlined` variable font (`wght,FILL@100..700,0..1`) with an inline SVG `<symbol>` sprite sheet, prune unused Google Font weights (`Cormorant Garamond` removed, `100..900` narrowed), add an inline-CSS `#page-loader` preloader gated by `document.fonts.ready` + primary image decode with network-adaptive timeout failsafe, strip runtime GPU bottlenecks (fullscreen SVG `<feDropShadow>`, `background-attachment: fixed`, idle `will-change`, stacked `backdrop-filter: blur(24px)`, eager `8.9MB` audio & Google Maps `<iframe>`), and introduce a `navigator.connection` / device-tier `html.perf-lite` profile for weak networks vs prewarmed smooth motion on strong networks.

**Tech Stack:** HTML5, Inline SVG `<symbol>` Sprite, Tailwind CSS v3 (`tailwind.config.js` -> `assets/tailwind.css`), Vanilla JS ES6 (`navigator.connection`, `document.fonts.ready`, `img.decode()`), Chrome Headless CDP E2E & Network Throttling Verification.

## Global Constraints

- **No Auto-Commits:** Never run `git commit` unless explicitly requested by the user.
- **RTK Command Prefix:** Always prefix shell commands with `rtk`.
- **Desktop & Existing Features Preservation:** All desktop (`md:` / `lg:`) layouts, 5-step onboarding deck, light/dark themes, and `?g=` personalized guest link features must remain 100% functional.
- **Rebuild Assets:** Always run `rtk npm run build:css` after modifying `tailwind.config.js` or `index.html`.

---

## File Structure

- Modify: `tailwind.config.js:44-51` — Reduce `section-gap-mobile` from `'72px'` to `'44px'`.
- Modify: `assets/tailwind.css` — Regenerated via `rtk npm run build:css`.
- Modify: `index.html:1-38` — Add `preconnect` hints, slim Google Fonts URL (removing `Material Symbols Outlined` variable font & unused `Cormorant Garamond`), add inline `#page-loader` critical CSS & `.ui-icon` rules.
- Modify: `index.html:64-306, 361-437, 1110-1391, 1446-1565, 1910-1953` — Balance floating controls, compact `.gallery-item`/`.wedding-cal-day`/`.wishes-scrollview`, remove heavy SVG `<feDropShadow>`, `background-attachment: fixed`, `.reveal-blur`, dark SVG CSS filter chains, excessive `will-change` & `backdrop-filter: blur(24px)`, add `content-visibility: auto` and `html.perf-lite` graceful degradation rules.
- Modify: `index.html:2003-2146, 2340-3137` — Add `#page-loader` HTML, inline SVG `<symbol>` sprite sheet, replace all `<span class="material-symbols-outlined">` elements with `<svg class="ui-icon ..."><use href="#ico-..."/></svg>`, set `preload="none"` on `#bg-music`, apply responsive compact classes & text-wrapping fixes across `#intro`, `#gallery`, `#events`, `#rsvp`, `footer`.
- Modify: `index.html:3170-4600, 4760-4960` — Add `initAdaptivePerformanceProfile()` + `initPageLoader()`, update `updateMusicUI()`, `updateThemeUI()`, `toggleMenu()` to swap SVG `<use href>`, defer audio `src` & `#ob-event-map-iframe` lazy-load until Step 3, format venue & copyright spans, and compact dynamic wish card classes.
- Test 1 (Mobile Responsive): `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`
- Test 2 (Load UI + Weak/Strong Network & Animation Perf): `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`

---

### Task 1: Balance Floating Navigation Controls & Mobile Safe Margins (Hình 1, 7, 8)

**Files:**
- Modify: `index.html:64-79, 166-177, 291-306, 2006-2029, 3091-3095`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`

**Interfaces:**
- Consumes: `#music-btn`, `#theme-toggle`, `#menu-btn`, `#back-to-top`, `.glass-nav`.
- Produces: Symmetrical `40px × 40px` mobile / `44px × 44px` desktop circular controls positioned `0.75rem` from mobile viewport edges (`1.5rem` desktop), uniform `1.25rem` (`20px`) SVG icon sizing, and a compact `3.5px` music pulse ring.

- [ ] **Step 1: Write the failing mobile responsive verification test**

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
    await new Promise((r) => setTimeout(r, 1500));

    await evalExpr(cdp, `
      document.getElementById('ob-skip-to-site-btn')?.click();
      true;
    `);
    await new Promise((r) => setTimeout(r, 1000));

    const metrics = await evalExpr(cdp, `(() => {
      const music = document.getElementById('music-btn').getBoundingClientRect();
      const theme = document.getElementById('theme-toggle').getBoundingClientRect();
      const menu = document.getElementById('menu-btn').getBoundingClientRect();
      const btt = document.getElementById('back-to-top').getBoundingClientRect();
      const iconEls = [
        document.getElementById('music-icon'),
        document.getElementById('theme-icon'),
        document.getElementById('menu-icon'),
      ];
      const iconWidths = iconEls.map((el) => Math.round(el.getBoundingClientRect().width));
      const mapsLink = document.getElementById('event-maps-link');
      const guestbookH3 = document.getElementById('guestbook-title');
      const copyrightEl = document.getElementById('footer-copyright');
      const copyrightSpans = Array.from(copyrightEl.querySelectorAll('span.whitespace-nowrap'));

      return {
        btnWidths: [music.width, theme.width, menu.width, btt.width],
        btnHeights: [music.height, theme.height, menu.height, btt.height],
        musicLeft: music.left,
        menuRightGap: window.innerWidth - menu.right,
        iconWidths,
        pageHeight: document.documentElement.scrollHeight,
        mapsLinkClientHeight: mapsLink.clientHeight,
        guestbookSpansCount: guestbookH3 ? guestbookH3.querySelectorAll('span.whitespace-nowrap').length : 0,
        copyrightSpansCount: copyrightSpans.length,
      };
    })()`);

    console.log('MOBILE_METRICS:', JSON.stringify(metrics, null, 2));

    const allSameSize = metrics.btnWidths.every((w) => Math.abs(w - 40) <= 1) &&
                        metrics.btnHeights.every((h) => Math.abs(h - 40) <= 1);
    const allSameIcons = new Set(metrics.iconWidths).size === 1 && metrics.iconWidths[0] === 20;
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

Ensure local server is running on port `8088` (start `rtk python3 -m http.server 8088 --bind 127.0.0.1` as daemon if needed), then run:
`rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`
Expected: FAIL on button size symmetry (`btt` = `48px`), edge alignment (`musicLeft` = `24px`), `compactPage`, `mapsSingleLine`, `guestbookWrappedCleanly`, and `copyrightWrappedCleanly`.

- [ ] **Step 3: Update `.safe-fixed-*`, `.glass-nav-icon`, `#music-btn.playing`, and floating buttons HTML in `index.html`**

Modify `index.html:64-79`:

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

Modify `index.html:166-177` and `index.html:291-306`:

```css
    .glass-nav .glass-nav-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--color-primary);
      transition: transform 0.25s ease, color 0.25s ease;
    }

    @media (min-width: 768px) {
      .glass-nav .glass-nav-icon {
        width: 1.375rem;
        height: 1.375rem;
      }
    }
```

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

Update floating buttons containers (`index.html:2006-2029` and `index.html:3091-3095`) to use identical `w-10 h-10 md:w-11 md:h-11` sizes (exact SVG icons wired in Task 4):

```html
  <!-- Music & Theme toggles: Xếp dọc đồng bộ trên cả Thiệp và Trang chính -->
  <div class="fixed safe-fixed-tl z-[100] flex flex-col items-center gap-2">
    <button aria-label="Bật/tắt nhạc nền"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md"
      id="music-btn" title="Bật nhạc nền">
      <svg class="ui-icon glass-nav-icon" id="music-icon" aria-hidden="true"><use href="#ico-volume-off" /></svg>
    </button>
    <button aria-label="Bật/tắt chế độ tối"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md"
      id="theme-toggle" title="Chế độ tối">
      <svg class="ui-icon glass-nav-icon" id="theme-icon" aria-hidden="true"><use href="#ico-dark-mode" /></svg>
    </button>
  </div>
  <audio id="bg-music" loop preload="none"></audio>

  <!-- Modern Hamburger Navigation -->
  <header class="fixed safe-fixed-tr z-[100]">
    <button aria-label="Mở menu điều hướng"
      class="glass-nav w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md"
      id="menu-btn">
      <svg class="ui-icon glass-nav-icon" id="menu-icon" aria-hidden="true"><use href="#ico-menu" /></svg>
    </button>
  </header>
```

```html
  <button aria-label="Quay lại đầu trang"
    class="glass-nav fixed safe-fixed-br z-[100] w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
    id="back-to-top" title="Quay lại đầu trang">
    <svg class="ui-icon glass-nav-icon" aria-hidden="true"><use href="#ico-arrow-up-double" /></svg>
  </button>
```

---

### Task 2: Compact Mobile Vertical Rhythm & Section Layouts (Hình 2–9)

**Files:**
- Modify: `tailwind.config.js:44-51`
- Modify: `index.html:226-232, 1328-1390, 2743-2807`

**Interfaces:**
- Consumes: `py-section-gap-mobile`, `.gallery-item`, `.wedding-cal-day`, `.wishes-scrollview`, `#intro`, `#gallery`.
- Produces: Reduced mobile section spacing (`section-gap-mobile: '44px'`), compact mobile couple portraits (`w-44 h-44`) so Groom + Bride fit cleanly in one viewport, and compact mobile gallery grid (`aspect-ratio: 4 / 4.6`, `gap-3`).

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

- [ ] **Step 2: Compact `.gallery-item`, `.wedding-cal-day`, and `.wishes-scrollview` CSS in `index.html`**

Modify `index.html:226-231`:

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

Modify `index.html:1328-1381`:

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
      transition: transform 0.2s ease;
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

- [ ] **Step 3: Compact `#intro` and `#gallery` sections in `index.html:2743-2806`**

Replace lines `2743-2806` (using `<svg class="ui-icon">` inline icons aligned with Task 4):

```html
  <!-- 2. Introduction Section (Couple) -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop max-w-container-max mx-auto px-margin-mobile md:px-gutter scroll-section perf-section"
    id="intro">
    <div class="text-center mb-7 md:mb-20 px-10 sm:px-0 reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">The Couple</p>
      <h2 class="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-5 whitespace-nowrap">Cô Dâu &amp; Chú Rể</h2>
      <div class="flex items-center justify-center gap-3 md:gap-4">
        <div class="h-px w-12 md:w-16 bg-outline/60"></div>
        <svg class="ui-icon w-4 h-4 md:w-[18px] md:h-[18px] text-primary" aria-hidden="true"><use href="#ico-heart-filled" /></svg>
        <div class="h-px w-12 md:w-16 bg-outline/60"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 lg:gap-28 items-start">
      <!-- Chú rể -->
      <div class="flex flex-col items-center text-center reveal reveal-left reveal-delay-1 bg-card/70 dark:bg-card/50 py-6 px-5 md:p-10 rounded-3xl border border-outline-variant/80 shadow-luxury">
        <div class="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 mb-3 md:mb-4 p-2 md:p-2.5 rounded-full border border-outline/50 bg-surface-lowest/40 shadow-inner">
          <div class="w-full h-full rounded-full overflow-hidden ring-1 ring-outline/30 shadow-xl">
            <img alt="Chú rể" class="w-full h-full object-cover rounded-full prevent-download" decoding="async"
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
            <img alt="Cô dâu" class="w-full h-full object-cover rounded-full prevent-download" decoding="async"
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

  <div aria-hidden="true" class="section-divider reveal"></div>

  <!-- 3. Wedding Gallery Grid -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface dark:bg-surface-lowest scroll-section overflow-x-clip perf-section" id="gallery">
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

### Task 3: Fix Mobile Text Wrapping & Compact `#events`, `#rsvp`, `footer` (Hình 4–9)

**Files:**
- Modify: `index.html:2810-3090, 3608-3705, 3820-3830, 4485-4495, 4918-4928`

**Interfaces:**
- Consumes: `#event-maps-link`, `#event-venue`, `#guestbook-title`, `#footer-copyright`, `#wishes-display`, `createGalleryItem`.
- Produces: Single-line `"XEM BẢN ĐỒ CHỈ ĐƯỜNG"` CTA, balanced non-orphaning `"Sổ Lưu Bút Gia Đình & Bạn Bè"` and `"© 2027 Đăng Khoa & Cẩm Nhung. Made with love."`, `decoding="async"` on gallery images, and compact mobile card paddings.

- [ ] **Step 1: Compact `#events`, `#rsvp`, and `footer` HTML in `index.html:2810-3090`**

Update `#events` (`index.html:2810-2910`):

```html
  <!-- 4. Wedding Banquet Details & Calendar -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-background scroll-section perf-section" id="events">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      <div class="text-center mb-7 md:mb-16 px-10 sm:px-0 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">The Celebration</p>
        <h2 class="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-5 whitespace-nowrap">Sự Kiện Trọng Đại</h2>
        <div class="flex items-center justify-center gap-3 md:gap-4">
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
          <svg class="ui-icon w-4 h-4 md:w-[18px] md:h-[18px] text-primary" aria-hidden="true"><use href="#ico-diamond" /></svg>
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-10 max-w-5xl mx-auto items-stretch">
        <!-- Cột 1: Thông tin Tiệc Chúc Mừng -->
        <div class="bg-card p-2.5 md:p-4 rounded-3xl shadow-luxury-lg border border-outline-variant flex flex-col reveal reveal-scale reveal-delay-1">
          <div class="border border-outline/40 rounded-2xl p-5 md:p-10 flex flex-col items-center justify-between text-center relative overflow-hidden flex-1">
            <div class="w-full flex flex-col items-center">
              <div class="w-12 h-12 md:w-15 md:h-15 rounded-full bg-surface-container flex items-center justify-center mb-3 md:mb-5 border border-outline/30 p-2.5 md:p-3.5">
                <svg class="ui-icon w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true"><use href="#ico-celebration" /></svg>
              </div>
              <p class="font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-[0.25em] uppercase mb-1.5 md:mb-2">Trân Trọng Kính Mời</p>
              <h3 class="font-headline-sm text-2xl sm:text-3xl md:text-4xl italic text-on-background mb-4 md:mb-8 whitespace-nowrap" id="event-title"></h3>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full border-y border-outline-variant/80 py-4 md:py-7">
                <div class="flex flex-col items-center justify-center sm:border-r sm:border-outline-variant/80 sm:pr-6 w-full sm:w-1/2 text-center">
                  <div class="flex items-center gap-1.5 text-primary mb-1 md:mb-2">
                    <svg class="ui-icon w-4 h-4 md:w-[18px] md:h-[18px]" aria-hidden="true"><use href="#ico-schedule" /></svg>
                    <p class="font-label-caps text-label-caps tracking-[0.22em] whitespace-nowrap">THỜI GIAN</p>
                  </div>
                  <p class="font-headline-sm text-xl md:text-2xl font-semibold text-on-background mb-0.5 md:mb-1 whitespace-nowrap" id="event-time"></p>
                  <p class="font-body-md text-sm md:text-base text-on-surface-variant [text-wrap:balance]" id="event-date"></p>
                </div>

                <div class="flex flex-col items-center justify-center sm:pl-6 w-full sm:w-1/2 text-center">
                  <div class="flex items-center gap-1.5 text-primary mb-1 md:mb-2">
                    <svg class="ui-icon w-4 h-4 md:w-[18px] md:h-[18px]" aria-hidden="true"><use href="#ico-location" /></svg>
                    <p class="font-label-caps text-label-caps tracking-[0.22em] whitespace-nowrap">ĐỊA ĐIỂM</p>
                  </div>
                  <p class="font-body-md text-base md:text-lg font-semibold text-on-background mb-0.5 md:mb-1 [text-wrap:balance]" id="event-venue"></p>
                  <p class="font-body-md text-on-surface-variant italic text-xs md:text-sm [text-wrap:balance]" id="event-address"></p>
                </div>
              </div>
            </div>

            <a class="mt-5 md:mt-8 bg-primary text-white dark:text-surface-lowest px-4 sm:px-8 py-3.5 md:py-4 rounded-full font-label-caps text-[10.5px] sm:text-label-caps font-semibold tracking-[0.12em] sm:tracking-[0.22em] whitespace-nowrap transition-all duration-300 hover:bg-tertiary hover:shadow-lg active:scale-95 shadow-md flex items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto"
              href="#" id="event-maps-link" target="_blank" rel="noopener noreferrer">
              <svg class="ui-icon w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" aria-hidden="true"><use href="#ico-map" /></svg>
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

              <div class="wedding-calendar-grid border-b border-outline-variant/70 pb-2 mb-2 font-label-caps text-[10px] md:text-[11px] tracking-widest text-on-surface-variant uppercase">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span class="text-primary font-bold">CN</span>
              </div>

              <div class="wedding-calendar-grid font-body-md text-on-background" id="wedding-calendar-days"></div>
            </div>

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

Update `#rsvp` (`index.html:2914-3072`) and `footer` (`index.html:3075-3089`):

```html
  <!-- 5. RSVP & Wishes Section -->
  <section class="py-section-gap-mobile md:py-section-gap-desktop bg-surface-container relative scroll-section perf-section" id="rsvp">
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
      <div class="text-center mb-7 md:mb-16 px-10 sm:px-0 reveal reveal-up">
        <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-2 md:mb-3">R.S.V.P &amp; Guestbook</p>
        <h2 class="font-headline-md text-[1.65rem] sm:text-3xl md:text-headline-md text-on-background italic mb-3 md:mb-4 whitespace-nowrap">Hiện Diện &amp; Lời Chúc</h2>
        <div class="flex items-center justify-center gap-3 md:gap-4">
          <div class="h-px w-12 md:w-16 bg-outline/60"></div>
          <svg class="ui-icon w-4 h-4 md:w-[18px] md:h-[18px] text-primary" aria-hidden="true"><use href="#ico-heart-filled" /></svg>
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
                <svg class="ui-icon w-5 h-5 md:w-6 md:h-6" aria-hidden="true"><use href="#ico-mail" /></svg>
                <span class="h-px w-8 bg-outline/50"></span>
              </div>
              <h3 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-1 whitespace-nowrap">Bạn sẽ đến chứ?</h3>
              <p class="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto [text-wrap:balance]">
                Hãy cho chúng tôi biết để chuẩn bị đón tiếp bạn thật chu đáo nhé!
              </p>
              <p class="font-label-caps text-[10px] text-primary tracking-[0.15em] mt-1.5" id="rsvp-deadline"></p>
            </div>
```

And Column 2 (`#guestbook-title` + `.wishes-scrollview`) + `footer`:

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
            ...
```

```html
  <!-- Footer -->
  <footer class="bg-background py-10 md:py-20 w-full text-center scroll-section border-t border-outline-variant/60 perf-section">
    <div class="max-w-container-max mx-auto px-margin-mobile flex flex-col items-center gap-unit reveal reveal-up">
      <p class="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase mb-1.5 md:mb-2">Forever &amp; Always</p>
      <div class="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-2.5 md:mb-4" id="footer-names"></div>
      <p class="font-body-md text-sm md:text-base text-on-surface-variant max-w-lg mb-4 md:mb-6 italic [text-wrap:balance]" id="footer-message"></p>
      <button
        class="mb-4 md:mb-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline/45 text-primary hover:bg-primary/10 font-label-caps text-xs tracking-[0.2em] whitespace-nowrap transition-all cursor-pointer relative z-20"
        id="footer-reopen-invitation-btn" onclick="reopenOnboardingDeck()" type="button">
        <svg class="ui-icon w-4 h-4" aria-hidden="true"><use href="#ico-book" /></svg>
        <span class="whitespace-nowrap">Xem lại lời mời</span>
      </button>
      <div class="h-px w-20 bg-outline/40 mb-4 md:mb-6"></div>
      <p class="font-label-caps text-[10px] sm:text-label-caps text-outline tracking-[0.12em] sm:tracking-[0.2em] leading-relaxed [text-wrap:balance]" id="footer-copyright"></p>
    </div>
  </footer>
```

- [ ] **Step 2: Add `formatVenueName`, `formatCopyrightText`, compact wish card templates, and `img.decoding = 'async'` in `index.html`**

In `initWeddingContent()` (`index.html:3608-3705`):

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

Apply inside `initWeddingContent()`:

```javascript
        document.getElementById('event-venue').innerHTML = formatVenueName(event.venueName);
        ...
        if (elEventVenue) elEventVenue.innerHTML = formatVenueName(event.venueName);
        ...
        document.getElementById('footer-copyright').innerHTML = formatCopyrightText(footer.copyright);
```

And update wish cards (`index.html:3697, 4488, 4921`) and `createGalleryItem` (`index.html:3821-3827`):

```javascript
            card.className = 'bg-surface/70 dark:bg-surface-container p-4 md:p-6 rounded-2xl border border-outline-variant/70 border-l-2 border-l-primary shadow-sm shrink-0';
            card.innerHTML = `
              <p class="font-body-md text-sm md:text-base italic text-on-surface mb-2 md:mb-3 leading-relaxed">"${String(w.message || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"</p>
              <p class="font-label-caps text-label-caps text-primary tracking-widest">— ${String(w.name || '').replace(/</g, '&lt;')}</p>
            `;
```

```javascript
        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover rounded-xl prevent-download';
        img.src = src;
        img.alt = `Ảnh cưới ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.setAttribute('draggable', 'false');
```

---

### Task 4: Permanently Eliminate Icon Font FOUT (`olume_off`/`ark_mode`) with Inline SVG Sprite & Slim Fonts

**Files:**
- Modify: `index.html:27-38, 2005-2050, 2345-2740, 2945-3135, 3863-3947, 4550-4573`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`

**Interfaces:**
- Consumes: `#music-icon`, `#theme-icon`, `#menu-icon`, `updateThemeUI()`, `updateMusicUI()`, `toggleMenu()`.
- Produces: Zero external `Material Symbols Outlined` download, unused `Cormorant Garamond` removed, `preconnect` headers added, `.ui-icon` inline SVG `<use href="#ico-..."/>` symbols for all 21 icons.

- [ ] **Step 1: Update `<head>` links and base `.ui-icon` CSS in `index.html:27-38`**

Replace lines `27-36` with `preconnect`, slim Google Fonts (`Playfair Display`, `Montserrat`, `Great Vibes`, `Alex Brush`), and `.ui-icon`:

```html
  <script src="colors.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin />
  <link rel="stylesheet" href="assets/tailwind.css" />
  <link
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600;1,700&amp;family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;family=Great+Vibes&amp;family=Alex+Brush&amp;display=swap"
    rel="stylesheet" />
  <style>
    .ui-icon {
      display: inline-block;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
      vertical-align: middle;
      overflow: hidden;
    }
```

- [ ] **Step 2: Add inline `<svg>` Symbol Sprite right after `<body>` and replace all remaining `<span class="material-symbols-outlined">` elements in `index.html`**

Insert immediately after `<body ...>` (`index.html:2005`):

```html
  <!-- Inline SVG UI Icon Sprite (0ms load, 0% FOUT text glitch) -->
  <svg xmlns="http://www.w3.org/2000/svg" class="hidden" aria-hidden="true">
    <symbol id="ico-volume-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" />
    </symbol>
    <symbol id="ico-volume-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </symbol>
    <symbol id="ico-dark-mode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </symbol>
    <symbol id="ico-light-mode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </symbol>
    <symbol id="ico-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
    </symbol>
    <symbol id="ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </symbol>
    <symbol id="ico-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </symbol>
    <symbol id="ico-heart-filled" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </symbol>
    <symbol id="ico-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </symbol>
    <symbol id="ico-schedule" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
    </symbol>
    <symbol id="ico-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" />
    </symbol>
    <symbol id="ico-near-me" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </symbol>
    <symbol id="ico-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" />
    </symbol>
    <symbol id="ico-person" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-5.5 8-5.5s8 2.2 8 5.5" />
    </symbol>
    <symbol id="ico-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </symbol>
    <symbol id="ico-group" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="8" r="3.2" /><path d="M2.5 19.5c0-2.8 2.9-4.5 6.5-4.5s6.5 1.7 6.5 4.5" /><path d="M16.5 11.2a3 3 0 1 0 0-6" /><path d="M17.5 15.2c2.4.5 4 1.9 4 4.3" />
    </symbol>
    <symbol id="ico-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </symbol>
    <symbol id="ico-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H12v16H4.5A2.5 2.5 0 0 0 2 21V5.5z" /><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H12v16h7.5a2.5 2.5 0 0 1 2.5 2V5.5z" />
    </symbol>
    <symbol id="ico-diamond" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" /><line x1="2" y1="9" x2="22" y2="9" />
    </symbol>
    <symbol id="ico-celebration" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="4 20 9 7 17 15 4 20" /><path d="M14 4v2m4.5.5L17 8m3 4h-2" />
    </symbol>
    <symbol id="ico-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </symbol>
    <symbol id="ico-arrow-down-double" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="7 7 12 12 17 7" /><polyline points="7 13 12 18 17 13" />
    </symbol>
    <symbol id="ico-arrow-up-double" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="17 11 12 6 7 11" /><polyline points="17 17 12 12 7 17" />
    </symbol>
    <symbol id="ico-chevron-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </symbol>
    <symbol id="ico-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </symbol>
  </svg>
```

Replace ALL remaining `.material-symbols-outlined` spans across Onboarding (`lines 2047, 2347, 2414, 2423, 2472, 2480, 2488, 2510, 2553, 2570, 2574, 2605, 2633, 2646, 2674`), Hero (`lines 2728, 2736`), Main RSVP inputs (`lines 2951, 2955, 2986, 3014, 3026`), Lightbox (`lines 3103, 3108, 3117`), and Form Popup (`line 3129`) with the matching `<svg class="ui-icon ..." aria-hidden="true"><use href="#ico-..." /></svg>` elements (keeping exact positioning classes like `absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none`).

- [ ] **Step 3: Update JS icon setters (`setSvgIcon`, `updateThemeUI`, `updateMusicUI`, `toggleMenu`)**

Add helper in `index.html` script:

```javascript
      function setSvgIcon(svgEl, symbolId) {
        if (!svgEl) return;
        const useEl = svgEl.querySelector('use');
        if (useEl) useEl.setAttribute('href', `#${symbolId}`);
        svgEl.dataset.icon = symbolId;
      }
```

Update `updateThemeUI()` (`index.html:3868-3874`):

```javascript
        function updateThemeUI() {
          const isDark = html.classList.contains('dark');
          setSvgIcon(icon, isDark ? 'ico-light-mode' : 'ico-dark-mode');
          btn.title = isDark ? 'Bật sáng' : 'Bật tối';
          btn.setAttribute('aria-label', isDark ? 'Bật chế độ sáng' : 'Bật chế độ tối');
        }
```

Update `updateMusicUI()` (`index.html:3915-3925`) and defer audio `src` assignment until first user play interaction (`initBackgroundMusic` + `tryPlayMusic`):

```javascript
      function initBackgroundMusic() {
        updateMusicUI(false);

        musicBtn.addEventListener('click', toggleMusic);
        envMusicBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleMusic();
        });
        bgMusic.addEventListener('ended', () => updateMusicUI(false));
      }

      function updateMusicUI(playing) {
        isMusicPlaying = playing;
        setSvgIcon(musicIcon, playing ? 'ico-volume-up' : 'ico-volume-off');
        musicBtn.classList.toggle('playing', playing);
        musicBtn.title = playing ? 'Tắt nhạc nền' : 'Bật nhạc nền';
        if (envMusicBtn) {
          envMusicBtn.classList.toggle('is-playing', playing);
          envMusicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
          envMusicBtn.title = playing ? 'Tắt nhạc nền' : 'Bật nhạc nền';
        }
      }

      function tryPlayMusic() {
        if (!bgMusic.getAttribute('src') && WEDDING_CONFIG.music?.src) {
          bgMusic.src = WEDDING_CONFIG.music.src;
          bgMusic.volume = WEDDING_CONFIG.music.volume ?? 0.4;
        }
        return bgMusic.play().then(() => {
          updateMusicUI(true);
          localStorage.setItem('wedding-music-playing', 'true');
          return true;
        }).catch(() => {
          updateMusicUI(false);
          return false;
        });
      }
```

Update `toggleMenu()` (`index.html:4555-4572`):

```javascript
      function toggleMenu() {
        const isActive = mobileMenu.classList.toggle('hidden');
        if (!isActive) {
          mobileMenu.classList.add('flex');
          lockMenuScroll();
          setTimeout(() => mobileMenu.classList.add('active'), 10);
          setSvgIcon(menuIcon, 'ico-close');
        } else {
          mobileMenu.classList.remove('active');
          unlockMenuScroll();
          setTimeout(() => {
            mobileMenu.classList.remove('flex');
            mobileMenu.classList.add('hidden');
          }, 350);
          setSvgIcon(menuIcon, 'ico-menu');
        }
      }
```

---

### Task 5: Add Adaptive Preloader / Loading Screen (`#page-loader`) for Zero-Glitch First Paint

**Files:**
- Modify: `index.html:32-45, 2005-2025, 3627-3640, 4535-4555`

**Interfaces:**
- Consumes: `document.fonts.ready`, `WEDDING_CONFIG.images`, `navigator.connection`.
- Produces: `#page-loader` full-screen inline-styled splash overlay (`opacity: 1` at frame 0), `dismissPageLoader()`, and `waitForCriticalReady(heroImgUrl)` which guarantees fonts + monogram/envelope are painted cleanly before fading out `#page-loader`, with adaptive timeout cap (`1600ms` strong / `3000ms` weak).

- [ ] **Step 1: Add inline `#page-loader` critical styles in `<head>` and HTML immediately inside `<body>`**

In `index.html` inside `<style>`:

```css
    /* Preloader — render ngay frame đầu tiên bằng CSS thuần để che FOUC / FOUT */
    #page-loader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #EFE3D3;
      color: #782536;
      transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.35s;
    }

    html.dark #page-loader {
      background-color: #231815;
      color: #F1D5AB;
    }

    #page-loader.is-dismissed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .loader-bar-track {
      width: 140px;
      height: 2px;
      border-radius: 9999px;
      overflow: hidden;
      background-color: rgba(120, 37, 54, 0.16);
    }

    html.dark .loader-bar-track {
      background-color: rgba(241, 213, 171, 0.18);
    }

    .loader-bar-fill {
      width: 45%;
      height: 100%;
      border-radius: 9999px;
      background-color: currentColor;
      animation: loaderSlide 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes loaderSlide {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(260%); }
    }
```

Insert `#page-loader` right at top of `<body>`:

```html
  <!-- Luxury Minimal Preloader Screen (0 external deps, hides any initial font/layout flash) -->
  <div id="page-loader" role="status" aria-live="polite" aria-label="Đang tải thiệp cưới">
    <div style="width:68px;height:68px;border-radius:9999px;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-family:Georgia,serif;font-size:20px;font-weight:600;letter-spacing:1.5px;">
      <span>K</span><span style="font-style:italic;font-size:15px;margin:0 3px;">&amp;</span><span>N</span>
    </div>
    <div class="loader-bar-track" aria-hidden="true">
      <div class="loader-bar-fill"></div>
    </div>
    <p style="margin-top:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.78;">Đang mở thiệp mời</p>
  </div>
```

- [ ] **Step 2: Add `initPageLoader(criticalImgUrl)` gated on `document.fonts.ready` + image decode + network-adaptive fail-safe timeout**

In `index.html` JS initialization:

```javascript
      function initPageLoader(criticalImgUrl, isWeakNetwork) {
        const loader = document.getElementById('page-loader');
        if (!loader) return;

        let done = false;
        const dismiss = () => {
          if (done) return;
          done = true;
          loader.classList.add('is-dismissed');
          setTimeout(() => {
            loader.style.display = 'none';
          }, 380);
        };

        const fontsReady = document.fonts?.ready
          ? document.fonts.ready.catch(() => {})
          : Promise.resolve();

        // Chỉ chờ preload ảnh chính nếu mạng đủ tốt; mạng yếu chỉ cần font & UI sẵn sàng
        const imgReady = (!isWeakNetwork && criticalImgUrl)
          ? new Promise((resolve) => {
              const img = new Image();
              img.decoding = 'async';
              img.onload = () => (img.decode ? img.decode().catch(() => {}).finally(resolve) : resolve());
              img.onerror = resolve;
              img.src = criticalImgUrl;
            })
          : Promise.resolve();

        const maxWaitMs = isWeakNetwork ? 2400 : 1600;
        const timeout = new Promise((resolve) => setTimeout(resolve, maxWaitMs));

        Promise.race([Promise.all([fontsReady, imgReady]), timeout]).then(() => {
          requestAnimationFrame(dismiss);
        });
      }
```

Call `const { heroImgUrl, isWeakNetwork } = ...` right after `initWeddingContent()` (`index.html:4544`) so `initPageLoader(heroImgUrl, isWeakNetwork)` dismisses smoothly once fonts + critical markup are settled!

---

### Task 6: GPU Compositor & Network-Aware Animation Optimization (Weak & Strong Networks)

**Files:**
- Modify: `index.html:138-198, 361-436, 728-764, 1110-1143, 1295-1305, 1446-1565, 1935-1953, 2063-2146, 2498-2506, 2700-2738, 3660-3666, 3792-3815, 4050-4082`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`

**Interfaces:**
- Consumes: `#onboarding-envelope`, `#onboarding-deck`, `#onboarding-step-3`, `#ob-event-map-iframe`, `#hero-slideshow`, `goToOnboardingStep()`, `dismissOnboardingDeck()`.
- Produces: Zero runtime SVG `feDropShadow` filters on fullscreen envelope SVG, `background-attachment: fixed` removed, redundant `will-change` & `backdrop-filter: blur(24px)` removed, `content-visibility: auto` on `.perf-section`, deferred `#ob-event-map-iframe` (`data-src` loaded only on Step 3), and automatic `html.perf-lite` tier for weak networks / constrained devices.

- [ ] **Step 1: Eliminate GPU bottlenecks in CSS & Envelope SVGs**

1. In `index.html:2063-2146`:
   - Remove `<filter id="env-bottom-shadow">` and `<filter id="env-top-flap-shadow">` from `<defs>`, and remove `filter="url(#env-bottom-shadow)"` / `filter="url(#env-top-flap-shadow)"` from the 6 paths (`mobile`/`tablet`/`desktop`).
   - Replace with lightweight non-filtered SVG soft stroke seams placed immediately BEFORE each fold path:
     - Bottom fold crease glow (example Mobile): `<path d="M0,775 L500,620 L1000,775" fill="none" stroke="#5A3522" stroke-width="10" vector-effect="non-scaling-stroke" opacity="0.06" transform="translate(0,-3)" />`
     - Top flap crease shadow (example Mobile): `<path d="M0,455 L500,620 L1000,455" fill="none" stroke="#4A2416" stroke-width="14" vector-effect="non-scaling-stroke" opacity="0.09" transform="translate(0,4)" />`
2. In `index.html:880-893` & `1269-1276`:
   - Replace `transform: rotateX(180deg)` 3D perspective flap animation (which triggers expensive layer flattens & repaints on mobile) with fast GPU-composited `transform: translate3d(0, -14%, 0) scaleY(0.4)` (`transform-origin: top center`) + `opacity: 0` over `0.58s cubic-bezier(0.22, 1, 0.36, 1)`, keeping `.ob-envelope-canvas` free of forced `preserve-3d` subtree overhead.
3. In `index.html:1298-1301`:
   - Remove stacked CSS SVG `filter: brightness(0.24) sepia(0.35) hue-rotate(-12deg) saturate(1.25)` on `.ob-envelope-folds-svg, .ob-envelope-flap-svg` in dark mode -> replace with `<style>` dark theme CSS fills / opacity `filter: brightness(0.26)` only on the static element cleanly, or dark-mode SVG `opacity: 0.28` over dark velvet `#231815` canvas — instantaneous 0ms dark switch!
4. In `index.html:1942`:
   - Remove `background-attachment: fixed;` from `html.dark body`.
5. In `index.html:151, 183, 704, 2688, 2718, 2726`:
   - Replace heavy `backdrop-filter: blur(24px)` on `#mobile-menu` with rich solid-tinted `rgba(245, 240, 235, 0.98)` / `rgba(48, 34, 29, 0.98)` (zero fullscreen live blur!).
   - Reduce `.glass-nav` backdrop blur from `16px` to `8px`.
   - Remove `.reveal-blur { filter: blur(8px); }` runtime filter animation (`index.html:391-393`).
   - Strip idle `will-change` declarations from `.reveal` (`line 368`), `.ob-stagger` (`line 1532`), `.ob-portrait-arch` (`lines 1760, 1770, 1836`), `.ob-meta-*` (`lines 1801, 1814`), `.onboarding-glass-card` (`line 1913`), keeping `will-change` only on top-level deck/step containers where active (`#onboarding-deck.is-animating` or `#onboarding-deck`).
6. Add `.perf-section` and `html.perf-lite` CSS rules in `index.html`:

```css
    /* Bỏ qua layout/paint cho các section ngoài màn hình cho đến khi cuộn tới */
    .perf-section {
      content-visibility: auto;
      contain-intrinsic-size: auto 600px;
    }

    /* Chế độ tự động tối ưu cho mạng yếu / máy cấu hình thấp */
    html.perf-lite .glass-nav,
    html.perf-lite .backdrop-blur-md {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    html.perf-lite .onboarding-bg-image {
      transform: none !important;
      transition: opacity 0.45s ease !important;
    }

    html.perf-lite #onboarding-deck.deck-settled .onboarding-bg-image {
      transform: none !important;
      transition: none !important;
    }

    html.perf-lite .ob-stagger {
      transform: none !important;
      transition: opacity 0.25s ease !important;
    }

    html.perf-lite .reveal {
      transition: opacity 0.35s ease, transform 0.35s ease !important;
    }

    html.perf-lite .ob-wax-seal {
      filter: drop-shadow(0 6px 10px rgba(62, 16, 26, 0.25)) !important;
    }
```

- [ ] **Step 2: Implement `initAdaptivePerformanceProfile()` + Lazy Google Maps Iframe (`data-src`) + Deferred Slideshow Image Loading**

In `index.html` script:

```javascript
      function detectWeakPerformanceProfile() {
        try {
          const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          const eff = conn?.effectiveType || '';
          const slowConn = Boolean(conn?.saveData) || eff === 'slow-2g' || eff === '2g' || (eff === '3g' && (conn?.downlink || 10) < 1.5);
          const lowHardware = (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2)
            || (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);
          return slowConn || lowHardware;
        } catch {
          return false;
        }
      }

      const isWeakPerf = detectWeakPerformanceProfile();
      if (isWeakPerf) {
        document.documentElement.classList.add('perf-lite');
      }
```

In `initWeddingContent()` (`index.html:3661-3666`): store `mapIframe.dataset.src` instead of loading `mapIframe.src` on page startup:

```javascript
        const fullLocationQuery = [event.venueName, event.venueAddress].filter(Boolean).join(', ');
        const mapIframe = document.getElementById('ob-event-map-iframe');
        if (mapIframe && fullLocationQuery) {
          mapIframe.dataset.src = `https://maps.google.com/maps?q=${encodeURIComponent(fullLocationQuery)}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;
        }
```

In `goToOnboardingStep(targetStep)` (`index.html:4065-4082`): load the map iframe lazily ONLY when opening Step 3 (`clamped === 3`):

```javascript
        if (clamped === 3) {
          const mapIframe = document.getElementById('ob-event-map-iframe');
          if (mapIframe && !mapIframe.getAttribute('src') && mapIframe.dataset.src) {
            mapIframe.src = mapIframe.dataset.src;
          }
        }
```

In `initHeaderSlideshow(headerImages)` (`index.html:3792-3815`): only set `backgroundImage` on Slide `0` immediately; defer assigning `backgroundImage` for slides `1..N` via `data-bg` until `showSlide(index)` or idle (`dismissOnboardingDeck`), so Hero doesn't download 6 background images while still on the Envelope!

```javascript
        imagesToUse.forEach((url, i) => {
          const slide = document.createElement('div');
          slide.className = `slideshow-image absolute inset-0 bg-cover bg-center ${i === 0 ? 'active-slide' : ''}`;
          if (i === 0) {
            slide.style.backgroundImage = `url('${url}')`;
          } else {
            slide.dataset.bg = url;
          }
          slide.style.opacity = i === 0 ? '1' : '0';
          container.insertBefore(slide, overlay);
        });
```

And inside `showSlide(index)` (`index.html:4586-4605`):

```javascript
        slides.forEach((slide, i) => {
          if (i === index && !slide.style.backgroundImage && slide.dataset.bg) {
            slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
            delete slide.dataset.bg;
          }
          slide.style.opacity = i === index ? '1' : '0';
          slide.classList.toggle('active-slide', i === index);
        });
```

- [ ] **Step 3: Create and run E2E UI-Load + Network Performance Verification Script**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`:

```javascript
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9237;
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
    this.events = [];
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
      } else if (msg.method) {
        this.events.push(msg);
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
    await cdp.send('Network.enable');

    // Test Case 1: Block Google Fonts + Simulate Weak 3G Network to verify zero FOUT UI glitch & fail-safe loader dismissal
    await cdp.send('Network.setBlockedURLs', {
      urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'],
    });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: 50000,
      uploadThroughput: 50000,
      connectionType: 'cellular3g',
    });

    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await new Promise((r) => setTimeout(r, 350));

    const earlyState = await evalExpr(cdp, `(() => {
      const loader = document.getElementById('page-loader');
      const bodyText = document.body.innerText;
      const musicHtml = document.getElementById('music-btn')?.innerHTML || '';
      const mapIframe = document.getElementById('ob-event-map-iframe');
      const mp3Loaded = performance.getEntriesByType('resource').some((r) => r.name.includes('.mp3'));
      return {
        hasLoader: Boolean(loader),
        hasRawIconLigature: /volume_off|dark_mode|light_mode|celebration|keyboard_double_arrow/.test(bodyText),
        usesSvgIcon: musicHtml.includes('<svg') && musicHtml.includes('<use'),
        mapIframeHasImmediateSrc: Boolean(mapIframe?.getAttribute('src')),
        mp3LoadedOnStartup: mp3Loaded,
        svgFilterCount: document.querySelectorAll('feDropShadow').length,
      };
    })()`);

    console.log('EARLY_WEAK_NET_STATE:', JSON.stringify(earlyState, null, 2));

    // Wait for fail-safe timeout so loader never hangs on slow/blocked network
    await new Promise((r) => setTimeout(r, 2600));
    const afterTimeout = await evalExpr(cdp, `(() => {
      const loader = document.getElementById('page-loader');
      return {
        loaderDismissed: loader?.classList.contains('is-dismissed'),
      };
    })()`);

    console.log('AFTER_TIMEOUT_STATE:', JSON.stringify(afterTimeout, null, 2));

    // Step through to Step 3 to verify lazy iframe loads only on Step 3
    await evalExpr(cdp, `
      window.openWeddingEnvelope();
      true;
    `);
    await new Promise((r) => setTimeout(r, 900));
    await evalExpr(cdp, `window.goToOnboardingStep(2); true;`);
    await new Promise((r) => setTimeout(r, 750));
    await evalExpr(cdp, `window.goToOnboardingStep(3); true;`);
    await new Promise((r) => setTimeout(r, 750));

    const step3State = await evalExpr(cdp, `(() => {
      const mapIframe = document.getElementById('ob-event-map-iframe');
      return {
        mapIframeLoadedOnStep3: Boolean(mapIframe?.getAttribute('src')?.includes('maps.google.com')),
      };
    })()`);

    console.log('STEP3_STATE:', JSON.stringify(step3State, null, 2));

    if (
      !earlyState.hasLoader ||
      earlyState.hasRawIconLigature ||
      !earlyState.usesSvgIcon ||
      earlyState.mapIframeHasImmediateSrc ||
      earlyState.mp3LoadedOnStartup ||
      earlyState.svgFilterCount !== 0 ||
      !afterTimeout.loaderDismissed ||
      !step3State.mapIframeLoadedOnStep3
    ) {
      console.error('PERF/LOAD FAIL!');
      process.exitCode = 1;
    } else {
      console.log('PASS: Load glitch & weak/strong network performance checks passed!');
    }
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 4: Run CSS rebuild + full verification suite**

Run:
```bash
rtk npm run build:css
rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js
rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js
rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guest_e2e.js
```
Expected: All 3 verification scripts print `PASS`!
