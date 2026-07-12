# Design Specification: Form Redesign & Success Popup Modal

This document details the redesign of the RSVP and Wishes forms, resolving the empty spacing issue above the submit buttons, adding custom inline validation warning messages styled with the wedding theme, and adding a center-aligned success popup modal with high z-index stacking context.

## 1. Form Redesign (Modern Boxed Style)

To improve form aesthetics and resolve the empty spacing above submit buttons, we will restructure the forms and update their input elements.

### HTML Structure (`index.html`)

- **Spacing**: Reduce form element spacing by changing class `space-y-8` to `space-y-6`.
- **Validation**: Add the `novalidate` attribute to both forms to disable the default browser validation bubbles.
- **Labels**: Remove floating label markup (`float-label` and `float-field` classes) and replace them with standard labels above each input box.
- **Inputs**: Style inputs and textareas as modern boxes with rounded corners (`rounded-2xl`), a light border, and soft background.
- **Inline Validation Messages**: Add a `<p>` element with class `text-tertiary text-xs mt-1.5 hidden` under each input box for showing validation warnings.
- **Status Message**: Add the `hidden` class to `<p class="form-status">` by default so it takes 0px of vertical space when empty.

#### Proposed RSVP Form HTML:
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

#### Proposed Wishes Form HTML:
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

## 2. Success Popup Modal

When a form is submitted successfully, a center-aligned modal popup will display. We will use inline styling `z-index: 9999` to ensure it renders on top of all elements, including any active section reveals and forms.

### HTML Structure (`index.html`)

We will place this success popup element next to the gallery lightbox container at the end of the `<body>`:

```html
<!-- Form Success Popup Modal -->
<div id="form-popup" class="fixed inset-0 hidden bg-black/60 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 opacity-0 select-none" style="z-index: 9999;">
    <div id="form-popup-card" class="bg-card border border-outline/20 p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-[90%] text-center transform scale-95 transition-transform duration-300 relative">
        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary" id="form-popup-icon-container">
            <span class="material-symbols-outlined text-4xl" id="form-popup-icon">favorite</span>
        </div>
        <h3 class="font-headline-sm text-2xl text-primary mb-3" id="form-popup-title">Gửi thành công!</h3>
        <p class="font-body-md text-on-surface-variant mb-8" id="form-popup-message">Cảm ơn bạn đã gửi phản hồi.</p>
        <button id="form-popup-close" class="w-full bg-primary text-white py-4 rounded-full font-label-caps text-label-caps tracking-widest transition-all hover:bg-tertiary active:scale-95 shadow-md">ĐỒNG Ý</button>
    </div>
</div>
```

---

## 3. JavaScript Updates (`index.html` script)

### 3.1. Dynamic Form Status Formatting
Update the `setFormStatus` helper function to handle the `hidden` class dynamically:
```javascript
function setFormStatus(el, message, type = '') {
    if (!message) {
        el.textContent = '';
        el.classList.add('hidden');
        return;
    }
    el.textContent = message;
    el.className = `form-status ${type ? ` ${type}` : ''}`;
    el.classList.remove('hidden');
}
```

### 3.2. Success Popup Control functions
Add helper functions to show and close the success popup modal:
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

### 3.3. Event Listeners for Popup Modal
```javascript
function initFormPopupEvents() {
    document.getElementById('form-popup-close').addEventListener('click', closeFormPopup);
    document.getElementById('form-popup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('form-popup')) {
            closeFormPopup();
        }
    });
}
```

### 3.4. Handle RSVP Submission and Inline Validation
Validate inputs in Javascript. If validation fails, highlight the specific field in red (`border-tertiary`, `focus:ring-tertiary`) and display a localized helper error message directly underneath the input box:
```javascript
    function initRsvpForm() {
        const form = document.getElementById('rsvp-form');
        const guestsInput = document.getElementById('rsvp-guests');
        const statusEl = document.getElementById('rsvp-status');
        const submitBtn = document.getElementById('rsvp-submit');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('rsvp-name');
            const name = nameInput.value.trim();
            const guestsVal = guestsInput.value.trim();

            if (!name) {
                const errorEl = document.getElementById('rsvp-name-error');
                errorEl.textContent = 'Vui lòng nhập họ và tên của bạn.';
                errorEl.classList.remove('hidden');

                nameInput.classList.add('border-tertiary', 'focus:ring-tertiary');
                nameInput.classList.remove('border-outline/30', 'focus:ring-primary');
                nameInput.focus();
                
                const onNameInput = () => {
                    nameInput.classList.remove('border-tertiary', 'focus:ring-tertiary');
                    nameInput.classList.add('border-outline/30', 'focus:ring-primary');
                    errorEl.classList.add('hidden');
                    errorEl.textContent = '';
                    nameInput.removeEventListener('input', onNameInput);
                };
                nameInput.addEventListener('input', onNameInput);
                return;
            }

            if (!guestsVal) {
                const errorEl = document.getElementById('rsvp-guests-error');
                errorEl.textContent = 'Vui lòng nhập số lượng khách.';
                errorEl.classList.remove('hidden');

                guestsInput.classList.add('border-tertiary', 'focus:ring-tertiary');
                guestsInput.classList.remove('border-outline/30', 'focus:ring-primary');
                guestsInput.focus();
                
                const onGuestsInput = () => {
                    guestsInput.classList.remove('border-tertiary', 'focus:ring-tertiary');
                    guestsInput.classList.add('border-outline/30', 'focus:ring-primary');
                    errorEl.classList.add('hidden');
                    errorEl.textContent = '';
                    guestsInput.removeEventListener('input', onGuestsInput);
                };
                guestsInput.addEventListener('input', onGuestsInput);
                return;
            }

            const guests = parseInt(guestsVal, 10);
            if (isNaN(guests) || guests < 1) {
                const errorEl = document.getElementById('rsvp-guests-error');
                errorEl.textContent = 'Số lượng khách phải từ 1 người trở lên.';
                errorEl.classList.remove('hidden');

                guestsInput.classList.add('border-tertiary', 'focus:ring-tertiary');
                guestsInput.classList.remove('border-outline/30', 'focus:ring-primary');
                guestsInput.focus();
                
                const onGuestsInput = () => {
                    guestsInput.classList.remove('border-tertiary', 'focus:ring-tertiary');
                    guestsInput.classList.add('border-outline/30', 'focus:ring-primary');
                    errorEl.classList.add('hidden');
                    errorEl.textContent = '';
                    guestsInput.removeEventListener('input', onGuestsInput);
                };
                guestsInput.addEventListener('input', onGuestsInput);
                return;
            }

            setFormStatus(statusEl, '');
            setSubmitLoading(submitBtn, true, 'XÁC NHẬN');

            try {
                const coupleNames = WEDDING_CONFIG.footer.names;
                await sendToWorker(`[Phản hồi tham dự] ${name} — ${coupleNames}`, {
                    'Loại': 'Xác nhận tham dự',
                    'Tên': name,
                    'Tham dự': 'Có',
                    'Số khách': String(guests),
                    'Sự kiện': WEDDING_CONFIG.event.title,
                    'Ngày': WEDDING_CONFIG.event.dateText,
                });
                showFormPopup('Xác Nhận Thành Công!', 'Cảm ơn bạn đã xác nhận tham dự lễ cưới của chúng mình!');
                form.reset();
                guestsInput.value = '1';
            } catch (err) {
                setFormStatus(statusEl, err.message || 'Gửi thất bại, vui lòng thử lại.', 'error');
            } finally {
                setSubmitLoading(submitBtn, false, 'XÁC NHẬN');
            }
        });
    }
```

### 3.5. Handle Wishes Submission and Inline Validation
Validate inputs in Javascript. If validation fails, highlight the specific field in red and display a localized helper error message directly underneath the text input or textarea:
```javascript
    function initWishesForm() {
        const form = document.getElementById('wishes-form');
        const statusEl = document.getElementById('wish-status');
        const submitBtn = document.getElementById('wish-submit');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('wish-name');
            const messageInput = document.getElementById('wish-message');
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name) {
                const errorEl = document.getElementById('wish-name-error');
                errorEl.textContent = 'Vui lòng nhập tên của bạn.';
                errorEl.classList.remove('hidden');

                nameInput.classList.add('border-tertiary', 'focus:ring-tertiary');
                nameInput.classList.remove('border-outline/30', 'focus:ring-primary');
                nameInput.focus();
                
                const onNameInput = () => {
                    nameInput.classList.remove('border-tertiary', 'focus:ring-tertiary');
                    nameInput.classList.add('border-outline/30', 'focus:ring-primary');
                    errorEl.classList.add('hidden');
                    errorEl.textContent = '';
                    nameInput.removeEventListener('input', onNameInput);
                };
                nameInput.addEventListener('input', onNameInput);
                return;
            }

            if (!message) {
                const errorEl = document.getElementById('wish-message-error');
                errorEl.textContent = 'Vui lòng nhập lời chúc tốt đẹp của bạn.';
                errorEl.classList.remove('hidden');

                messageInput.classList.add('border-tertiary', 'focus:ring-tertiary');
                messageInput.classList.remove('border-outline/30', 'focus:ring-primary');
                messageInput.focus();
                
                const onMessageInput = () => {
                    messageInput.classList.remove('border-tertiary', 'focus:ring-tertiary');
                    messageInput.classList.add('border-outline/30', 'focus:ring-primary');
                    errorEl.classList.add('hidden');
                    errorEl.textContent = '';
                    messageInput.removeEventListener('input', onMessageInput);
                };
                messageInput.addEventListener('input', onMessageInput);
                return;
            }

            setFormStatus(statusEl, '');
            setSubmitLoading(submitBtn, true, 'GỬI LỜI CHÚC');

            try {
                const coupleNames = WEDDING_CONFIG.footer.names;
                await sendToWorker(`[Lời chúc] ${name} — ${coupleNames}`, {
                    'Loại': 'Lời chúc',
                    'Tên': name,
                    'Lời chúc': message,
                });

                const display = document.getElementById('wishes-display');
                const newWish = document.createElement('div');
                newWish.className = 'bg-card p-8 rounded-2xl border-l-4 border-primary shadow-sm fade-in';
                newWish.innerHTML = `
                    <p class="font-body-md italic text-on-surface mb-4">"${message.replace(/"/g, '&quot;')}"</p>
                    <p class="font-label-caps text-label-caps text-primary">— ${name.replace(/</g, '&lt;')}</p>
                `;
                display.prepend(newWish);

                showFormPopup('Gửi Lời Chúc Thành Công!', 'Cảm ơn lời chúc chân thành và ý nghĩa của bạn!');
                form.reset();
            } catch (err) {
                setFormStatus(statusEl, err.message || 'Gửi thất bại, vui lòng thử lại.', 'error');
            } finally {
                setSubmitLoading(submitBtn, false, 'GỬI LỜI CHÚC');
            }
        });
    }
```
