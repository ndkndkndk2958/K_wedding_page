# Form Redesign & Inline Custom Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign RSVP and Wishes forms inside `index.html` with inline Vietnamese validation warnings directly underneath the fields, highlight empty fields with a themed red border, and show the success popup modal layered properly on top.

**Architecture:** 
1. Add `<p class="text-tertiary text-xs mt-1.5 hidden" id="...-error"></p>` markup under inputs in `index.html`.
2. Keep `#form-popup` for successful submissions and set `style="z-index: 9999;"`.
3. Implement custom inline validation in Javascript: when inputs are missing, set text and remove `hidden` on the helper `<p>`, highlight input border in red (`border-tertiary`, `focus:ring-tertiary`), focus on input, and attach an `input` listener to clear error state as the user types.

**Tech Stack:** HTML5, CSS3, Tailwind CSS v3, Vanilla JavaScript

## Global Constraints
- **No Auto-Commits**: DO NOT automatically run `git commit` commands. All commits must be explicitly requested or approved by the user.

---

### Task 1: Add Inline Error Message DOM Elements to RSVP and Wishes Forms

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add error `<p>` tags and class structure inside RSVP and Wishes forms**

Replace RSVP form:
```html
          <form class="space-y-6" id="rsvp-form" novalidate>
            <div>
              <label class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2" for="rsvp-name">Họ và tên</label>
              <input class="w-full bg-background/50 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-2xl font-body-md transition-all outline-none" id="rsvp-name" placeholder="Nhập họ và tên của bạn" required type="text"/>
              <p class="text-tertiary text-xs mt-1.5 hidden" id="rsvp-name-error"></p>
            </div>
            <div>
              <label class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2" for="rsvp-guests">Số lượng khách</label>
              <input class="w-full bg-background/50 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-2xl font-body-md transition-all outline-none" id="rsvp-guests" inputmode="numeric" max="20" min="1" required type="number" value="1"/>
              <p class="text-tertiary text-xs mt-1.5 hidden" id="rsvp-guests-error"></p>
            </div>
            <p class="form-status hidden mb-4" id="rsvp-status"></p>

            <button class="w-full bg-primary text-white py-5 rounded-full font-label-caps text-label-caps tracking-widest transition-all hover:bg-tertiary active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" id="rsvp-submit" type="submit">XÁC NHẬN</button>
          </form>
```

Replace Wishes form:
```html
          <form class="space-y-6" id="wishes-form" novalidate>
            <div>
              <label class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2" for="wish-name">Tên của bạn</label>
              <input class="w-full bg-background/50 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-2xl font-body-md transition-all outline-none" id="wish-name" placeholder="Nhập tên của bạn" required type="text"/>
              <p class="text-tertiary text-xs mt-1.5 hidden" id="wish-name-error"></p>
            </div>
            <div>
              <label class="block font-label-caps text-label-caps text-tertiary dark:text-secondary tracking-widest mb-2" for="wish-message">Lời chúc tốt đẹp</label>
              <textarea class="w-full bg-background/50 border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 rounded-2xl font-body-md resize-none transition-all outline-none" id="wish-message" placeholder="Nhập lời chúc phúc của bạn gửi tới cô dâu & chú rể..." required rows="4"></textarea>
              <p class="text-tertiary text-xs mt-1.5 hidden" id="wish-message-error"></p>
            </div>
            <p class="form-status hidden mb-4" id="wish-status"></p>

            <button class="w-full bg-primary text-white py-5 rounded-full font-label-caps text-label-caps tracking-widest transition-all hover:bg-tertiary active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" id="wish-submit" type="submit">GỬI LỜI CHÚC</button>
          </form>
```

---

### Task 2: Implement JS Inline Validation Logic and Reusable Success Popup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Simplify `showFormPopup` to show success popups and handle opacity classes**

```javascript
    function showFormPopup(title, message) {
        const popup = document.getElementById('form-popup');
        const card = document.getElementById('form-popup-card');
        const titleEl = document.getElementById('form-popup-title');
        const messageEl = document.getElementById('form-popup-message');

        titleEl.textContent = title;
        messageEl.textContent = message;

        popup.classList.remove('hidden');
        popup.offsetHeight; // trigger reflow
        popup.classList.remove('opacity-0');
        popup.classList.add('opacity-100');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }

    function closeFormPopup() {
        const popup = document.getElementById('form-popup');
        const card = document.getElementById('form-popup-card');

        popup.classList.remove('opacity-100');
        popup.classList.add('opacity-0');
        card.classList.remove('scale-100');
        card.classList.add('scale-95');

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }
```

- [ ] **Step 2: Update `initRsvpForm` validation to show inline error helper paragraph**

Highlight invalid inputs and render text inside `#rsvp-name-error` or `#rsvp-guests-error`.

- [ ] **Step 3: Update `initWishesForm` validation to show inline error helper paragraph**

Highlight invalid inputs and render text inside `#wish-name-error` or `#wish-message-error`.

---

### Task 3: Build CSS and Verify

**Files:**
- Modify: None

- [ ] **Step 1: Compile CSS assets**

Run: `rtk npm run build:css`

- [ ] **Step 2: Verify validation errors are shown inline under fields in Vietnamese**
