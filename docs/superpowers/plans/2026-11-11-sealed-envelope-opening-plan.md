# Sealed Wedding Envelope Opening (Step 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a luxurious, unopened wedding envelope (Step 0) before Step 1, featuring a 3D wax seal with a heart symbol, a dedicated "Mở thiệp" button, a 3D flap opening animation that draws Step 1 out of the envelope, and dots starting only from Step 1 → 4.

**Architecture:** Pure CSS 3D Transforms (`perspective`, `rotateX`, `translate3d`, `scale`) combined with state transitions (`.is-opened`) running exclusively on the GPU compositor thread (60–120 FPS). Step 0 lives within `.onboarding-stage`, hiding bottom navigation dots until the envelope opens, with full support for reopening from the footer/hero.

**Tech Stack:** HTML5, Modern CSS (3D Transforms, CSS Custom Properties, Tailwind CSS), Vanilla JavaScript, Chrome CDP Automated Test Suite.

## Global Constraints
- **NO AUTO-COMMITS:** DO NOT execute `git commit`. All commits must be explicitly requested by the user.
- **User Specific Requirements:**
  1. **Wax Seal:** Distinct heart symbol (Trái tim dập nổi sang trọng).
  2. **Dots:** Strictly hidden on Step 0 (Envelope); only display dots from Step 1 → 4.
  3. **Interaction:** Dedicated prominent button labeled "Mở thiệp" (plus clicking the envelope/seal also opens it).
- **Color Scheme Compliance:**
  - Light mode: Envelope `#FFFCF8`, Border `#DED0BF`, Wax seal `#762D40`, Text `#392D31`, Button `#762D40` (hover `#602235`, text `#FFFFFF`).
  - Dark mode: Envelope `#695247`, Border `#B69B7B`, Wax seal `#F1D5AB`, Text `#FFF6E8`, Button `#F1D5AB` (hover `#F7E2C3`, text `#39271E`).
- **Performance Budget:** 60 FPS minimum; zero `backdrop-filter: blur` on opaque cards; zero CPU `clip-path` animations; strictly hardware-composited `transform` and `opacity`.
- **Regression Prevention:** Preserve all existing typography fixes (balanced "Trân trọng kính mời", nowrap "Đăng Khoa", "Cẩm Nhung", "06:00 PM"), existing Steps 1–5, music controls, theme toggling, and form submissions.
- **Documentation & Links:** Use clickable `file://` scheme links for all file references.

---

## Tasks

- [x] **Task 1: Markup Structure for Sealed Envelope (Step 0)**
  - **File:** `index.html`
  - **Details:**
    - Add `#onboarding-envelope` element inside `.onboarding-stage` preceding Step 1.
    - Structure:
      - `.ob-envelope-container` (perspective container).
      - `.ob-envelope-back` (rear pocket of envelope).
      - `.ob-envelope-flap` (top triangular flap with `rotateX` origin at top).
      - `.ob-wax-seal` (circular wax seal with embossed heart SVG & subtle drop-shadow).
      - `.ob-envelope-front` (front fold panels forming classic envelope creases).
      - Dedicated action button: `.ob-envelope-open-btn` with text "Mở thiệp" and arrow/icon.
      - Subtle hint: "Trân trọng gửi đến bạn" or couple initials.
    - Ensure accessibility attributes (`role="region"`, `aria-label="Bì thư thiệp cưới"`).
  - **Deliverable:** Valid HTML markup in `index.html`.

- [x] **Task 2: 3D CSS Transitions & Theme Styles**
  - **File:** `index.html`, `src/input.css` (if needed)
  - **Details:**
    - Define CSS for `.ob-envelope-container`: `perspective: 1200px; transform-style: preserve-3d;`.
    - Define `.ob-envelope-flap`: `transform-origin: top center; transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);`.
    - Define `.ob-wax-seal`: rich embossed radial gradient with heart symbol, breathing pulse keyframe (`@keyframes sealPulse`).
    - Define "Mở thiệp" button styling matching the user-approved theme colors.
    - Define `.is-opened` state transitions:
      - Flap rotates `rotateX(180deg)`.
      - Wax seal scales up and fades (`scale(1.15)`, `opacity: 0`).
      - Step 1 rises smoothly out of the envelope and takes center stage (`translate3d(0, 0, 0)`).
      - Envelope base scales down slightly (`scale(0.92)`) and fades to `opacity: 0`.
      - "Mở thiệp" button fades out with the envelope.
    - Keep `#onboarding-dots` hidden when envelope is active; fade in dots when transitioning to Step 1.
    - Add `@media (prefers-reduced-motion: reduce)` fallbacks.
    - Run `npm run build:css`.
  - **Deliverable:** Fully styled 3D envelope with responsive dimensions (320px mobile to 1440px desktop).

- [x] **Task 3: JavaScript Interaction Flow & State Synchronization**
  - **File:** `index.html`
  - **Details:**
    - Add click listener to the dedicated "Mở thiệp" button (and envelope/seal).
    - Function `openWeddingEnvelope()`:
      - Add `.is-opened` class to envelope.
      - Autoplay music if permitted by user preference.
      - Reveal `#onboarding-dots` with smooth opacity fade-in.
      - Trigger Step 1 active animation (`deck-ready` sequence).
      - Transition `currentOnboardingStep` to 1.
    - Update `reopenOnboardingDeck()` to reset `#onboarding-envelope` to unopened state and hide dots bar so guests can re-experience opening the envelope.
    - Ensure dots bar is hidden on initial load (`#onboarding-dots.hidden` or `opacity: 0`).
  - **Deliverable:** End-to-end interactive flow from envelope opening to Step 1.

- [x] **Task 4: Multi-Viewport Automated Testing & Profiling**
  - **File:** `scratch/verify_envelope.js`
  - **Details:**
    - Write and run CDP test script across 6 viewports (`320px`, `375px`, `390px`, `430px`, `768px`, `1440px`).
    - Verify:
      1. Envelope renders centered and proportioned on mobile and desktop without overflow.
      2. Clicking "Mở thiệp" button opens flap 3D and reveals Step 1 smoothly at 60 FPS.
      3. Dots appear only after opening (Step 1).
      4. Subsequent steps (2, 3, 4, 5) function without regressions.
      5. Typography fixes remain 100% intact.
    - Capture verification screenshots for user review.
  - **Deliverable:** Test report confirming 100% PASS and screenshots saved in artifact directory.
