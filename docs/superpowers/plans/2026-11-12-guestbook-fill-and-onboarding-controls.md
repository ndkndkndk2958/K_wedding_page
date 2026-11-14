# Guestbook Full-Frame Balance & Onboarding Horizontal Floating Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the cut-off `#wishes-display` scroll container inside Column 2 (`Sổ Lưu Bút Gia Đình & Bạn Bè`) on 2-column tablet landscape / desktop viewports so it fills 100% of its stretched card without empty bottom whitespace, and arrange `#music-btn` and `#theme-toggle` horizontally while `body.onboarding-open` is active (envelope + Steps 1–4) with guaranteed safe-zone clearance above every onboarding popup while preserving their vertical layout on the main website.

**Architecture:**
- **Task 1 (Guestbook Full-Frame Fill on `>= 1024px`):** Wrap `#wishes-display` inside a `relative flex-1 lg:min-h-[390px]` bounds container and apply `lg:absolute lg:inset-0` plus `@media (min-width: 1024px) { .wishes-scrollview { max-height: none; height: 100%; } }` so CSS Grid's `items-stretch` row height (driven by Column 1's RSVP form) becomes the exact inner height of `#wishes-display` — zero hardcoded `390px` cutoff and zero content overflow pushing Column 1 taller. Mobile (`< 768px`, `270px`) and portrait tablet (`768–1023px`, `390px`) keep bounded vertical heights.
- **Task 2 (Horizontal Onboarding Controls & Popup Overlap Prevention):** Add `id="floating-top-controls"` to the top-left button wrapper (`index.html:2217`) and set `body.onboarding-open #floating-top-controls { flex-direction: row; }` so `#music-btn` and `#theme-toggle` sit side-by-side (`y: 12..52px` mobile / `24..68px` desktop) during onboarding and revert automatically to vertical `flex-col` once `body.onboarding-open` is removed upon entering the main page. Shift safe vertical insets from `.onboarding-stage` onto `#onboarding-deck` (`padding: 4rem 0 3.75rem` mobile, `5.25rem 0 4rem` `>= 640px`) and change `.onboarding-step` `max-height` to `100%` so every `position: absolute` onboarding step centers strictly inside the non-overlapping safe zone below the buttons and above `#onboarding-dots`.

**Tech Stack:** HTML5, CSS Flexbox/Grid, Tailwind CSS v3 (`assets/tailwind.css` rebuilt via `npm run build:css`), Chrome Headless CDP layout & bounding-box E2E verification.

## Global Constraints

- **No Auto-Commits:** Never run `git commit` unless explicitly requested by the user.
- **RTK Command Prefix:** Always prefix shell commands with `rtk`.
- **Preserve Existing Features:** Keep mobile/desktop main-page floating controls vertical (`flex-col`), keep `pageHeight <= 5500` on `390×844` mobile, and preserve all onboarding step transitions, dynamic wish submissions, and light/dark themes.
- **Rebuild Assets:** Always run `rtk npm run build:css` after editing HTML utility classes in `index.html`.

---

## File Structure

- Modify: `index.html:714-730, 862-875, 1461-1476, 1542-1547, 2071-2080` — Add `#floating-top-controls` `body.onboarding-open` horizontal rule, `.wishes-scrollview` `1024px+` full-height rules, and move `#onboarding-deck` / `.onboarding-stage` vertical safe padding cleanly so `position: absolute` `.onboarding-step` cards never intersect top controls.
- Modify: `index.html:2217, 2542, 3256` — Add `id="floating-top-controls"` to top-left control stack; bound `#onboarding-step-1` `min-height`; wrap `#wishes-display` with `<div class="relative flex-1 lg:min-h-[390px]">` and add `lg:absolute lg:inset-0` on `#wishes-display`.
- Regenerate: `assets/tailwind.css` — Compiled via `rtk npm run build:css`.
- Test (New E2E CDP Suite): `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js` — Measures `#wishes-display` bottom fill gap on `1024×768` & `1440×900`, verifies onboarding horizontal button orientation + zero bounding-box overlap across mobile `390×844` & `375×667` Steps 1–4, verifies main-page vertical button orientation, and captures screenshots.

---

### Task 1: Fill Full Stretched Frame in Guestbook Card (`>= 1024px` Tablet Landscape & Desktop)

**Files:**
- Modify: `index.html:1461-1476`
- Modify: `index.html:3256-3282`
- Regenerate: `assets/tailwind.css`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js` (Part 1 assertion)

**Interfaces:**
- Consumes: `#rsvp` 2-column grid (`grid-cols-1 lg:grid-cols-2 items-stretch`), `#wishes-display` (`.wishes-scrollview`).
- Produces: Dynamic `100%`-height scrollable `#wishes-display` at `min-width: 1024px` (`lg:`) matching Column 1's bottom edge with `<= 48px` trailing card padding instead of a ~180px dead void.

- [ ] **Step 1: Write the failing Guestbook card fill & button-layout test script**

Create `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`:

```javascript
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9243;
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
  const userDataDir = `/tmp/chrome-verify-gb-ob-${Date.now()}`;
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

    // 1. Check Guestbook Fill on Tablet Landscape (1024x768) where lg:grid-cols-2 activates
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 820,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
    await sleep(1400);

    await evalExpr(cdp, `
      if (typeof window.dismissOnboardingDeck === 'function') window.dismissOnboardingDeck();
      true;
    `);
    await sleep(1500);
    await evalExpr(cdp, `(() => {
      document.getElementById('rsvp').scrollIntoView({ behavior: 'instant', block: 'center' });
      return true;
    })()`);
    await sleep(500);

    const gbMetrics = await evalExpr(cdp, `(() => {
      const wishesEl = document.getElementById('wishes-display');
      const cardEl = wishesEl.closest('.bg-card');
      const rsvpCard = document.querySelector('#rsvp .bg-card');
      const cardRect = cardEl.getBoundingClientRect();
      const wishesRect = wishesEl.getBoundingClientRect();
      const paddingBottom = parseFloat(getComputedStyle(cardEl).paddingBottom);
      const bottomGap = Math.round(cardRect.bottom - paddingBottom - wishesRect.bottom);
      return {
        rsvpCardHeight: Math.round(rsvpCard.getBoundingClientRect().height),
        guestbookCardHeight: Math.round(cardRect.height),
        wishesHeight: Math.round(wishesRect.height),
        wishesScrollHeight: wishesEl.scrollHeight,
        bottomGap
      };
    })()`);
    console.log('GUESTBOOK TABLET 1024px METRICS:', JSON.stringify(gbMetrics));
    assert(Math.abs(gbMetrics.rsvpCardHeight - gbMetrics.guestbookCardHeight) <= 2,
      `Expected both RSVP cards to stretch equally, got ${JSON.stringify(gbMetrics)}`);
    assert(gbMetrics.bottomGap <= 8,
      `Expected #wishes-display to reach bottom padding of card (bottomGap <= 8px), got ${gbMetrics.bottomGap}px`);
    assert(gbMetrics.wishesHeight >= 450,
      `Expected #wishes-display height >= 450px on 1024px 2-col layout instead of 390px cap, got ${gbMetrics.wishesHeight}px`);

    const shotGb = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_guestbook_tablet_1024px.png'), Buffer.from(shotGb.data, 'base64'));

    // Check Main Page buttons remain vertical (!onboarding-open)
    const mainPageBtnMetrics = await evalExpr(cdp, `(() => {
      const m = document.getElementById('music-btn').getBoundingClientRect();
      const t = document.getElementById('theme-toggle').getBoundingClientRect();
      const stack = document.getElementById('floating-top-controls');
      return {
        hasBodyClass: document.body.classList.contains('onboarding-open'),
        flexDirection: stack ? getComputedStyle(stack).flexDirection : 'missing',
        sameColumn: Math.abs(m.left - t.left) <= 2,
        themeBelowMusic: t.top > m.bottom
      };
    })()`);
    console.log('MAIN PAGE TOP BUTTONS:', JSON.stringify(mainPageBtnMetrics));
    assert(!mainPageBtnMetrics.hasBodyClass, 'Main page must not have body.onboarding-open');
    assert(mainPageBtnMetrics.flexDirection === 'column' && mainPageBtnMetrics.sameColumn && mainPageBtnMetrics.themeBelowMusic,
      `Expected vertical Music & Theme controls on main page, got ${JSON.stringify(mainPageBtnMetrics)}`);

    // 2. Check Onboarding Steps 1-4 on Mobile (390x844 and short 375x667) -> Horizontal controls, zero popup overlap
    for (const vp of [{ w: 390, h: 844, name: '390x844' }, { w: 375, h: 667, name: '375x667' }]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await cdp.send('Page.navigate', { url: `${BASE_URL}/index.html` });
      await sleep(1400);

      // Open Envelope -> Step 1
      await evalExpr(cdp, `document.getElementById('ob-envelope-open-btn').click(); true;`);
      await sleep(1000);

      for (const stepNum of [1, 2, 3, 4]) {
        const obMetrics = await evalExpr(cdp, `((sNum) => {
          const m = document.getElementById('music-btn').getBoundingClientRect();
          const t = document.getElementById('theme-toggle').getBoundingClientRect();
          const stack = document.getElementById('floating-top-controls');
          const stepEl = document.getElementById('onboarding-step-' + sNum);
          const stepRect = stepEl.getBoundingClientRect();
          const dotsRect = document.getElementById('onboarding-dots').getBoundingClientRect();
          return {
            step: sNum,
            flexDirection: stack ? getComputedStyle(stack).flexDirection : 'missing',
            sameRow: Math.abs(m.top - t.top) <= 2,
            themeRightOfMusic: t.left >= m.right - 1,
            controlsBottom: Math.max(m.bottom, t.bottom),
            stepTop: stepRect.top,
            clearanceTop: Math.round(stepRect.top - Math.max(m.bottom, t.bottom)),
            stepBottom: stepRect.bottom,
            dotsTop: dotsRect.top,
            clearanceBottom: Math.round(dotsRect.top - stepRect.bottom)
          };
        })(${stepNum})`);
        console.log(`ONBOARDING ${vp.name} STEP ${stepNum}:`, JSON.stringify(obMetrics));
        assert(obMetrics.flexDirection === 'row' && obMetrics.sameRow && obMetrics.themeRightOfMusic,
          `Expected horizontal Music & Theme controls on onboarding (${vp.name} Step ${stepNum}), got ${JSON.stringify(obMetrics)}`);
        assert(obMetrics.clearanceTop >= 6,
          `Controls overlap/crowd popup at ${vp.name} Step ${stepNum}: stepTop=${obMetrics.stepTop}, controlsBottom=${obMetrics.controlsBottom}`);
        assert(obMetrics.clearanceBottom >= 4,
          `Popup crowds bottom dots at ${vp.name} Step ${stepNum}: clearanceBottom=${obMetrics.clearanceBottom}`);

        if (vp.w === 390 && stepNum === 4) {
          const shotS4 = await cdp.send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_onboarding_step4_horizontal_390px.png'), Buffer.from(shotS4.data, 'base64'));
        }

        if (stepNum < 4) {
          await evalExpr(cdp, `document.querySelector('#onboarding-step-${stepNum} [data-nav-next="${stepNum + 1}"]').click(); true;`);
          await sleep(850);
        }
      }
    }

    console.log('PASS: Guestbook frame fill & Onboarding horizontal button checks all succeeded!');
    cdp.close();
  } finally {
    chrome.kill();
  }
})();
```

- [ ] **Step 2: Run the verification test to confirm both issues reproduce/fail on current code**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`
Expected: FAIL on Guestbook (`bottomGap > 100px`, `wishesHeight === 390`).

- [ ] **Step 3: Update `.wishes-scrollview` CSS and Guestbook HTML wrapper in `index.html`, then rebuild CSS**

1. In `index.html:1461-1476`, add the `1024px+` rule to `.wishes-scrollview`:

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
    @media (min-width: 1024px) {
      .wishes-scrollview {
        max-height: none;
        height: 100%;
      }
    }
```

2. In `index.html:3256`, wrap `#wishes-display` inside a bounded `flex-1` parent so `#wishes-display` fills 100% of Column 2's stretched height on `lg:` without overflowing Row 1:

```html
          <div class="relative flex-1 lg:min-h-[390px]">
            <div class="wishes-scrollview lg:absolute lg:inset-0 flex flex-col gap-3 md:gap-4" id="wishes-display">
```

And close the extra `</div>` right after line 3281 (`</div>` closing `#wishes-display`).

3. Rebuild Tailwind CSS:

Run: `rtk npm run build:css`
Expected: `Done in ...ms.`

- [ ] **Step 4: Re-run the test to confirm Task 1 passes (`GUESTBOOK TABLET 1024px` + `MAIN PAGE TOP BUTTONS` pass; Task 2 onboarding check now fails cleanly)**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`
Expected: Logs `GUESTBOOK TABLET 1024px METRICS` with `bottomGap <= 8`, `wishesHeight >= 450`, then fails at `ONBOARDING` assertion (`flexDirection === 'column'` instead of `'row'`).

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# git add index.html assets/tailwind.css
# git commit -m "fix(guestbook): fill stretched card height on 2-column tablet/desktop viewports"
```

---

### Task 2: Horizontal Floating Music & Dark Mode Controls During Onboarding (Envelope + Steps 1–4)

**Files:**
- Modify: `index.html:714-730, 862-875, 1542-1547, 2071-2080, 2216-2228, 2542`
- Regenerate: `assets/tailwind.css`
- Test: `/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`

**Interfaces:**
- Consumes: `body.onboarding-open`, `#onboarding-deck`, `.onboarding-stage`, `.onboarding-step`, `#music-btn`, `#theme-toggle`.
- Produces: `#floating-top-controls` rendering `flex-direction: row` while `body.onboarding-open` is active and `flex-direction: column` on the main website (`!body.onboarding-open`), with guaranteed `#onboarding-deck` top/bottom safe padding so Steps 1–4 never touch the buttons.

- [ ] **Step 1: Verify Task 2 failure state (confirmed from Task 1 Step 4)**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`
Expected: FAIL on `Expected horizontal Music & Theme controls on onboarding (390x844 Step 1)`.

- [ ] **Step 2: Apply `#floating-top-controls` HTML ID & responsive onboarding safe-zone CSS in `index.html`**

1. **HTML (`index.html:2216-2218` and `2542`):** Add `id="floating-top-controls"` to the top-left button wrapper and bound `#onboarding-step-1`'s `min-height` so short landscape viewports never force overflow:

```html
  <!-- Music & Theme toggles: Xếp ngang khi đang mở phong bì/onboarding (Step 0-4) để không đè popup; xếp dọc khi vào trang chính -->
  <div id="floating-top-controls" class="fixed safe-fixed-tl z-[100] flex flex-col items-center gap-2">
```

And at line `2542`:

```html
      <article class="onboarding-step is-active rounded-3xl text-center relative overflow-hidden shadow-luxury border border-outline/30 min-h-[min(520px,100%)] sm:min-h-[min(560px,100%)] flex flex-col justify-between" data-step="1" id="onboarding-step-1">
```

2. **CSS (`index.html`, inside `<style>` around line 730 right after `#onboarding-deck` and updating `.onboarding-stage` / `.onboarding-step` at lines 862-875, 1542-1547, 2071-2080):**

Update `#onboarding-deck` (`714-730`) & add `#floating-top-controls` horizontal rule:

```css
    /* Khi đang ở phong bì & onboarding (Step 0 - Step 4): Music & Darkmode xếp ngang */
    body.onboarding-open #floating-top-controls {
      flex-direction: row;
    }
```

Update `#onboarding-deck` (`714-730`) to carry the safe top/bottom clearance for its in-flow `.onboarding-stage` child (`box-sizing: border-box` is inherited from Tailwind base; note `#onboarding-envelope`, `.onboarding-bg-image`, and `.onboarding-bg-overlay` are `position: absolute; inset: 0` so padding only bounds `.onboarding-stage`):

```css
    #onboarding-deck {
      position: fixed;
      inset: 0;
      z-index: 85;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0 3.75rem;
      overflow: hidden;
      background-color: var(--color-background);
      transition:
        opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0.85s;
      will-change: opacity, transform;
      backface-visibility: hidden;
    }

    @media (min-width: 640px) {
      #onboarding-deck {
        padding: 5.25rem 0 4rem;
      }
    }
```

Update `.onboarding-stage` (`862-875`) and `.onboarding-step` (`1542-1547`) and `@media (max-width: 640px)` (`2071-2080`) so `.onboarding-stage` wraps purely with horizontal gutter and `.onboarding-step` (`max-height: 100%`) always fits inside `#onboarding-deck`'s safe area (`[64px .. 100dvh - 60px]` mobile, `[84px .. 100dvh - 64px]` `>= 640px`):

```css
    /* Vùng chứa stage nằm hoàn toàn trong vùng an toàn giữa hàng nút trên và dots dưới */
    .onboarding-stage {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 620px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 1.25rem;
      overflow: hidden;
    }
```

And at line `1545`:
```css
    .onboarding-step {
      position: absolute;
      width: calc(100% - 2.5rem);
      max-height: 100%;
      overflow-y: auto;
```

And at lines `2071-2079`:
```css
    @media (max-width: 640px) {
      .onboarding-stage {
        padding: 0 0.875rem;
      }
      .onboarding-step {
        width: calc(100% - 1.75rem);
        max-height: 100%;
      }
    }
```

3. **Rebuild CSS:**

Run: `rtk npm run build:css`
Expected: `Done in ...ms.`

- [ ] **Step 3: Run the E2E verification test to confirm all checks pass**

Run: `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guestbook_and_onboarding_buttons.js`
Expected: `PASS: Guestbook frame fill & Onboarding horizontal button checks all succeeded!`

- [ ] **Step 4: Run all existing regression suites (`verify_responsive_mobile.js`, `verify_load_and_perf.js`, `verify_guest_e2e.js`) & inspect captured screenshots**

Run:
1. `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_responsive_mobile.js`
2. `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_load_and_perf.js`
3. `rtk node /Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105/scratch/sdd_guest/verify_guest_e2e.js`

Inspect `verify_guestbook_tablet_1024px.png` and `verify_onboarding_step4_horizontal_390px.png` using `read_file` to confirm visual alignment, zero blank bottom whitespace in Guestbook, crisp horizontal Music/DarkMode buttons clear of Step 4 popup, and vertical buttons preserved on main page.

- [ ] **Step 5: Commit (Optional - only run if explicitly instructed by user)**

```bash
# Wait for explicit user approval before staging/committing any files.
```
