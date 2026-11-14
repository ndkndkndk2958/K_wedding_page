# Paginated & Swipeable Wedding Gallery (Max 3 Rows + 50 Demo Photos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap the `#gallery` section to at most 3 rows whenever `images.gallery.length > 10` (6 photos per page on 2-column mobile, 9 photos per page on 3-column tablet/desktop), let guests swipe horizontally or click `Prev` / `Next` (plus page dots) to browse albums smoothly, sync Lightbox across all items with a `current / total` counter, and populate a 50-photo demo dataset in `config.src.js` -> `config.js`.

**Architecture:**
- Keep `#gallery` backward-compatible for small albums (`<= 10` photos render in the existing static grid with controls hidden).
- When `sources.length > 10`, paginate strictly at the active breakpoint's 3-row capacity (`cols = window.innerWidth >= 768 ? 3 : 2`, `pageSize = cols * 3`, giving `6` items/page on mobile and `9` items/page on desktop). Only the active page's cards are mounted in `#gallery-container` (`max 6–9 DOM nodes` instead of `50`), preserving low RAM/DOM cost and keeping `pageHeight` compact.
- Support both button pagination (`#gallery-prev`, `#gallery-next`, `#gallery-dots`) and finger swipe (`touchstart` / `touchmove` / `touchend` on `#gallery-viewport` with vertical-scroll detection via `touch-pan-y` and GPU `translate3d` drag feedback), synced with `matchMedia('(min-width: 768px)')` reflow and global Lightbox indices (`gallerySources[0..49]`).
- Guard `initHeaderSlideshow()` fallback so expanding `images.gallery` to 50 demo items never spawns 50 Hero background slides or 50 pagination dots.

**Tech Stack:** HTML5, Vanilla JS ES6 (`matchMedia`, Touch Events, GPU CSS `@keyframes`), Tailwind CSS v3 (`assets/tailwind.css` rebuilt via `npm run build:css`), XOR-encoded config (`npm run build:config`), Chrome Headless CDP E2E verification.

## Global Constraints

- **No Auto-Commits:** Never run `git commit` unless explicitly requested by the user.
- **RTK Command Prefix:** Always prefix shell commands with `rtk`.
- **Preserve Existing Features:** Keep desktop (`md:`) layout proportions, 5-step onboarding deck, light/dark themes, `?g=` personalized guest links, `perf-lite` weak-network profile, and `.perf-section` anchor scroll handling 100% functional.
- **Strict Asset Builds:** Run `rtk npm run build:config` after editing `config.src.js`, and `rtk npm run build:css` after editing HTML Tailwind classes in `index.html`.
- **Single-Threshold Rule:** Paginate and show `#gallery-controls` ONLY when `sources.length > 10`. Small albums (`<= 10`) render the static grid unchanged.

---

## File Structure

- Modify: `config.src.js:78-88` — Expand `images.gallery` to a 50-photo demo array built from verified HTTP-200 `aida-public` wedding image URLs arranged so vertically adjacent cards vary.
- Regenerate: `config.js` — Recompiled via `rtk npm run build:config`.
- Modify: `index.html:380-390` — Add `.gallery-page-enter-next`, `.gallery-page-enter-prev`, GPU keyframes, and `html.perf-lite` / `prefers-reduced-motion` reduced-motion gallery transitions.
- Modify: `index.html:3012-3016` — Wrap `#gallery-container` inside `#gallery-viewport` (`overflow-x-clip touch-pan-y`) and add `#gallery-controls` (`#gallery-prev`, `#gallery-page-indicator`, `#gallery-next`, `#gallery-dots`).
- Modify: `index.html:3310-3333` — Add `#lightbox-counter` pill inside `#lightbox`.
- Modify: `index.html:4126-4201, 5320-5355` — Cap Hero fallback slice in `initHeaderSlideshow()`, implement paginated/swipeable `initGallery()`, `renderGalleryPage()`, `goToGalleryPage()`, `bindGalleryNavigation()`, breakpoint resize listener (`matchMedia`), and sync `#lightbox-counter`.
- Regenerate: `assets/tailwind.css` — Recompiled via `rtk npm run build:css`.
- Test (New E2E CDP Suite): `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js` — Tests 50-photo pagination (`390×844` mobile & `1440×900` desktop), touch swipe gestures, Prev/Next/Dot controls, Lightbox global index sync, Hero dot cap, breakpoint crossing, and `<= 10` non-paginated threshold via CDP `Fetch` intercept.

---

### Task 1: 50-Photo Demo Dataset & Hero Slideshow Fallback Cap

**Files:**
- Modify: `config.src.js:78-88`
- Regenerate: `config.js` (via `scripts/encode-config.js`)
- Modify: `index.html:4126-4132`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js` (Part 1 assertion run)

**Interfaces:**
- Consumes: `WEDDING_CONFIG.images.gallery`, `WEDDING_CONFIG.images.header`.
- Produces: 50-item `WEDDING_CONFIG.images.gallery` compiled into `config.js`, and a safe `.slice(0, 6)` cap in `initHeaderSlideshow()` so Hero slideshow dots never exceed 6 items.

- [ ] **Step 1: Write the failing Task 1 verification check**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_task1.js` to assert 50 demo gallery entries in `config.js` and `<= 6` Hero slideshow slides/dots in `index.html`:

```javascript
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9241;
const BASE_URL = 'http://127.0.0.1:8088';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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
  const cfg = require('/Users/tanh/SourceCode/K_Project/K_wedding_page/config.src.js');
  const galleryLen = Array.isArray(cfg.images?.gallery) ? cfg.images.gallery.length : 0;
  if (galleryLen < 50) {
    throw new Error(`Expected >= 50 demo gallery items in config.src.js, got ${galleryLen}`);
  }

  const userDataDir = `/tmp/chrome-verify-gal-t1-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank',
  ]);
  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      pageTarget = targets.find((t) => t.type === 'page');
      if (pageTarget && pageTarget.webSocketDebuggerUrl) break;
    } catch {}
  }
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Failed to find Chrome debugging target');
  }

  try {
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

    const metrics = await evalExpr(cdp, `(() => ({
      slideCount: document.querySelectorAll('#hero-slideshow .slideshow-image').length,
      dotCount: document.querySelectorAll('#slideshow-dots button').length
    }))()`);

    console.log('TASK1_METRICS:', JSON.stringify(metrics));
    if (metrics.slideCount > 6 || metrics.dotCount > 6 || metrics.slideCount < 2) {
      throw new Error(`Expected 2..6 Hero slides & dots, got ${JSON.stringify(metrics)}`);
    }
    console.log('PASS: Task 1 demo 50-photo config & Hero cap verified!');
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 2: Run the Task 1 test to verify it fails**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_task1.js`
Expected: FAIL with `Expected >= 50 demo gallery items in config.src.js, got 7`

- [ ] **Step 3: Expand `config.src.js` to 50 demo gallery photos and cap Hero fallback in `index.html`**

First, update `config.src.js` (define `DEMO_GALLERY_BASE` above `WEDDING_CONFIG` with the 4 verified HTTP-200 `aida-public` URLs staggered as an 8-item pattern, generating `50` entries):

```javascript
// Pool ảnh demo đã verify HTTP 200 — luân phiên thứ tự để các hàng kề nhau không bị lặp cạnh nhau
const DEMO_GALLERY_BASE = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAr7HhXtbvsdZrznWPINk24223SjSAVo69piwJ61lZZx0JYGVMHUSbzlAaxv68T9j9A29OJc4Lv5Grn43643I-Suj76VNcGXnvnkmtVcLiWqjdP9vPYeceheLu_CBmy4dznoZnFwmQ0pSrIy3BUbZP6bKFLc7pt5iPVObCTW3Jk81KxWmYEahmDuvNR4LHpccjyKpS4Xt4dlodqkv9Jb5Gnc0T_GlxcVfTgxwW0-W1-0m3hf0JUfL2GPn2WO8bm3SJ03Tc_x5xky6I',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1na3YtCbXhfShYsdh-x6g698S_UBY1HuecCjTB1J5N_W0TL3XundJeU46Z6G5EFbcwCcCkL6AX8cOZcAkCjD85J4rRTnBenJR67JtG-iCT9Bm5zPvuvUyEjMtI-2CNDnB_DeYbo6Vh8dLxeK3qel7rgeSAhAuRUjdNJfmwrm8xwn6zJTWV4uXUlymmOe7t5XGhyXef0HFQiLaCNPK1CA7bCQaVsttgdg0tMWvEu4Ax2Iz9Wcb71wcToxkh_e5NOwOM1knirH0kUI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAnTsjgWVFxewxtFrXhwdYhQothNLBHYuzwVomF08ReyS3xbthWaGnGRkB0PllcCaqtuW5iAOdFL-hNC3K-Y646pHrUeiwO4JIV2_3XJbLjZLQU2koGCJK55LF2ZN02ckvPPC2s_C-oMuhbZjzi3EJ6G5wBmUzQ_ku2sxUfk8SEkjEGTYWSd27CpS1TTgW5hwq97SIRA5QWhzUysFPhdfAYIMJa3nbDKR2FFhwMAcvQodtr6P9RVfsyUjE5KQdP42UW8Aavuvb2rcM',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhNx-olKiek-26zh9ZqpAbD5OMlj1HiAe6SUu0tW5syymbYP1WsqY0A4NpAyiRwh6oQWu03-jo5VzrLEkZ2Idk22FxyFZ1hs0kaIsR30Nr_Q_IHft3ui8XHHT_9bH73UULWzMm4AwWufqy2rPctoVt1MiB2qV_d-cKnF_rfIKqCeKWfsYIskrufrGk9yxR2X-xbdKzEu6_xnNduYFgCirdQoib19O5WG_xg3RYEfVGezLIWZKn1U7rcDfomt3zomaffUGb21l0D8',
];
const DEMO_GALLERY_PATTERN = [
    DEMO_GALLERY_BASE[0],
    DEMO_GALLERY_BASE[1],
    DEMO_GALLERY_BASE[2],
    DEMO_GALLERY_BASE[3],
    DEMO_GALLERY_BASE[2],
    DEMO_GALLERY_BASE[0],
    DEMO_GALLERY_BASE[3],
    DEMO_GALLERY_BASE[1],
];
```

And replace lines `78-88` in `config.src.js` with:

```javascript
        // Album gallery — demo 50 ảnh (khi > 10 ảnh sẽ tự phân trang tối đa 3 hàng + nút Next/Prev & vuốt ngang)
        gallery: Array.from({ length: 50 }, (_, i) => DEMO_GALLERY_PATTERN[i % DEMO_GALLERY_PATTERN.length]),
```

Second, compile `config.js`:

Run: `rtk npm run build:config`
Expected: `Successfully compiled config.src.js -> config.js`

Third, cap Hero fallback slideshow count in `index.html:4126-4131` so a 50-item gallery never renders 50 Hero slides or 50 dots:

```javascript
      function initHeaderSlideshow(headerImages) {
        const container = document.getElementById('hero-slideshow');
        const overlay = document.getElementById('hero-overlay');
        const validImages = (headerImages || []).filter(url => url && !url.includes('/aida/'));
        const imagesToUse = (validImages.length > 0 ? validImages : (WEDDING_CONFIG.images.gallery || [])).slice(0, 6);
```

- [ ] **Step 4: Run Task 1 test to verify it passes**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_task1.js`
Expected: `TASK1_METRICS: {"slideCount":6,"dotCount":6}` and `PASS: Task 1 demo 50-photo config & Hero cap verified!`

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# git add config.src.js config.js index.html
# git commit -m "feat(gallery): add 50-photo demo config and cap hero slideshow fallback"
```

---

### Task 2: Max-3-Row Paginated & Swipeable Gallery (`> 10` Photos) + Next/Prev + Lightbox Sync

**Files:**
- Modify: `index.html:380-390` (CSS transitions for page switches & `perf-lite` override)
- Modify: `index.html:3012-3016` (`#gallery-viewport` + `#gallery-controls` markup)
- Modify: `index.html:3310-3333` (`#lightbox-counter` markup)
- Modify: `index.html:4155-4201, 5317-5354` (Gallery pagination state, touch swipe, breakpoint resize listener, and Lightbox counter sync)
- Regenerate: `assets/tailwind.css`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js`

**Interfaces:**
- Consumes: `#gallery-viewport`, `#gallery-container`, `#gallery-controls`, `#gallery-prev`, `#gallery-next`, `#gallery-page-current`, `#gallery-page-total`, `#gallery-total-count`, `#gallery-dots`, `#lightbox-counter`, `gallerySources`, `openLightbox(index)`, `navigateLightbox(direction)`.
- Produces:
  - Constant `GALLERY_PAGINATION_THRESHOLD = 10`
  - Helper `getGalleryColumns()`, `getGalleryPageSize()`, `renderGalleryGridItems(container, items, startIndex, animateReveal)`
  - State & Navigation `initGallery(galleryItems)`, `renderGalleryPage(pageIndex, direction)`, `goToGalleryPage(targetPage, direction)`, `bindGalleryNavigation()`
  - Responsive breakpoint handler `window.matchMedia('(min-width: 768px)')` preserving the active top item index when switching between 2-column (`6/page`) and 3-column (`9/page`).

- [ ] **Step 1: Write the failing comprehensive gallery pagination & swipe E2E test**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js`:

```javascript
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9242;
const BASE_URL = 'http://127.0.0.1:8088';
const ARTIFACT_DIR = '/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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
    throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
  }
  return res.result ? res.result.value : undefined;
}

function encodeConfigScript(cfgObj) {
  const jsonBytes = Buffer.from(JSON.stringify(cfgObj), 'utf8');
  const xorBytes = Buffer.alloc(jsonBytes.length);
  for (let i = 0; i < jsonBytes.length; i++) xorBytes[i] = jsonBytes[i] ^ 42;
  return `window._encodedConfig = "${xorBytes.toString('base64')}";`;
}

async function dismissDeckAndScrollToGallery(cdp) {
  await evalExpr(cdp, `
    if (typeof window.dismissOnboardingDeck === 'function') {
      window.dismissOnboardingDeck();
    } else {
      document.getElementById('ob-skip-to-site-btn')?.click();
    }
    true;
  `);
  await sleep(1600);
  await evalExpr(cdp, `(() => {
    const el = document.getElementById('gallery');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return true;
  })()`);
  await sleep(600);
}

(async () => {
  const userDataDir = `/tmp/chrome-verify-gallery-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank',
  ]);

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      pageTarget = targets.find((t) => t.type === 'page');
      if (pageTarget && pageTarget.webSocketDebuggerUrl) break;
    } catch {}
  }
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Failed to find Chrome debugging target');
  }

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  try {
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // === 1. MOBILE (390x844): 50 photos => 6 per page (max 3 rows x 2 cols), 9 pages ===
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await sleep(1500);
    await dismissDeckAndScrollToGallery(cdp);

    const mobileP1 = await evalExpr(cdp, `(() => {
      const items = document.querySelectorAll('#gallery-container .gallery-item');
      const controls = document.getElementById('gallery-controls');
      const prev = document.getElementById('gallery-prev');
      const next = document.getElementById('gallery-next');
      const cur = document.getElementById('gallery-page-current')?.textContent;
      const tot = document.getElementById('gallery-page-total')?.textContent;
      const cnt = document.getElementById('gallery-total-count')?.textContent;
      const dots = document.querySelectorAll('#gallery-dots button').length;
      const distinctRows = new Set(Array.from(items).map(el => Math.round(el.getBoundingClientRect().top))).size;
      const alts = Array.from(items).map(el => el.querySelector('img')?.alt || '');
      return {
        itemCount: items.length,
        distinctRows,
        controlsHidden: controls ? controls.classList.contains('hidden') : true,
        prevDisabled: prev ? prev.disabled : false,
        nextDisabled: next ? next.disabled : true,
        cur, tot, cnt, dots, alts,
        overflowX: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    console.log('MOBILE PAGE 1:', JSON.stringify(mobileP1));
    assert(mobileP1.itemCount === 6, `Mobile page 1 must show 6 items, got ${mobileP1.itemCount}`);
    assert(mobileP1.distinctRows <= 3, `Mobile page 1 must have <= 3 rows, got ${mobileP1.distinctRows}`);
    assert(!mobileP1.controlsHidden, 'Gallery controls must be visible when > 10 photos');
    assert(mobileP1.prevDisabled === true, 'Prev must be disabled on Page 1');
    assert(mobileP1.nextDisabled === false, 'Next must be enabled on Page 1');
    assert(mobileP1.cur === '1' && mobileP1.tot === '9' && mobileP1.cnt === '50', `Unexpected counter: ${mobileP1.cur}/${mobileP1.tot} (${mobileP1.cnt})`);
    assert(mobileP1.dots === 9, `Expected 9 dots on mobile for 50 photos, got ${mobileP1.dots}`);
    assert(!mobileP1.overflowX, 'Must not horizontally overflow mobile viewport');

    // Screenshot mobile Page 1
    const shotM1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_gallery_mobile_p1.png'), Buffer.from(shotM1.data, 'base64'));

    // Click Next -> Page 2 (items 7..12)
    await evalExpr(cdp, `document.getElementById('gallery-next').click(); true;`);
    await sleep(450);

    const mobileP2 = await evalExpr(cdp, `(() => {
      const items = document.querySelectorAll('#gallery-container .gallery-item');
      const cur = document.getElementById('gallery-page-current')?.textContent;
      const firstOpacity = getComputedStyle(items[0]).opacity;
      const firstAlt = items[0]?.querySelector('img')?.alt;
      return {
        itemCount: items.length,
        cur,
        prevDisabled: document.getElementById('gallery-prev').disabled,
        firstOpacity,
        firstAlt
      };
    })()`);
    console.log('MOBILE PAGE 2 (after Next):', JSON.stringify(mobileP2));
    assert(mobileP2.itemCount === 6 && mobileP2.cur === '2', `Expected page 2 with 6 items, got ${JSON.stringify(mobileP2)}`);
    assert(mobileP2.prevDisabled === false, 'Prev must be enabled on Page 2');
    assert(parseFloat(mobileP2.firstOpacity) === 1, `Page 2 cards must be visible (opacity 1), got ${mobileP2.firstOpacity}`);
    assert(mobileP2.firstAlt.includes('7'), `Expected Page 2 item 1 alt to reflect #7, got ${mobileP2.firstAlt}`);

    // Test Touch Swipe Left (Page 2 -> Page 3) via TouchEvent dispatch
    await evalExpr(cdp, `(() => {
      const vp = document.getElementById('gallery-viewport');
      function fireTouch(type, x, y) {
        const touch = new Touch({ identifier: 1, target: vp, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x, pageY: y });
        const list = type === 'touchstart' || type === 'touchmove' ? [touch] : [];
        vp.dispatchEvent(new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: list,
          targetTouches: list,
          changedTouches: [touch]
        }));
      }
      fireTouch('touchstart', 300, 420);
      fireTouch('touchmove', 230, 422);
      fireTouch('touchmove', 140, 424);
      fireTouch('touchend', 140, 424);
      return true;
    })()`);
    await sleep(450);

    const mobileP3Swipe = await evalExpr(cdp, `document.getElementById('gallery-page-current')?.textContent`);
    console.log('MOBILE PAGE 3 (after swipe left):', mobileP3Swipe);
    assert(mobileP3Swipe === '3', `Expected swipe left to reach Page 3, got ${mobileP3Swipe}`);

    // Open item #2 on Page 3 (= global index 13 => photo 14 / 50) in Lightbox
    await evalExpr(cdp, `document.querySelectorAll('#gallery-container .gallery-item')[1].click(); true;`);
    await sleep(450);
    const lbState = await evalExpr(cdp, `(() => ({
      hidden: document.getElementById('lightbox').classList.contains('hidden'),
      counter: document.getElementById('lightbox-counter')?.textContent?.trim()
    }))()`);
    console.log('LIGHTBOX SYNC CHECK:', JSON.stringify(lbState));
    assert(!lbState.hidden && lbState.counter === '14 / 50', `Expected lightbox counter "14 / 50", got ${JSON.stringify(lbState)}`);
    await evalExpr(cdp, `document.getElementById('lightbox-close').click(); true;`);
    await sleep(400);

    // Jump to Last Page (Page 9 -> 2 items, 1 row, Next disabled)
    await evalExpr(cdp, `document.querySelectorAll('#gallery-dots button')[8].click(); true;`);
    await sleep(450);
    const mobileP9 = await evalExpr(cdp, `(() => ({
      cur: document.getElementById('gallery-page-current')?.textContent,
      itemCount: document.querySelectorAll('#gallery-container .gallery-item').length,
      nextDisabled: document.getElementById('gallery-next').disabled
    }))()`);
    console.log('MOBILE LAST PAGE 9:', JSON.stringify(mobileP9));
    assert(mobileP9.cur === '9' && mobileP9.itemCount === 2 && mobileP9.nextDisabled === true, `Last mobile page invalid: ${JSON.stringify(mobileP9)}`);

    // === 2. DESKTOP (1440x900): resize reflow & 9 per page (3x3), 6 pages ===
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(500);
    const desktopAfterResize = await evalExpr(cdp, `(() => ({
      cur: document.getElementById('gallery-page-current')?.textContent,
      tot: document.getElementById('gallery-page-total')?.textContent,
      itemCount: document.querySelectorAll('#gallery-container .gallery-item').length,
      nextDisabled: document.getElementById('gallery-next').disabled
    }))()`);
    console.log('DESKTOP AFTER RESIZE FROM MOBILE P9 (item index 48 => Page 6):', JSON.stringify(desktopAfterResize));
    assert(desktopAfterResize.cur === '6' && desktopAfterResize.tot === '6' && desktopAfterResize.itemCount === 5 && desktopAfterResize.nextDisabled === true,
      `Expected resize from item 48 to land on Desktop Page 6/6 with 5 items, got ${JSON.stringify(desktopAfterResize)}`);

    // Jump to Desktop Page 1 (9 items, <= 3 rows)
    await evalExpr(cdp, `document.querySelectorAll('#gallery-dots button')[0].click(); true;`);
    await sleep(450);
    await evalExpr(cdp, `document.getElementById('gallery').scrollIntoView({ behavior: 'instant', block: 'start' }); true;`);
    await sleep(400);
    const desktopP1 = await evalExpr(cdp, `(() => {
      const items = document.querySelectorAll('#gallery-container .gallery-item');
      const distinctRows = new Set(Array.from(items).map(el => Math.round(el.getBoundingClientRect().top))).size;
      return {
        cur: document.getElementById('gallery-page-current')?.textContent,
        tot: document.getElementById('gallery-page-total')?.textContent,
        itemCount: items.length,
        distinctRows
      };
    })()`);
    console.log('DESKTOP PAGE 1:', JSON.stringify(desktopP1));
    assert(desktopP1.itemCount === 9 && desktopP1.distinctRows === 3 && desktopP1.tot === '6', `Desktop P1 failed: ${JSON.stringify(desktopP1)}`);

    const shotD1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_gallery_desktop_p1.png'), Buffer.from(shotD1.data, 'base64'));

    // === 3. THRESHOLD <= 10 EDGE CASE via CDP Fetch intercept on config.js ===
    const baseCfg = require('/Users/tanh/SourceCode/K_Project/K_wedding_page/config.src.js');
    const smallCfg = {
      ...baseCfg,
      images: {
        ...baseCfg.images,
        gallery: baseCfg.images.gallery.slice(0, 8),
      },
    };
    const smallConfigBody = Buffer.from(encodeConfigScript(smallCfg), 'utf8').toString('base64');

    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*/config.js*' }] });
    cdp.ws.addEventListener('message', async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Fetch.requestPaused') {
        await cdp.send('Fetch.fulfillRequest', {
          requestId: msg.params.requestId,
          responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'application/javascript; charset=utf-8' }],
          body: smallConfigBody,
        });
      }
    });

    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await sleep(1400);
    const smallState = await evalExpr(cdp, `(() => ({
      itemCount: document.querySelectorAll('#gallery-container .gallery-item').length,
      controlsHidden: document.getElementById('gallery-controls').classList.contains('hidden')
    }))()`);
    console.log('SMALL ALBUM (8 <= 10) STATE:', JSON.stringify(smallState));
    assert(smallState.itemCount === 8 && smallState.controlsHidden === true,
      `Expected <= 10 photos to render all 8 inline with controls hidden, got ${JSON.stringify(smallState)}`);

    console.log('PASS: All gallery pagination, swipe, lightbox sync, and threshold tests succeeded!');
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 2: Run the Task 2 test to verify it fails**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js`
Expected: FAIL because `#gallery-controls` doesn't exist yet and `#gallery-container` renders all `50` items at once (`Mobile page 1 must show 6 items, got 50`).

- [ ] **Step 3: Implement CSS, HTML, and JS changes in `index.html` and rebuild Tailwind CSS**

1. **CSS (`index.html` right after line 384 inside `<style>`):** Add lightweight GPU-composited gallery page enter keyframes and `perf-lite` / reduced-motion overrides:

```css
    /* Gallery page swipe/switch animations (GPU transform + opacity only) */
    #gallery-container {
      will-change: auto;
    }

    #gallery-container.is-swiping {
      transition: none;
    }

    #gallery-container.is-snap-back {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes galleryEnterNext {
      from {
        opacity: 0;
        transform: translate3d(28px, 0, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes galleryEnterPrev {
      from {
        opacity: 0;
        transform: translate3d(-28px, 0, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    #gallery-container.gallery-enter-next {
      animation: galleryEnterNext 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }

    #gallery-container.gallery-enter-prev {
      animation: galleryEnterPrev 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      #gallery-container.gallery-enter-next,
      #gallery-container.gallery-enter-prev {
        animation: none;
      }
    }

    html.perf-lite #gallery-container.gallery-enter-next,
    html.perf-lite #gallery-container.gallery-enter-prev {
      animation-duration: 0.16s;
    }
```

2. **HTML `#gallery` section (`index.html:3012-3015`):** Replace `#gallery-container` block with `#gallery-viewport` wrapper + `#gallery-controls`:

```html
    <div id="gallery-viewport" class="relative max-w-container-max mx-auto px-margin-mobile md:px-gutter overflow-x-clip touch-pan-y pb-2 md:pb-8">
      <div
        class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-7"
        id="gallery-container"></div>

      <!-- Gallery Pagination & Swipe Controls (shown automatically when gallery > 10 images) -->
      <div id="gallery-controls" class="hidden flex-col items-center gap-3 mt-5 md:mt-8 select-none" aria-label="Điều hướng album ảnh">
        <div class="flex items-center justify-center gap-4 md:gap-6">
          <button id="gallery-prev" type="button"
            class="w-10 h-10 md:w-11 md:h-11 rounded-full border border-outline-variant bg-card text-on-background hover:border-primary hover:text-primary disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Trang ảnh trước" title="Trang trước">
            <svg class="ui-icon w-5 h-5" aria-hidden="true"><use href="#ico-chevron-left"></use></svg>
          </button>

          <p id="gallery-page-indicator"
            class="font-label-caps text-[11px] tracking-[0.16em] text-on-surface-variant whitespace-nowrap tabular-nums">
            Trang <span id="gallery-page-current" class="font-semibold text-on-background">1</span> / <span id="gallery-page-total">1</span> · <span id="gallery-total-count">0</span> ảnh
          </p>

          <button id="gallery-next" type="button"
            class="w-10 h-10 md:w-11 md:h-11 rounded-full border border-outline-variant bg-card text-on-background hover:border-primary hover:text-primary disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Trang ảnh tiếp theo" title="Trang sau">
            <svg class="ui-icon w-5 h-5" aria-hidden="true"><use href="#ico-chevron-right"></use></svg>
          </button>
        </div>

        <div id="gallery-dots" class="flex flex-wrap items-center justify-center gap-1.5 max-w-xs md:max-w-md" aria-label="Chọn trang album"></div>
      </div>
    </div>
```

3. **HTML `#lightbox` counter (`index.html` right before closing `</div>` of `#lightbox` around line 3332):**

```html
    <div id="lightbox-counter"
      class="glass-nav absolute bottom-5 left-1/2 -translate-x-1/2 z-[210] px-4 py-1.5 rounded-full font-label-caps text-[11px] tracking-[0.2em] text-primary tabular-nums pointer-events-none select-none"
      aria-live="polite"></div>
```

4. **JS Gallery Pagination, Swipe, Resize & Lightbox Sync (`index.html:4155-4201` and `5317-5355`):**
Replace `createGalleryItem` and `initGallery` (`index.html:4155-4200`) with:

```javascript
      const GALLERY_PAGINATION_THRESHOLD = 10;
      const GALLERY_MAX_ROWS = 3;
      let galleryPage = 0;
      let galleryLastCols = 0;
      let galleryControlsBound = false;

      function getGalleryColumns() {
        return window.innerWidth >= 768 ? 3 : 2;
      }

      function getGalleryPageSize() {
        return getGalleryColumns() * GALLERY_MAX_ROWS;
      }

      function createGalleryItem(src, globalIndex, options = {}) {
        const { immediateReveal = false, eagerLoad = false, localIndex = globalIndex } = options;
        const wrapper = document.createElement('div');
        wrapper.className = immediateReveal
          ? 'gallery-item reveal revealed overflow-hidden rounded-2xl bg-card p-1.5 md:p-2.5 shadow-luxury border border-outline-variant/80'
          : 'gallery-item reveal reveal-up overflow-hidden rounded-2xl bg-card p-1.5 md:p-2.5 shadow-luxury border border-outline-variant/80';
        if (!immediateReveal) {
          wrapper.style.transitionDelay = `${(localIndex % 3) * 0.1}s`;
        }
        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover rounded-xl prevent-download';
        img.src = src;
        img.alt = `Ảnh cưới ${globalIndex + 1}`;
        img.loading = eagerLoad ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.setAttribute('draggable', 'false');
        wrapper.appendChild(img);

        wrapper.addEventListener('click', () => openLightbox(globalIndex));

        return wrapper;
      }

      function renderGalleryGridItems(container, items, startIndex, options = {}) {
        const { immediateReveal = false, eagerLoad = false } = options;
        container.innerHTML = '';

        const remainder = items.length % 3;
        const mainCount = remainder === 0 ? items.length : items.length - remainder;

        items.slice(0, mainCount).forEach((src, localIdx) => {
          container.appendChild(createGalleryItem(src, startIndex + localIdx, {
            immediateReveal,
            eagerLoad,
            localIndex: localIdx,
          }));
        });

        const tail = items.slice(mainCount);
        if (tail.length > 0) {
          const lastRow = document.createElement('div');
          lastRow.className = immediateReveal
            ? 'gallery-last-row col-span-2 md:col-span-3 reveal revealed'
            : 'gallery-last-row col-span-2 md:col-span-3 reveal reveal-up';
          tail.forEach((src, localIdx) => {
            const item = createGalleryItem(src, startIndex + mainCount + localIdx, {
              immediateReveal,
              eagerLoad,
              localIndex: localIdx,
            });
            item.classList.remove('reveal', 'reveal-up', 'revealed');
            item.classList.add('gallery-last-row__item');
            lastRow.appendChild(item);
          });
          container.appendChild(lastRow);
        }
      }

      function updateGalleryPaginationUI(totalPages) {
        const controls = document.getElementById('gallery-controls');
        if (!controls) return;

        if (gallerySources.length <= GALLERY_PAGINATION_THRESHOLD || totalPages <= 1) {
          controls.classList.add('hidden');
          controls.classList.remove('flex');
          return;
        }

        controls.classList.remove('hidden');
        controls.classList.add('flex');

        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        const curEl = document.getElementById('gallery-page-current');
        const totalEl = document.getElementById('gallery-page-total');
        const countEl = document.getElementById('gallery-total-count');
        const dotsEl = document.getElementById('gallery-dots');

        if (prevBtn) prevBtn.disabled = galleryPage <= 0;
        if (nextBtn) nextBtn.disabled = galleryPage >= totalPages - 1;
        if (curEl) curEl.textContent = String(galleryPage + 1);
        if (totalEl) totalEl.textContent = String(totalPages);
        if (countEl) countEl.textContent = String(gallerySources.length);

        if (dotsEl) {
          if (totalPages > 12) {
            dotsEl.classList.add('hidden');
            dotsEl.innerHTML = '';
          } else {
            dotsEl.classList.remove('hidden');
            dotsEl.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
              const dot = document.createElement('button');
              dot.type = 'button';
              dot.setAttribute('aria-label', `Trang ${i + 1}`);
              if (i === galleryPage) dot.setAttribute('aria-current', 'page');
              dot.className = `h-2 rounded-full transition-all duration-300 ${i === galleryPage ? 'w-6 bg-primary' : 'w-2 bg-outline-variant hover:bg-primary/60'}`;
              dot.addEventListener('click', () => {
                if (i !== galleryPage) {
                  goToGalleryPage(i, i > galleryPage ? 1 : -1);
                }
              });
              dotsEl.appendChild(dot);
            }
          }
        }
      }

      function renderGalleryPage(pageIndex, options = {}) {
        const { direction = 0, immediateReveal = false, eagerLoad = false } = options;
        const container = document.getElementById('gallery-container');
        if (!container) return;

        if (gallerySources.length <= GALLERY_PAGINATION_THRESHOLD) {
          galleryPage = 0;
          renderGalleryGridItems(container, gallerySources, 0, { immediateReveal: false, eagerLoad: false });
          updateGalleryPaginationUI(1);
          return;
        }

        const pageSize = getGalleryPageSize();
        const totalPages = Math.max(1, Math.ceil(gallerySources.length / pageSize));
        galleryPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
        galleryLastCols = getGalleryColumns();

        const startIdx = galleryPage * pageSize;
        const slice = gallerySources.slice(startIdx, startIdx + pageSize);

        container.classList.remove('gallery-enter-next', 'gallery-enter-prev', 'is-swiping', 'is-snap-back');
        container.style.transform = '';
        renderGalleryGridItems(container, slice, startIdx, { immediateReveal, eagerLoad });

        if (direction !== 0) {
          const animClass = direction > 0 ? 'gallery-enter-next' : 'gallery-enter-prev';
          requestAnimationFrame(() => {
            container.classList.add(animClass);
          });
        }

        updateGalleryPaginationUI(totalPages);
      }

      function goToGalleryPage(targetPage, direction) {
        if (gallerySources.length <= GALLERY_PAGINATION_THRESHOLD) return;
        const pageSize = getGalleryPageSize();
        const totalPages = Math.max(1, Math.ceil(gallerySources.length / pageSize));
        const clamped = Math.max(0, Math.min(targetPage, totalPages - 1));
        if (clamped === galleryPage) return;
        const dir = typeof direction === 'number' && direction !== 0
          ? direction
          : (clamped > galleryPage ? 1 : -1);
        renderGalleryPage(clamped, { direction: dir, immediateReveal: true, eagerLoad: true });
      }

      function bindGalleryNavigation() {
        if (galleryControlsBound) return;
        galleryControlsBound = true;

        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        const viewport = document.getElementById('gallery-viewport');
        const container = document.getElementById('gallery-container');

        prevBtn?.addEventListener('click', () => goToGalleryPage(galleryPage - 1, -1));
        nextBtn?.addEventListener('click', () => goToGalleryPage(galleryPage + 1, 1));

        // Swipe ngang trên thiết bị cảm ứng (không cản trở cuộn dọc trang)
        if (viewport && container) {
          let touchStartX = 0;
          let touchStartY = 0;
          let lastDeltaX = 0;
          let gestureAxis = null;

          viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1 || gallerySources.length <= GALLERY_PAGINATION_THRESHOLD) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            lastDeltaX = 0;
            gestureAxis = null;
          }, { passive: true });

          viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1 || gallerySources.length <= GALLERY_PAGINATION_THRESHOLD) return;
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;

            if (gestureAxis === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
              gestureAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }
            if (gestureAxis !== 'x') return;

            lastDeltaX = dx;
            const pageSize = getGalleryPageSize();
            const totalPages = Math.max(1, Math.ceil(gallerySources.length / pageSize));
            const atEdge = (galleryPage === 0 && dx > 0) || (galleryPage >= totalPages - 1 && dx < 0);
            const damped = Math.max(-72, Math.min(72, dx * (atEdge ? 0.25 : 0.45)));

            container.classList.remove('is-snap-back', 'gallery-enter-next', 'gallery-enter-prev');
            container.classList.add('is-swiping');
            container.style.transform = `translate3d(${damped}px, 0, 0)`;
          }, { passive: true });

          const finishSwipe = () => {
            if (gestureAxis !== 'x') return;
            container.classList.remove('is-swiping');

            const pageSize = getGalleryPageSize();
            const totalPages = Math.max(1, Math.ceil(gallerySources.length / pageSize));
            const threshold = 45;

            if (lastDeltaX < -threshold && galleryPage < totalPages - 1) {
              goToGalleryPage(galleryPage + 1, 1);
            } else if (lastDeltaX > threshold && galleryPage > 0) {
              goToGalleryPage(galleryPage - 1, -1);
            } else {
              container.classList.add('is-snap-back');
              container.style.transform = '';
            }
            gestureAxis = null;
          };

          viewport.addEventListener('touchend', finishSwipe, { passive: true });
          viewport.addEventListener('touchcancel', finishSwipe, { passive: true });
        }

        // Tự động điều chỉnh số trang khi vượt ngưỡng responsive 768px mà giữ nguyên vị trí ảnh đang xem
        const mq = window.matchMedia('(min-width: 768px)');
        const onBreakpointChange = () => {
          if (gallerySources.length <= GALLERY_PAGINATION_THRESHOLD) return;
          const newCols = getGalleryColumns();
          if (newCols === galleryLastCols) return;
          const oldPageSize = (galleryLastCols || newCols) * GALLERY_MAX_ROWS;
          const anchorItemIndex = galleryPage * oldPageSize;
          const newPage = Math.floor(anchorItemIndex / getGalleryPageSize());
          const gallerySection = document.getElementById('gallery');
          const alreadyRevealed = Boolean(gallerySection?.querySelector('.reveal.revealed'));
          renderGalleryPage(newPage, { direction: 0, immediateReveal: alreadyRevealed, eagerLoad: alreadyRevealed });
          if (!alreadyRevealed) observeRevealElements();
        };
        mq.addEventListener('change', onBreakpointChange);
      }

      function initGallery(galleryItems) {
        gallerySources.length = 0;
        const sources = (galleryItems || []).map(item => typeof item === 'string' ? item : item.src);
        gallerySources.push(...sources);
        galleryLastCols = getGalleryColumns();
        galleryPage = 0;

        bindGalleryNavigation();
        renderGalleryPage(0, { direction: 0, immediateReveal: false, eagerLoad: false });
      }
```

And update `openLightbox` / `navigateLightbox` (`index.html:5320-5354`) to update `#lightbox-counter`:

```javascript
      function updateLightboxCounter() {
        const counterEl = document.getElementById('lightbox-counter');
        if (!counterEl) return;
        if (gallerySources.length === 0) {
          counterEl.textContent = '';
          return;
        }
        counterEl.textContent = `${currentLightboxIndex + 1} / ${gallerySources.length}`;
      }

      function openLightbox(index) {
        currentLightboxIndex = index;
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');

        img.classList.remove('loaded');
        img.src = gallerySources[currentLightboxIndex];
        img.onload = () => img.classList.add('loaded');
        updateLightboxCounter();

        lightbox.classList.remove('hidden');
        // trigger reflow
        lightbox.offsetWidth;
        lightbox.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('opacity-100');
        setTimeout(() => {
          lightbox.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
      }

      function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + gallerySources.length) % gallerySources.length;
        const img = document.getElementById('lightbox-img');
        img.classList.remove('loaded');
        updateLightboxCounter();
        setTimeout(() => {
          img.src = gallerySources[currentLightboxIndex];
          img.onload = () => img.classList.add('loaded');
        }, 150);
      }
```

And rebuild Tailwind CSS so `.touch-pan-y`, `tabular-nums`, `#gallery-controls` spacing utilities compile into `assets/tailwind.css`:

Run: `rtk npm run build:css`
Expected: `Done in ...ms.`

- [ ] **Step 4: Run the Task 2 E2E test to verify all gallery pagination, swipe, Lightbox sync, and threshold tests pass**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_gallery_pagination.js`
Expected: `PASS: All gallery pagination, swipe, lightbox sync, and threshold tests succeeded!`

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# git add index.html assets/tailwind.css
# git commit -m "feat(gallery): paginate >10 gallery photos to max 3 rows with prev/next and touch swipe"
```

---

### Task 3: Full Regression Verification & Visual Screenshot Review

**Files:**
- Inspect: `verify_gallery_mobile_p1.png`, `verify_gallery_desktop_p1.png` (captured by `verify_gallery_pagination.js` in Task 2)
- Run existing regression suites (`verify_responsive_mobile.js`, `verify_load_and_perf.js`, `verify_guest_e2e.js`)

**Interfaces:**
- Verifies zero regressions across floating button proportions, mobile height (`<= 5500px`), `perf-lite` weak-network profile, `.perf-section` anchor jumps (`#events`, `#rsvp`), and `?g=` guest invitation flow.

- [ ] **Step 1: Run mobile responsive regression suite**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`
Expected: `PASS: All mobile responsive checks succeeded!` (`pageHeight <= 5500`, `btnWidths/Heights: [40,40,40,40]`, zero horizontal overflow).

- [ ] **Step 2: Run web loading & GPU performance regression suite**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`
Expected: `PASS: All load and GPU performance checks succeeded!` (`slideCount === 6`, anchor jumps `#events` and `#rsvp` accurate within `<= 8px`, zero console/HTTP errors).

- [ ] **Step 3: Run guest personalization (`?g=`) E2E suite**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guest_e2e.js`
Expected: `ALL E2E CHECKS PASSED!`

- [ ] **Step 4: Visually inspect mobile (`verify_gallery_mobile_p1.png`) and desktop (`verify_gallery_desktop_p1.png`) screenshots**

Inspect both generated PNGs with `read_file` to verify alignment, spacing between `#gallery-container` and `#gallery-controls`, crispness of Prev/Next circular buttons, centered dots, and zero overlap with floating `#back-to-top` or `#music-btn` / `#menu-btn`.

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# Wait for explicit user approval before staging/committing any files.
```
