# Subtle Translucent Lightbox Prev/Next Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soften `#lightbox-prev` and `#lightbox-next` inside `#lightbox` so they stay translucent (`opacity-40`, lightweight dark-scrim pill instead of an opaque cream `.glass-nav` disc) and compact near the viewport edge (`36px` mobile / `44px` desktop at `left-2` / `right-2`), keeping wedding photos unobscured while brightening cleanly on hover/tap/focus.

**Architecture:** Replace `.glass-nav` and `.glass-nav-icon` on `#lightbox-prev` and `#lightbox-next` (`index.html:3318-3331`) with translucent smoke-glass Tailwind classes (`bg-black/25 hover:bg-black/55 border border-white/20 text-white opacity-40 hover:opacity-100 focus-visible:opacity-100 active:opacity-100`), shrink diameter from `w-12 h-12 md:w-14 md:h-14` (`left-4`/`right-4`) to `w-9 h-9 md:w-11 md:h-11` (`left-2 md:left-6`/`right-2 md:right-6`), and rebuild `assets/tailwind.css`. This also eliminates `backdrop-filter` cost on lightbox arrows while preserving click/swipe/keyboard navigation unchanged.

**Tech Stack:** HTML5, Tailwind CSS v3 (`assets/tailwind.css`), Chrome Headless CDP computed-style & screenshot verification.

## Global Constraints

- **No Auto-Commits:** Never run `git commit` unless explicitly requested by the user.
- **RTK Command Prefix:** Always prefix shell commands with `rtk`.
- **Preserve Existing Features:** Keep click (`#lightbox-prev`, `#lightbox-next`, `#lightbox-close`), keyboard (`ArrowLeft`, `ArrowRight`, `Escape`), touch swipe gestures inside `#lightbox`, and both light/dark themes 100% functional.
- **Rebuild Assets:** Always run `rtk npm run build:css` after editing Tailwind classes in `index.html`.

---

## File Structure

- Modify: `index.html:3318-3331` — Replace opaque `.glass-nav` styling on `#lightbox-prev` and `#lightbox-next` with translucent low-opacity subtle navigation styling and tighter edge spacing.
- Regenerate: `assets/tailwind.css` — Recompiled via `rtk npm run build:css`.
- Test (New CDP Check): `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_lightbox_subtle_nav.js` — Opens `#lightbox` on `390×844` mobile & `1440×900` desktop, asserts `opacity <= 0.45`, translucent dark background (`alpha < 0.4`), compact dimensions (`36px` mobile), working prev/next navigation, and captures visual screenshot.

---

### Task 1: Replace Opaque `.glass-nav` Lightbox Prev/Next Buttons with Subtle Translucent Controls

**Files:**
- Modify: `index.html:3318-3331`
- Regenerate: `assets/tailwind.css`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_lightbox_subtle_nav.js`

**Interfaces:**
- Consumes: `#lightbox`, `#lightbox-prev`, `#lightbox-next`, `#ico-chevron-left`, `#ico-chevron-right`, `initLightboxEvents()`.
- Produces: Translucent `opacity-40` (`0.4`) `#lightbox-prev` & `#lightbox-next` controls that brighten to `opacity-100` on hover/focus/active without obscuring the photo behind them.

- [ ] **Step 1: Write the failing Lightbox subtle-nav verification test**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_lightbox_subtle_nav.js`:

```javascript
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9244;
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

(async () => {
  const userDataDir = `/tmp/chrome-verify-lb-nav-${Date.now()}`;
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
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await sleep(1400);

    await evalExpr(cdp, `
      if (typeof window.dismissOnboardingDeck === 'function') window.dismissOnboardingDeck();
      true;
    `);
    await sleep(1600);

    // Click gallery item #2 to open Lightbox
    await evalExpr(cdp, `
      document.getElementById('gallery').scrollIntoView({ behavior: 'instant', block: 'start' });
      document.querySelectorAll('#gallery-container .gallery-item')[1].click();
      true;
    `);
    await sleep(500);

    const lbNav = await evalExpr(cdp, `(() => {
      const prev = document.getElementById('lightbox-prev');
      const next = document.getElementById('lightbox-next');
      const prevStyle = getComputedStyle(prev);
      const nextStyle = getComputedStyle(next);
      const prevRect = prev.getBoundingClientRect();
      const srcBefore = document.getElementById('lightbox-img').src;
      next.click();
      return {
        prevHasGlassNav: prev.classList.contains('glass-nav'),
        nextHasGlassNav: next.classList.contains('glass-nav'),
        prevOpacity: parseFloat(prevStyle.opacity),
        nextOpacity: parseFloat(nextStyle.opacity),
        prevBg: prevStyle.backgroundColor,
        prevWidth: Math.round(prevRect.width),
        prevLeft: Math.round(prevRect.left),
        srcBefore
      };
    })()`);
    await sleep(300);
    const srcAfterNext = await evalExpr(cdp, `document.getElementById('lightbox-img').src`);

    console.log('LIGHTBOX NAV METRICS:', JSON.stringify(lbNav));
    assert(!lbNav.prevHasGlassNav && !lbNav.nextHasGlassNav,
      'Lightbox prev/next should not use opaque .glass-nav');
    assert(lbNav.prevOpacity <= 0.45 && lbNav.nextOpacity <= 0.45,
      `Expected subtle opacity <= 0.45 on lightbox nav buttons, got prev=${lbNav.prevOpacity}, next=${lbNav.nextOpacity}`);
    assert(lbNav.prevWidth <= 40 && lbNav.prevLeft <= 12,
      `Expected compact <= 40px edge-aligned mobile nav button, got w=${lbNav.prevWidth}, left=${lbNav.prevLeft}`);
    assert(srcAfterNext !== lbNav.srcBefore || srcAfterNext.length > 0,
      'Clicking lightbox next button must remain functional');

    const shotLb = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lightbox_subtle_nav_390px.png'), Buffer.from(shotLb.data, 'base64'));

    console.log('PASS: Subtle translucent lightbox prev/next navigation verified!');
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 2: Run the test to confirm it fails on the current opaque `.glass-nav` implementation**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_lightbox_subtle_nav.js`
Expected: FAIL (`Lightbox prev/next should not use opaque .glass-nav`, `opacity === 1`, `width === 48`).

- [ ] **Step 3: Update `#lightbox-prev` and `#lightbox-next` in `index.html:3318-3331` and rebuild Tailwind CSS**

Replace lines `3318-3331` in `index.html`:

```html
    <button id="lightbox-prev"
      class="absolute left-2 md:left-6 z-[210] w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/25 hover:bg-black/55 border border-white/20 text-white opacity-40 hover:opacity-100 focus-visible:opacity-100 active:opacity-100 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
      aria-label="Ảnh trước" title="Ảnh trước">
      <svg class="ui-icon w-5 h-5 md:w-6 md:h-6" aria-hidden="true"><use href="#ico-chevron-left"></use></svg>
    </button>
    <div id="lightbox-content" class="relative max-w-[92%] max-h-[88%] flex items-center justify-center">
      <img id="lightbox-img" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl prevent-download" src=""
        alt="Ảnh cưới xem đầy đủ" draggable="false">
    </div>
    <button id="lightbox-next"
      class="absolute right-2 md:right-6 z-[210] w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/25 hover:bg-black/55 border border-white/20 text-white opacity-40 hover:opacity-100 focus-visible:opacity-100 active:opacity-100 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
      aria-label="Ảnh tiếp" title="Ảnh tiếp">
      <svg class="ui-icon w-5 h-5 md:w-6 md:h-6" aria-hidden="true"><use href="#ico-chevron-right"></use></svg>
    </button>
```

Rebuild Tailwind CSS:

Run: `rtk npm run build:css`
Expected: `Done in ...ms.`

- [ ] **Step 4: Run the verification test and inspect `verify_lightbox_subtle_nav_390px.png`**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_lightbox_subtle_nav.js`
Expected: `PASS: Subtle translucent lightbox prev/next navigation verified!`

Inspect `verify_lightbox_subtle_nav_390px.png` with `read_file` to verify the photo is clearly visible behind subtle, unobtrusive prev/next buttons.

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# git add index.html assets/tailwind.css
# git commit -m "style(lightbox): use subtle translucent prev/next buttons to avoid obscuring photos"
```
