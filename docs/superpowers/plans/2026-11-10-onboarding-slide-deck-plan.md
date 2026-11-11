# Onboarding Interactive Slide Deck (5-Step Story) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trải nghiệm mở đầu dạng trình chiếu 5 bước (Interactive Story Slide Deck) sang trọng với hiệu ứng chuyển cảnh 2 chiều (Next / Back directional slide transition), nền ảnh cưới làm mờ nghệ thuật (Glassmorphism Backdrop), đồng bộ hoàn toàn với cả Light Mode và Dark Mode trước khi mở ra toàn bộ trang web ở Step 5.

**Architecture:**
1. Thiết kế component `#onboarding-deck` cố định toàn màn hình (`fixed inset-0 z-[85]`) nằm dưới cụm nút điều khiển nổi (`#music-btn`, `#theme-toggle` ở `z-[100]`) để khách mời vẫn có thể đổi Light/Dark mode hoặc bật/tắt nhạc ngay trong lúc xem trình chiếu.
2. Sử dụng hình cưới của cặp đôi (`WEDDING_CONFIG.images.header[0]`) làm lớp nền phóng đại nhẹ kết hợp `backdrop-filter: blur(18px)` và lớp phủ màu thông minh theo từng chế độ Light Mode (Editorial Silk Ivory mờ) / Dark Mode (Midnight Velvet Obsidian mờ).
3. Quản lý trạng thái điều hướng 5 bước bằng State Machine nhẹ trong Vanilla JS (`currentStep: 1..5`), áp dụng class CSS chuyển tiếp 2 chiều (`.slide-enter-next`, `.slide-leave-next`, `.slide-enter-prev`, `.slide-leave-prev`) với đường cong `cubic-bezier(0.22, 1, 0.36, 1)`.
4. Tích hợp form RSVP ngay tại Step 4 dùng chung hàm `sendToWorker` với form chính, tự động chuyển sang Step 5 sau khi gửi thành công hoặc khi người dùng bấm nút chuyển sang trang chính.

**Tech Stack:** HTML5, CSS3 Keyframes & Custom Properties, Tailwind CSS v3.4, Vanilla JavaScript.

## Global Constraints

- Bảo toàn 100% toàn bộ 70 DOM IDs hiện có và các chức năng trên trang chính (`#home`, `#intro`, `#gallery`, `#events`, `#rsvp`, `#lightbox`, `#form-popup`).
- Đồng bộ giao diện cho cả **Light Mode** và **Dark Mode** trên mọi slide (Step 1 → Step 4).
- Không tự động chạy `git commit` trừ khi được người dùng yêu cầu rõ ràng.
- Khi bấm nút ở Step 1 (`MỞ THIỆP MỜI`), tự động kích hoạt phát nhạc nền (`tryPlayMusic()`) nếu nhạc chưa phát để tận dụng tương tác người dùng đầu tiên trên trình duyệt di động.

---

## Bảng Gợi Ý Tiêu Đề Nút Bấm (Button Copywriting)

| Bước | Nội dung chính | Nút Quay Lại (Back) | Nút Hành Động Phụ | Nút Tiếp Tục Chính (Recommended) | Các phương án thay thế (Alternatives) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Step 1** | Lời cảm ơn & Vinh hạnh đón tiếp | *(Không có)* | `BỎ QUA ✕` (Góc trên) | **`MỞ THIỆP MỜI`** | • `BẮT ĐẦU HÀNH TRÌNH`<br>• `ĐÓN NHẬN LỜI MỜI` |
| **Step 2** | Giới thiệu Cô Dâu & Chú Rể | **`QUAY LẠI`** | `BỎ QUA ✕` | **`XEM THỜI GIAN & ĐỊA ĐIỂM`** | • `LỊCH TRÌNH SỰ KIỆN`<br>• `TIẾP TỤC HÀNH TRình` |
| **Step 3** | Thời gian, Địa điểm & Bản đồ | **`QUAY LẠI`** | **`MỞ GOOGLE MAPS`** | **`ĐẾN PHẦN XÁC NHẬN`** | • `XÁC NHẬN THAM DỰ`<br>• `TIẾP TỤC` |
| **Step 4** | Form Xác nhận Tham dự (RSVP) | **`QUAY LẠI`** | **`GỬI XÁC NHẬN`** *(Submit)* | **`KHÁM PHÁ TOÀN BỘ THIỆP CƯỚI`** | • `VÀO TRANG THIỆP CHÍNH`<br>• `XEM ALBUM & LỜI CHÚC` |
| **Step 5** | Hiển thị toàn bộ trang web | Nút nổi góc dưới trỏ lại trình chiếu *(Tùy chọn)* | — | *(Cuộn trang tự do)* | — |

---

### Task 1: Bổ sung CSS cho hệ thống Slide Deck và Animation chuyển tiếp 2 chiều (Next / Back) trong `index.html`

**Files:**
- Modify: `index.html:565-575` (trước thẻ `</style>`)

**Interfaces:**
- Consumes: Biến CSS `--color-*`, `--glass-*` từ `colors.js`
- Produces: Các class `.onboarding-deck`, `.onboarding-bg`, `.onboarding-card`, `.onboarding-step`, `.step-active`, `.step-exit-left`, `.step-exit-right`, `.step-enter-from-right`, `.step-enter-from-left`, `.onboarding-progress-dot`.

- [ ] **Step 1: Thêm CSS cho Onboarding Slide Deck vào cuối thẻ `<style>` trong `index.html`**

Chèn đoạn CSS dưới đây ngay trước thẻ đóng `</style>` trong `index.html`:

```css
    /* ============================================================
       ONBOARDING 5-STEP SLIDE DECK (DIRECTIONAL TRANSITIONS)
       ============================================================ */
    #onboarding-deck {
      position: fixed;
      inset: 0;
      z-index: 85;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.75s;
    }

    #onboarding-deck.deck-dismissed {
      opacity: 0;
      transform: scale(1.04);
      visibility: hidden;
      pointer-events: none;
    }

    .onboarding-bg-image {
      position: absolute;
      inset: -24px;
      background-size: cover;
      background-position: center;
      filter: blur(18px) saturate(1.08);
      transform: scale(1.08);
      transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 0;
    }

    .onboarding-bg-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      transition: background 0.5s ease;
    }

    html.light .onboarding-bg-overlay {
      background:
        radial-gradient(circle at center, rgba(250, 247, 242, 0.68) 0%, rgba(244, 239, 231, 0.88) 100%);
    }

    html.dark .onboarding-bg-overlay {
      background:
        radial-gradient(circle at center, rgba(15, 13, 12, 0.68) 0%, rgba(10, 9, 8, 0.90) 100%);
    }

    .onboarding-stage {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 680px;
      height: 100%;
      max-height: 820px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4.5rem 1.25rem 5rem;
    }

    .onboarding-step {
      position: absolute;
      width: calc(100% - 2.5rem);
      max-height: calc(100dvh - 9.5rem);
      overflow-y: auto;
      opacity: 0;
      pointer-events: none;
      transform: translateX(64px) scale(0.96);
      transition:
        opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
      scrollbar-width: thin;
    }

    /* Trạng thái đang hiển thị ở trung tâm */
    .onboarding-step.is-active {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0) scale(1);
      z-index: 5;
    }

    /* Vị trí chờ bên phải (cho các step phía sau) */
    .onboarding-step.is-next {
      opacity: 0;
      pointer-events: none;
      transform: translateX(72px) scale(0.96);
      z-index: 1;
    }

    /* Vị trí chờ bên trái (cho các step phía trước khi đã đi qua) */
    .onboarding-step.is-prev {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-72px) scale(0.96);
      z-index: 1;
    }

    .onboarding-glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      border: 1px solid var(--glass-border);
      box-shadow:
        0 28px 65px -15px rgba(36, 28, 24, 0.18),
        0 8px 24px -6px rgba(36, 28, 24, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.55);
    }

    html.dark .onboarding-glass-card {
      background: rgba(26, 22, 20, 0.78);
      border-color: rgba(223, 193, 157, 0.28);
      box-shadow:
        0 28px 70px -12px rgba(0, 0, 0, 0.75),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 640px) {
      .onboarding-stage {
        padding: 4.25rem 1rem 4.5rem;
      }
      .onboarding-step {
        width: calc(100% - 2rem);
        max-height: calc(100dvh - 8.5rem);
      }
    }
```

- [ ] **Step 2: Kiểm tra cú pháp CSS trong `index.html`**

Run: `npm run build:css`
Expected: Biên dịch thành công không báo lỗi.

---

### Task 2: Xây dựng cấu trúc HTML cho 4 Slide mở đầu (Step 1 → Step 4) trong `index.html`

**Files:**
- Modify: `index.html:615-635` (Chèn `#onboarding-deck` ngay trước `<!-- 1. Hero Slideshow Banner -->`)

**Interfaces:**
- Consumes: Dữ liệu cấu hình từ `WEDDING_CONFIG`
- Produces: Các phần tử DOM `#onboarding-deck`, `#onboarding-bg-img`, `#onboarding-skip-btn`, `#onboarding-step-1` đến `#onboarding-step-4`, `#onboarding-rsvp-form`, `#onboarding-dots`.

- [ ] **Step 1: Chèn khối HTML `#onboarding-deck` vào `index.html` ngay trước `<section ... id="home">`**

Thêm đoạn HTML sau ngay phía trên `<!-- 1. Hero Slideshow Banner -->`:

```html
  <!-- ============================================================
       0. ONBOARDING INTERACTIVE SLIDE DECK (STEPS 1 -> 4, STEP 5 = FULL SITE)
       ============================================================ -->
  <div aria-label="Trình chiếu thiệp mời mở đầu" id="onboarding-deck" role="dialog" aria-modal="true">
    <!-- Ảnh cưới làm mờ phía sau -->
    <div class="onboarding-bg-image" id="onboarding-bg-img"></div>
    <div class="onboarding-bg-overlay"></div>

    <!-- Nút Bỏ qua để vào thẳng Step 5 (Toàn bộ trang web) -->
    <div class="fixed safe-fixed-tr z-[95]">
      <button aria-label="Bỏ qua phần mở đầu để xem toàn bộ trang web"
        class="glass-nav px-4 h-12 rounded-full flex items-center gap-2 text-on-background hover:text-primary transition-all duration-300 shadow-luxury"
        id="onboarding-skip-btn" type="button">
        <span class="font-label-caps text-[10px] tracking-[0.2em] uppercase font-semibold">Vào Trang Chính</span>
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    </div>

    <!-- Khu vực trình chiếu trung tâm -->
    <div class="onboarding-stage">
      <!-- STEP 1: Lời cảm ơn & Vinh hạnh đón tiếp -->
      <article class="onboarding-step is-active onboarding-glass-card rounded-3xl p-7 md:p-12 text-center" data-step="1" id="onboarding-step-1">
        <div class="border border-outline/35 rounded-2xl p-6 md:p-10 flex flex-col items-center">
          <div class="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-5 text-primary">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </div>
          <p class="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase mb-3">Wedding Invitation</p>
          <h2 class="font-script text-4xl md:text-6xl text-primary mb-3 leading-tight" id="ob-step1-names"></h2>
          <p class="font-headline-sm text-sm md:text-base tracking-[0.25em] text-tertiary dark:text-secondary uppercase mb-6" id="ob-step1-date"></p>
          <div class="h-px w-20 bg-outline/50 mb-6"></div>
          <p class="font-body-lg text-base md:text-lg italic text-on-background leading-relaxed max-w-md mb-8">
            "Sự hiện diện của Quý khách là niềm vinh hạnh lớn lao và là mảnh ghép trọn vẹn nhất trong ngày hạnh phúc của chúng tôi."
          </p>
          <button
            class="w-full sm:w-auto min-w-[240px] bg-primary text-white dark:text-surface-lowest px-9 py-4 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.22em] uppercase transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-lg flex items-center justify-center gap-3"
            data-nav-next="2" id="ob-step1-next" type="button">
            <span>MỞ THIỆP MỜI</span>
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </article>

      <!-- STEP 2: Giới thiệu Cô Dâu & Chú Rể (Không kèm phụ huynh) -->
      <article class="onboarding-step is-next onboarding-glass-card rounded-3xl p-6 md:p-10 text-center" data-step="2" id="onboarding-step-2">
        <div class="border border-outline/35 rounded-2xl p-5 md:p-8 flex flex-col items-center">
          <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-1">The Happy Couple</p>
          <h2 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-6">Nhân Vật Chính</h2>

          <div class="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md mb-6 items-center">
            <!-- Chú Rể -->
            <div class="flex flex-col items-center">
              <div class="w-28 h-28 md:w-36 md:h-36 p-1.5 rounded-full border border-outline/50 bg-card/60 shadow-luxury mb-3">
                <img alt="Chú Rể" class="w-full h-full object-cover rounded-full prevent-download" id="ob-groom-photo" />
              </div>
              <span class="font-label-caps text-[10px] tracking-[0.22em] text-tertiary dark:text-secondary uppercase mb-0.5">Chú Rể</span>
              <h3 class="font-headline-sm text-lg md:text-2xl italic text-primary" id="ob-groom-name"></h3>
            </div>

            <!-- Cô Dâu -->
            <div class="flex flex-col items-center">
              <div class="w-28 h-28 md:w-36 md:h-36 p-1.5 rounded-full border border-outline/50 bg-card/60 shadow-luxury mb-3">
                <img alt="Cô Dâu" class="w-full h-full object-cover rounded-full prevent-download" id="ob-bride-photo" />
              </div>
              <span class="font-label-caps text-[10px] tracking-[0.22em] text-tertiary dark:text-secondary uppercase mb-0.5">Cô Dâu</span>
              <h3 class="font-headline-sm text-lg md:text-2xl italic text-primary" id="ob-bride-name"></h3>
            </div>
          </div>

          <p class="font-body-md text-on-surface-variant italic text-sm max-w-md mb-7" id="ob-step2-quote">
            Hai hành trình riêng biệt nay hòa chung một nhịp đập yêu thương.
          </p>

          <div class="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 w-full">
            <button
              class="w-full sm:w-auto px-6 py-3.5 rounded-full border border-outline/50 text-on-background hover:border-primary hover:text-primary font-label-caps text-label-caps tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2"
              data-nav-prev="1" type="button">
              <span class="material-symbols-outlined text-base">arrow_back</span>
              <span>QUAY LẠI</span>
            </button>
            <button
              class="w-full sm:w-auto flex-1 max-w-xs bg-primary text-white dark:text-surface-lowest px-7 py-3.5 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-md flex items-center justify-center gap-2"
              data-nav-next="3" type="button">
              <span>XEM THỜI GIAN &amp; ĐỊA ĐIỂM</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </article>

      <!-- STEP 3: Thời gian, Địa điểm & Google Maps -->
      <article class="onboarding-step is-next onboarding-glass-card rounded-3xl p-6 md:p-10 text-center" data-step="3" id="onboarding-step-3">
        <div class="border border-outline/35 rounded-2xl p-5 md:p-8 flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 text-primary">
            <span class="material-symbols-outlined text-2xl">celebration</span>
          </div>
          <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-1">Time &amp; Venue</p>
          <h2 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-5" id="ob-event-title"></h2>

          <div class="w-full bg-card/70 dark:bg-surface-container/80 rounded-2xl p-4 md:p-6 border border-outline-variant/80 mb-5 space-y-4">
            <div class="flex flex-col items-center">
              <div class="flex items-center gap-1.5 text-primary mb-1">
                <span class="material-symbols-outlined text-base">schedule</span>
                <span class="font-label-caps text-[10px] tracking-[0.22em] uppercase">Thời Gian</span>
              </div>
              <p class="font-headline-sm text-xl md:text-2xl font-semibold text-on-background" id="ob-event-time"></p>
              <p class="font-body-md text-sm text-on-surface-variant" id="ob-event-date"></p>
            </div>

            <div class="h-px w-20 bg-outline/30 mx-auto"></div>

            <div class="flex flex-col items-center">
              <div class="flex items-center gap-1.5 text-primary mb-1">
                <span class="material-symbols-outlined text-base">location_on</span>
                <span class="font-label-caps text-[10px] tracking-[0.22em] uppercase">Địa Điểm</span>
              </div>
              <p class="font-body-md text-base md:text-lg font-semibold text-on-background" id="ob-event-venue"></p>
              <p class="font-body-md text-xs md:text-sm text-on-surface-variant italic mb-3" id="ob-event-address"></p>
              <a class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/15 hover:bg-primary hover:text-white dark:hover:text-surface-lowest text-primary border border-primary/40 font-label-caps text-[10px] font-semibold tracking-[0.2em] uppercase transition-all"
                href="#" id="ob-event-maps-link" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined text-sm">map</span>
                <span>MỞ GOOGLE MAPS CHỈ ĐƯỜNG</span>
              </a>
            </div>
          </div>

          <div class="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 w-full">
            <button
              class="w-full sm:w-auto px-6 py-3.5 rounded-full border border-outline/50 text-on-background hover:border-primary hover:text-primary font-label-caps text-label-caps tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2"
              data-nav-prev="2" type="button">
              <span class="material-symbols-outlined text-base">arrow_back</span>
              <span>QUAY LẠI</span>
            </button>
            <button
              class="w-full sm:w-auto flex-1 max-w-xs bg-primary text-white dark:text-surface-lowest px-7 py-3.5 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-md flex items-center justify-center gap-2"
              data-nav-next="4" type="button">
              <span>ĐẾN PHẦN XÁC NHẬN</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </article>

      <!-- STEP 4: Form Xác nhận Tham dự (Quick RSVP) -->
      <article class="onboarding-step is-next onboarding-glass-card rounded-3xl p-6 md:p-10 text-center" data-step="4" id="onboarding-step-4">
        <div class="border border-outline/35 rounded-2xl p-5 md:p-8 flex flex-col items-center">
          <p class="font-label-caps text-label-caps text-primary tracking-[0.28em] uppercase mb-1">R.S.V.P</p>
          <h2 class="font-headline-sm text-2xl md:text-3xl italic text-on-background mb-1">Xác Nhận Tham Dự</h2>
          <p class="font-body-md text-xs md:text-sm text-on-surface-variant italic mb-5" id="ob-rsvp-deadline"></p>

          <form class="w-full max-w-md space-y-4 text-left mb-5" id="onboarding-rsvp-form" novalidate>
            <div>
              <label class="block font-label-caps text-[10px] text-tertiary dark:text-secondary tracking-[0.18em] uppercase mb-1.5"
                for="ob-rsvp-name">Tên của bạn + Mối quan hệ</label>
              <input
                class="w-full bg-card/80 dark:bg-surface-lowest/80 border border-outline/40 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-xl font-body-md text-sm text-on-background placeholder:text-on-surface-variant/50 transition-all outline-none"
                id="ob-rsvp-name" placeholder="VD: Khoa HDGames, Nhung 12A1..." required type="text" />
              <p class="text-tertiary text-xs mt-1 hidden" id="ob-rsvp-name-error"></p>
            </div>
            <div>
              <label class="block font-label-caps text-[10px] text-tertiary dark:text-secondary tracking-[0.18em] uppercase mb-1.5"
                for="ob-rsvp-guests">Số lượng khách tham dự</label>
              <input
                class="w-full bg-card/80 dark:bg-surface-lowest/80 border border-outline/40 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-xl font-body-md text-sm text-on-background transition-all outline-none"
                id="ob-rsvp-guests" inputmode="numeric" max="20" min="1" required type="number" value="1" />
              <p class="text-tertiary text-xs mt-1 hidden" id="ob-rsvp-guests-error"></p>
            </div>
            <p class="form-status hidden" id="ob-rsvp-status"></p>
            <button
              class="w-full bg-primary text-white dark:text-surface-lowest py-3.5 rounded-full font-label-caps text-label-caps font-semibold tracking-[0.22em] uppercase transition-all duration-300 hover:bg-tertiary active:scale-95 shadow-md disabled:opacity-60"
              id="ob-rsvp-submit" type="submit">GỬI XÁC NHẬN THAM DỰ</button>
          </form>

          <div class="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 w-full pt-3 border-t border-outline-variant/60">
            <button
              class="w-full sm:w-auto px-5 py-3 rounded-full border border-outline/50 text-on-background hover:border-primary hover:text-primary font-label-caps text-[10px] tracking-[0.18em] uppercase transition-all flex items-center justify-center gap-1.5"
              data-nav-prev="3" type="button">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>QUAY LẠI</span>
            </button>
            <button
              class="w-full sm:w-auto flex-1 bg-card/80 dark:bg-surface-container hover:bg-primary hover:text-white dark:hover:text-surface-lowest text-primary border border-primary/50 px-6 py-3 rounded-full font-label-caps text-[10px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
              data-nav-next="5" id="ob-enter-site-btn" type="button">
              <span>KHÁM PHÁ TOÀN BỘ THIỆP CƯỚI</span>
              <span class="material-symbols-outlined text-sm">Auto_Awesome</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Thanh chỉ báo tiến trình Step 1 -> 4 ở đáy -->
    <div class="fixed bottom-6 left-0 right-0 z-[95] flex flex-col items-center gap-2 pointer-events-none">
      <div class="flex items-center gap-2.5 pointer-events-auto bg-card/60 dark:bg-surface-container/70 backdrop-blur-md px-4 py-2 rounded-full border border-outline/30" id="onboarding-dots">
        <button aria-label="Bước 1" class="h-1.5 w-7 rounded-full bg-primary transition-all duration-500" data-step-dot="1" type="button"></button>
        <button aria-label="Bước 2" class="h-1.5 w-2 rounded-full bg-outline/40 hover:bg-outline transition-all duration-500" data-step-dot="2" type="button"></button>
        <button aria-label="Bước 3" class="h-1.5 w-2 rounded-full bg-outline/40 hover:bg-outline transition-all duration-500" data-step-dot="3" type="button"></button>
        <button aria-label="Bước 4" class="h-1.5 w-2 rounded-full bg-outline/40 hover:bg-outline transition-all duration-500" data-step-dot="4" type="button"></button>
      </div>
      <p class="font-label-caps text-[10px] tracking-[0.25em] text-on-surface-variant uppercase" id="onboarding-step-label">BƯỚC 1 / 4 — LỜI CẢM ƠN</p>
    </div>
  </div>
```

---

### Task 3: Triển khai Logic Điều hướng Slide 2 chiều (Step 1 → 5), Đồng bộ dữ liệu và Form RSVP trong `index.html`

**Files:**
- Modify: `index.html` (Cập nhật `initWeddingContent` và thêm `initOnboardingDeck`)

**Interfaces:**
- Consumes: `WEDDING_CONFIG`, `sendToWorker`, `showFormPopup`, `tryPlayMusic`, `lockScroll`, `unlockScroll`, `playHeroReveal`.
- Produces: Luồng chuyển bước 1 ↔ 2 ↔ 3 ↔ 4 → 5 mượt mà kèm hỗ trợ phím mũi tên Trái/Phải và vuốt cảm ứng (Swipe).

- [ ] **Step 1: Cập nhật `initWeddingContent()` trong `index.html` để đổ dữ liệu vào `#onboarding-deck`**

Trong hàm `initWeddingContent()`, bổ sung binding cho các phần tử của Onboarding Deck:

```javascript
        // --- Onboarding Slide Deck Data Binding ---
        const bgImg = document.getElementById('onboarding-bg-img');
        if (bgImg && images.header?.length) {
          bgImg.style.backgroundImage = `url('${images.header[0]}')`;
        }
        document.getElementById('ob-step1-names').textContent = `${couple.groom.name} & ${couple.bride.name}`;
        document.getElementById('ob-step1-date').textContent = wedding.dateDisplay;

        document.getElementById('ob-groom-photo').src = images.groom;
        document.getElementById('ob-groom-name').textContent = couple.groom.name;
        document.getElementById('ob-bride-photo').src = images.bride;
        document.getElementById('ob-bride-name').textContent = couple.bride.name;

        document.getElementById('ob-event-title').textContent = event.title;
        document.getElementById('ob-event-time').textContent = event.time;
        document.getElementById('ob-event-date').textContent = event.dateText;
        document.getElementById('ob-event-venue').textContent = event.venueName;
        document.getElementById('ob-event-address').textContent = event.venueAddress;
        document.getElementById('ob-event-maps-link').href = event.mapsUrl;

        if (rsvp?.deadlineText) {
          document.getElementById('ob-rsvp-deadline').textContent = rsvp.deadlineText;
        }
```

- [ ] **Step 2: Thêm hàm `initOnboardingDeck()` vào script chính trong `index.html`**

Thêm hàm xử lý chuyển cảnh 5 bước, hỗ trợ nút Next, Back, Dots, Skip và Quick RSVP:

```javascript
      const STEP_TITLES = {
        1: 'BƯỚC 1 / 4 — LỜI CẢM ƠN',
        2: 'BƯỚC 2 / 4 — CẶP ĐÔI',
        3: 'BƯỚC 3 / 4 — THỜI GIAN & ĐỊA ĐIỂM',
        4: 'BƯỚC 4 / 4 — XÁC NHẬN THAM DỰ',
      };

      let currentOnboardingStep = 1;
      let onboardingActive = true;

      function goToOnboardingStep(targetStep) {
        const deck = document.getElementById('onboarding-deck');
        if (!deck || !onboardingActive) return;

        // Khi nhấn từ Step 1 sang Step 2 -> Tự động bật nhạc nếu nhạc chưa phát
        if (currentOnboardingStep === 1 && targetStep > 1 && !isMusicPlaying) {
          const savedMusic = localStorage.getItem('wedding-music-playing');
          if (savedMusic !== 'false') {
            tryPlayMusic();
          }
        }

        // Step 5: Đóng trình chiếu mở đầu và hiển thị toàn bộ trang web
        if (targetStep >= 5) {
          dismissOnboardingDeck();
          return;
        }

        const clamped = Math.max(1, Math.min(4, targetStep));
        currentOnboardingStep = clamped;

        const steps = deck.querySelectorAll('.onboarding-step');
        steps.forEach((stepEl) => {
          const stepNum = parseInt(stepEl.getAttribute('data-step'), 10);
          stepEl.classList.remove('is-active', 'is-prev', 'is-next');
          if (stepNum === clamped) {
            stepEl.classList.add('is-active');
          } else if (stepNum < clamped) {
            stepEl.classList.add('is-prev');
          } else {
            stepEl.classList.add('is-next');
          }
        });

        // Phóng nhẹ ảnh nền theo từng bước tạo chiều sâu điện ảnh
        const bgImg = document.getElementById('onboarding-bg-img');
        if (bgImg) {
          bgImg.style.transform = `scale(${1.06 + clamped * 0.02})`;
        }

        // Cập nhật thanh dots tiến trình
        const dots = deck.querySelectorAll('[data-step-dot]');
        dots.forEach((dot) => {
          const dotStep = parseInt(dot.getAttribute('data-step-dot'), 10);
          if (dotStep === clamped) {
            dot.classList.add('w-7', 'bg-primary');
            dot.classList.remove('w-2', 'bg-outline/40');
          } else {
            dot.classList.remove('w-7', 'bg-primary');
            dot.classList.add('w-2', 'bg-outline/40');
          }
        });

        const label = document.getElementById('onboarding-step-label');
        if (label && STEP_TITLES[clamped]) {
          label.textContent = STEP_TITLES[clamped];
        }
      }

      function dismissOnboardingDeck() {
        const deck = document.getElementById('onboarding-deck');
        if (!deck || !onboardingActive) return;
        onboardingActive = false;

        deck.classList.add('deck-dismissed');
        deck.setAttribute('aria-hidden', 'true');

        // Mở khóa scroll và chạy hiệu ứng xuất hiện Hero của trang chính
        window.scrollTo(0, 0);
        revealHeroOnLoad();
      }

      function initOnboardingDeck() {
        const deck = document.getElementById('onboarding-deck');
        if (!deck) return;

        // Khóa cuộn trang chính khi đang ở trong Slide Deck mở đầu
        lockScroll();

        // Nút Next / Prev
        deck.addEventListener('click', (e) => {
          const nextBtn = e.target.closest('[data-nav-next]');
          if (nextBtn) {
            const nextStep = parseInt(nextBtn.getAttribute('data-nav-next'), 10);
            goToOnboardingStep(nextStep);
            return;
          }

          const prevBtn = e.target.closest('[data-nav-prev]');
          if (prevBtn) {
            const prevStep = parseInt(prevBtn.getAttribute('data-nav-prev'), 10);
            goToOnboardingStep(prevStep);
            return;
          }

          const dotBtn = e.target.closest('[data-step-dot]');
          if (dotBtn) {
            const dotStep = parseInt(dotBtn.getAttribute('data-step-dot'), 10);
            goToOnboardingStep(dotStep);
          }
        });

        // Nút Bỏ qua (Vào Trang Chính)
        document.getElementById('onboarding-skip-btn')?.addEventListener('click', () => {
          if (!isMusicPlaying && localStorage.getItem('wedding-music-playing') !== 'false') {
            tryPlayMusic();
          }
          dismissOnboardingDeck();
        });

        // Điều hướng bằng bàn phím Trái / Phải khi không focus vào ô input
        window.addEventListener('keydown', (e) => {
          if (!onboardingActive) return;
          const tag = document.activeElement?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') return;

          if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentOnboardingStep < 4) goToOnboardingStep(currentOnboardingStep + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentOnboardingStep > 1) goToOnboardingStep(currentOnboardingStep - 1);
          }
        });

        // Hỗ trợ vuốt trái/phải trên thiết bị cảm ứng
        let touchStartX = 0;
        let touchStartY = 0;
        deck.addEventListener('touchstart', (e) => {
          if (!onboardingActive) return;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        deck.addEventListener('touchend', (e) => {
          if (!onboardingActive) return;
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            if (dx < 0 && currentOnboardingStep < 4) {
              goToOnboardingStep(currentOnboardingStep + 1);
            } else if (dx > 0 && currentOnboardingStep > 1) {
              goToOnboardingStep(currentOnboardingStep - 1);
            }
          }
        }, { passive: true });

        // Xử lý gửi form RSVP ngay trong Step 4
        const obForm = document.getElementById('onboarding-rsvp-form');
        const obNameInput = document.getElementById('ob-rsvp-name');
        const obGuestsInput = document.getElementById('ob-rsvp-guests');
        const obStatusEl = document.getElementById('ob-rsvp-status');
        const obSubmitBtn = document.getElementById('ob-rsvp-submit');

        obForm?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = obNameInput.value.trim();
          const guestsVal = obGuestsInput.value.trim();

          if (!name) {
            const errEl = document.getElementById('ob-rsvp-name-error');
            errEl.textContent = 'Vui lòng nhập tên của bạn.';
            errEl.classList.remove('hidden');
            obNameInput.focus();
            obNameInput.addEventListener('input', () => errEl.classList.add('hidden'), { once: true });
            return;
          }

          const guests = parseInt(guestsVal, 10);
          if (!guestsVal || isNaN(guests) || guests < 1) {
            const errEl = document.getElementById('ob-rsvp-guests-error');
            errEl.textContent = 'Số lượng khách phải từ 1 người trở lên.';
            errEl.classList.remove('hidden');
            obGuestsInput.focus();
            obGuestsInput.addEventListener('input', () => errEl.classList.add('hidden'), { once: true });
            return;
          }

          setFormStatus(obStatusEl, '');
          setSubmitLoading(obSubmitBtn, true, 'GỬI XÁC NHẬN THAM DỰ');

          try {
            const coupleNames = WEDDING_CONFIG.footer.names;
            await sendToWorker(`[Phản hồi tham dự - Mở đầu] ${name} — ${coupleNames}`, {
              'Loại': 'Xác nhận tham dự (Slide mở đầu)',
              'Tên': name,
              'Tham dự': 'Có',
              'Số khách': String(guests),
              'Sự kiện': WEDDING_CONFIG.event.title,
              'Ngày': WEDDING_CONFIG.event.dateText,
            });
            showFormPopup('Xác Nhận Thành Công!', 'Cảm ơn bạn đã xác nhận tham dự! Hãy cùng khám phá toàn bộ thiệp cưới của chúng mình nhé.');
            obForm.reset();
            obGuestsInput.value = '1';
            // Tự động chuyển sang Step 5 (Toàn bộ trang web) sau khi gửi thành công
            setTimeout(() => {
              dismissOnboardingDeck();
            }, 900);
          } catch (err) {
            setFormStatus(obStatusEl, err.message || 'Gửi thất bại, vui lòng thử lại.', 'error');
          } finally {
            setSubmitLoading(obSubmitBtn, false, 'GỬI XÁC NHẬN THAM DỰ');
          }
        });
      }
```

---

### Task 4: Biên dịch Tailwind CSS và Kiểm thử toàn diện trên Google Chrome

**Files:**
- Modify: `assets/tailwind.css`

**Interfaces:**
- Consumes: `index.html`, `tailwind.config.js`
- Produces: `assets/tailwind.css` và kiểm thử trực quan 5 bước trên Chrome.

- [ ] **Step 1: Biên dịch lại CSS**

Run: `npm run build:css`
Expected: Exit code 0.

- [ ] **Step 2: Kiểm thử chuyển cảnh 1 ↔ 2 ↔ 3 ↔ 4 → 5 trên trình duyệt Chrome**

Xác minh:
1. Mở trang hiện ngay **Step 1** với hình nền cưới làm mờ và thông điệp cảm ơn.
2. Nhấn **`MỞ THIỆP MỜI`** → Slide 1 trượt sang trái, **Step 2** (Cô dâu & Chú rể) trượt từ phải vào mượt mà.
3. Nhấn **`QUAY LẠI`** → Slide 2 trượt sang phải, **Step 1** trượt từ trái trở lại.
4. Đi tiếp qua **Step 3** (Thời gian, Địa điểm & nút Google Maps) → **Step 4** (Form xác nhận tham dự).
5. Nhấn **`KHÁM PHÁ TOÀN BỘ THIỆP CƯỚI`** → Toàn bộ Slide Deck mở đầu thu phóng mờ dần, hiển thị **Step 5** (Toàn bộ trang web chính).
6. Kiểm tra nút đổi **Light Mode / Dark Mode** hoạt động mượt ngay trên từng Slide.
