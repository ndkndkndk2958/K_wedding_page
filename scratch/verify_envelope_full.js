/**
 * Automated Multi-Viewport Testing & 60 FPS Profiling Suite
 * for Sealed Wedding Envelope Opening (Step 0)
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOTS_DIR = '/Users/tanh/.gemini/antigravity/brain/99ce4140-214b-4b13-bc71-5b3c95585105';
const TARGET_URL = 'http://localhost:8088/';
const DEBUG_PORT = 9225;

const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568, dsf: 2, mobile: true },
  { name: 'iPhone Mini', width: 375, height: 667, dsf: 2, mobile: true },
  { name: 'iPhone 14', width: 390, height: 844, dsf: 3, mobile: true },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, dsf: 3, mobile: true },
  { name: 'iPad (768px)', width: 768, height: 1024, dsf: 2, mobile: false },
  { name: 'Desktop (1440px)', width: 1440, height: 900, dsf: 1, mobile: false },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result.value;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`  📸 Screenshot saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('SEALED WEDDING ENVELOPE (STEP 0) AUTOMATED TEST & PROFILING SUITE');
  console.log('='.repeat(70));

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('\n[1/6] Launching headless Chrome with remote debugging on port ' + DEBUG_PORT);
  const chromeProcess = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--remote-allow-origins=*',
      '--window-size=1440,900',
      '--no-first-run',
      '--no-default-browser-check',
      TARGET_URL,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  let connected = false;
  let targets = null;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      if (targets && targets.length > 0) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    chromeProcess.kill();
    throw new Error('Could not connect to Chrome debugging port.');
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  console.log(`Connected to page target: ${pageTarget.title} (${pageTarget.url})`);

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const testResults = [];
  const fpsMetrics = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n----------------------------------------------------------------------`);
      console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}, dsf: ${vp.dsf})`);
      console.log(`----------------------------------------------------------------------`);

      // Set device metrics
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dsf,
        mobile: vp.mobile,
      });

      // Reload page to reset everything cleanly
      await client.send('Page.navigate', { url: TARGET_URL });
      await sleep(1000);

      // Verify Step 0 Initial State
      const step0 = await client.evaluate(`(() => {
        const env = document.getElementById('onboarding-envelope');
        const seal = document.getElementById('ob-wax-seal-btn');
        const btn = document.getElementById('ob-envelope-open-btn');
        const dots = document.getElementById('onboarding-dots');
        const heartSvg = seal ? seal.querySelector('.ob-wax-heart') : null;

        const envRect = env ? env.getBoundingClientRect() : null;
        const sealRect = seal ? seal.getBoundingClientRect() : null;
        const btnRect = btn ? btn.getBoundingClientRect() : null;

        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        const hasHScroll = scrollW > clientW + 1; // 1px rounding tolerance

        const envStyles = env ? window.getComputedStyle(env) : null;
        const dotsStyles = dots ? window.getComputedStyle(dots) : null;

        // Centering calculation
        const envCenterX = envRect ? (envRect.left + envRect.right) / 2 : 0;
        const vpCenterX = window.innerWidth / 2;
        const isCentered = Math.abs(envCenterX - vpCenterX) <= 3;

        return {
          envFound: !!env,
          envVisible: envStyles ? envStyles.visibility !== 'hidden' && parseFloat(envStyles.opacity) > 0.8 : false,
          isCentered,
          envWidth: envRect ? Math.round(envRect.width) : 0,
          vpWidth: window.innerWidth,
          hasHScroll,
          sealFound: !!seal,
          sealVisible: sealRect && sealRect.width > 0 && sealRect.height > 0,
          hasHeartSvg: !!heartSvg,
          btnFound: !!btn,
          btnVisible: btnRect && btnRect.width > 0 && btnRect.height > 0,
          btnText: btn ? btn.textContent.trim().replace(/\\s+/g, ' ') : '',
          dotsHidden: dotsStyles ? (parseFloat(dotsStyles.opacity) < 0.05 || dotsStyles.visibility === 'hidden') : false,
          dotsOpacity: dotsStyles ? dotsStyles.opacity : null,
          dotsHasVisibleClass: dots ? dots.classList.contains('is-visible') : false
        };
      })()`);

      console.log('Step 0 Checks:');
      console.log(`  - Envelope: found=${step0.envFound}, visible=${step0.envVisible}, centered=${step0.isCentered} (width: ${step0.envWidth}px / ${step0.vpWidth}px)`);
      console.log(`  - Horizontal Scroll: ${step0.hasHScroll ? '❌ OVERFLOW' : '✅ NO OVERFLOW'}`);
      console.log(`  - Wax Seal: found=${step0.sealFound}, visible=${step0.sealVisible}, heartSvg=${step0.hasHeartSvg}`);
      console.log(`  - "Mở Thiệp" Button: found=${step0.btnFound}, visible=${step0.btnVisible}, text="${step0.btnText}"`);
      console.log(`  - Dots Bar Hidden: ${step0.dotsHidden ? '✅ YES' : '❌ NO'} (opacity: ${step0.dotsOpacity})`);

      const step0Pass =
        step0.envFound &&
        step0.envVisible &&
        step0.isCentered &&
        !step0.hasHScroll &&
        step0.sealFound &&
        step0.sealVisible &&
        step0.hasHeartSvg &&
        step0.btnFound &&
        step0.btnVisible &&
        step0.btnText.includes('Mở Thiệp') &&
        step0.dotsHidden;

      // Capture Closed Screenshots for 390px and 1440px
      if (vp.width === 390) {
        await client.captureScreenshot(path.join(SCREENSHOTS_DIR, 'verify_envelope_390px_closed.png'));

        // Test Dark Mode on 390px Step 0
        console.log('\n  [Dark Mode Test on 390px]');
        await client.evaluate(`document.getElementById('theme-toggle').click();`);
        await sleep(400);

        const darkCheck = await client.evaluate(`(() => {
          const isDark = document.documentElement.classList.contains('dark');
          const flap = document.querySelector('.ob-env-flap-poly');
          const seal = document.querySelector('.ob-wax-seal');
          const heart = document.querySelector('.ob-wax-seal svg');

          const backBg = flap ? window.getComputedStyle(flap).fill : '';
          const sealBg = seal ? window.getComputedStyle(seal).background : '';
          const heartFill = heart ? window.getComputedStyle(heart).fill : '';
          const heartColor = heart ? window.getComputedStyle(heart).color : '';

          return {
            isDark,
            backBg, // Expected: rgb(105, 82, 71) (#695247)
            sealBg, // Expected: radial-gradient with champagne tones
            heartFill, // Expected: rgb(57, 39, 30) (#39271E)
            heartColor
          };
        })()`);

        console.log(`  - Dark Mode class on <html>: ${darkCheck.isDark}`);
        console.log(`  - Dark Envelope Back: ${darkCheck.backBg} (Target: rgb(105, 82, 71))`);
        console.log(`  - Dark Wax Seal BG: ${darkCheck.sealBg.slice(0, 60)}...`);
        console.log(`  - Dark Heart Fill/Color: ${darkCheck.heartFill || darkCheck.heartColor} (Target: rgb(57, 39, 30))`);

        const isDarkBackMatch = darkCheck.backBg === 'rgb(105, 82, 71)';
        const isDarkHeartMatch = darkCheck.heartFill === 'rgb(57, 39, 30)' || darkCheck.heartColor === 'rgb(57, 39, 30)';

        console.log(`  - Dark Mode Verification: ${isDarkBackMatch && isDarkHeartMatch ? '✅ PASS' : '❌ FAIL'}`);

        await client.captureScreenshot(path.join(SCREENSHOTS_DIR, 'verify_envelope_dark_closed.png'));

        // Switch back to light mode for subsequent opening test
        await client.evaluate(`document.getElementById('theme-toggle').click();`);
        await sleep(300);
      }

      if (vp.width === 1440) {
        await client.captureScreenshot(path.join(SCREENSHOTS_DIR, 'verify_envelope_desktop_1440px.png'));
      }

      // 60 FPS Compositor Profiling during Envelope Opening
      console.log('\n  [Measuring Animation Smoothness & 60 FPS Profiling]');
      await client.evaluate(`(() => {
        window.__fpsSamples = [];
        window.__fpsRunning = true;
        let prev = performance.now();
        function loop(now) {
          if (!window.__fpsRunning) return;
          const dt = now - prev;
          prev = now;
          window.__fpsSamples.push(dt);
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      })()`);

      // Trigger Opening by clicking "Mở Thiệp" button
      await client.evaluate(`document.getElementById('ob-envelope-open-btn').click();`);

      // Wait 1200ms to cover complete opening animation (750ms flap + step 1 rise)
      await sleep(1200);

      // Stop FPS sampling & calculate metrics
      const fpsStats = await client.evaluate(`(() => {
        window.__fpsRunning = false;
        const samples = window.__fpsSamples.slice(1); // omit first startup frame
        if (!samples.length) return null;
        const total = samples.reduce((a, b) => a + b, 0);
        const meanDelta = total / samples.length;
        const fps = 1000 / meanDelta;
        const maxDelta = Math.max(...samples);
        const minDelta = Math.min(...samples);
        const stutters = samples.filter(dt => dt > 25).length;
        return {
          frameCount: samples.length,
          meanDelta: meanDelta.toFixed(2),
          fps: fps.toFixed(1),
          minDelta: minDelta.toFixed(2),
          maxDelta: maxDelta.toFixed(2),
          stutters,
          stutterPct: ((stutters / samples.length) * 100).toFixed(1)
        };
      })()`);

      if (fpsStats) {
        console.log(`  - Frame Count: ${fpsStats.frameCount} frames over 1200ms`);
        console.log(`  - Mean Delta: ${fpsStats.meanDelta} ms (Equivalent FPS: ${fpsStats.fps} FPS)`);
        console.log(`  - Delta Range: [${fpsStats.minDelta} ms, ${fpsStats.maxDelta} ms]`);
        console.log(`  - Frames > 25ms (stutters): ${fpsStats.stutters} (${fpsStats.stutterPct}%)`);
        fpsMetrics.push({ viewport: vp.name, ...fpsStats });
      }

      // Verify Step 1 Emerged and Dots Visible
      const step1Check = await client.evaluate(`(() => {
        const env = document.getElementById('onboarding-envelope');
        const dots = document.getElementById('onboarding-dots');
        const step1 = document.getElementById('onboarding-step-1');
        const dotButtons = dots ? dots.querySelectorAll('[data-step-dot]') : [];

        const envOpened = env ? env.classList.contains('is-opened') : false;
        const envHidden = env ? (window.getComputedStyle(env).visibility === 'hidden' || parseFloat(window.getComputedStyle(env).opacity) < 0.1) : false;

        const dotsStyles = dots ? window.getComputedStyle(dots) : null;
        const dotsVisible = dotsStyles ? (parseFloat(dotsStyles.opacity) > 0.8 && dotsStyles.visibility !== 'hidden') : false;

        const step1Styles = step1 ? window.getComputedStyle(step1) : null;
        const step1Active = step1 ? step1.classList.contains('is-active') : false;
        const step1Visible = step1Styles ? (parseFloat(step1Styles.opacity) > 0.8 && step1Styles.visibility !== 'hidden') : false;

        // Check typography integrity on Step 1
        const titleH1 = step1 ? step1.querySelector('h1') : null;
        const nowraps = titleH1 ? titleH1.querySelectorAll('.whitespace-nowrap') : [];
        const titleWords = Array.from(nowraps).map(el => el.textContent.trim());

        return {
          envOpened,
          envHidden,
          dotsVisible,
          dotsOpacity: dotsStyles ? dotsStyles.opacity : null,
          dotCount: dotButtons.length,
          step1Active,
          step1Visible,
          step1Opacity: step1Styles ? step1Styles.opacity : null,
          titleWords
        };
      })()`);

      console.log('Step 1 Emergence & State Checks:');
      console.log(`  - Envelope opened & hidden: opened=${step1Check.envOpened}, hidden=${step1Check.envHidden}`);
      console.log(`  - Dots Visible: ${step1Check.dotsVisible} (opacity: ${step1Check.dotsOpacity}), Dot Buttons: ${step1Check.dotCount}`);
      console.log(`  - Step 1 Active & Visible: active=${step1Check.step1Active}, visible=${step1Check.step1Visible} (opacity: ${step1Check.step1Opacity})`);
      console.log(`  - Typography Nowraps: ${JSON.stringify(step1Check.titleWords)}`);

      if (vp.width === 390) {
        await client.captureScreenshot(path.join(SCREENSHOTS_DIR, 'verify_envelope_390px_opened_step1.png'));
      }

      // Reopen Deck Test
      console.log('\n  [Reopen Deck Test: Step 5 Dismiss -> Xem lại lời mời -> Step 0]');
      await client.evaluate(`window.goToOnboardingStep(5);`);
      await sleep(600);

      const dismissCheck = await client.evaluate(`(() => {
        return {
          onboardingOpen: document.body.classList.contains('onboarding-open'),
          deckDismissed: document.getElementById('onboarding-deck').classList.contains('deck-dismissed')
        };
      })()`);
      console.log(`  - Deck dismissed into full site: ${dismissCheck.deckDismissed && !dismissCheck.onboardingOpen ? '✅ PASS' : '❌ FAIL'}`);

      // Click "Xem lại lời mời" button
      await client.evaluate(`document.getElementById('reopen-invitation-btn').click();`);
      await sleep(600);

      const reopenCheck = await client.evaluate(`(() => {
        const env = document.getElementById('onboarding-envelope');
        const dots = document.getElementById('onboarding-dots');
        const isOpened = env ? env.classList.contains('is-opened') : true;
        const dotsStyles = dots ? window.getComputedStyle(dots) : null;
        const dotsHidden = dotsStyles ? (parseFloat(dotsStyles.opacity) < 0.05 || dotsStyles.visibility === 'hidden') : false;
        const envStyles = env ? window.getComputedStyle(env) : null;
        const envVisible = envStyles ? (parseFloat(envStyles.opacity) > 0.8 && envStyles.visibility !== 'hidden') : false;

        return {
          onboardingReopened: document.body.classList.contains('onboarding-open'),
          envClosed: !isOpened,
          envVisible,
          dotsHidden,
          dotsOpacity: dotsStyles ? dotsStyles.opacity : null
        };
      })()`);

      console.log(`  - Reopened deck active: ${reopenCheck.onboardingReopened ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  - Envelope closed again: ${reopenCheck.envClosed && reopenCheck.envVisible ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  - Dots hidden again: ${reopenCheck.dotsHidden ? '✅ PASS' : '❌ FAIL'} (opacity: ${reopenCheck.dotsOpacity})`);

      const reopenPass = reopenCheck.onboardingReopened && reopenCheck.envClosed && reopenCheck.envVisible && reopenCheck.dotsHidden;
      const step1Pass = step1Check.envOpened && step1Check.dotsVisible && step1Check.dotCount === 4 && step1Check.step1Active && step1Check.step1Visible;

      const viewportOverall = step0Pass && step1Pass && reopenPass;
      console.log(`\n=> RESULT FOR ${vp.name}: ${viewportOverall ? '✅ ALL CHECKS PASSED' : '❌ FAILED'}`);

      testResults.push({
        name: vp.name,
        width: vp.width,
        step0Pass,
        step1Pass,
        reopenPass,
        overall: viewportOverall,
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY OF MULTI-VIEWPORT TEST RESULTS');
    console.log('='.repeat(70));
    console.table(testResults);

    console.log('\n' + '='.repeat(70));
    console.log('FPS PROFILING RESULTS (1200ms OPENING ANIMATION)');
    console.log('='.repeat(70));
    console.table(fpsMetrics);

  } finally {
    client.close();
    chromeProcess.kill();
    console.log('\nHeadless Chrome process terminated.');
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
