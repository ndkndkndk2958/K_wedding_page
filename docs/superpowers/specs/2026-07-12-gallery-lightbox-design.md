# Design Specification: Wedding Gallery Lightbox & Anti-Download Protection

This document specifies the design and implementation details for a premium fullscreen image viewer (lightbox) for the wedding gallery, alongside protection mechanisms to prevent downloading or dragging of wedding images.

## Problem Statement
1. Users want to be able to click on photos in the wedding album to view them in high resolution (fullscreen).
2. The hosts want to protect their photos from being easily downloaded, copied, or dragged-and-dropped.

## Proposed Solution

```mermaid
graph TD
    A[User clicks .gallery-item wrapper] --> B[openLightbox(index)]
    B --> C[Set body overflow: hidden]
    B --> D[Set lightbox image src]
    B --> E[Fade in Lightbox]
    F[User clicks close / clicks outside] --> G[closeLightbox()]
    G --> H[Restore body overflow]
    G --> I[Fade out Lightbox]
    J[User drags/right-clicks image] --> K[Prevented by CSS pointer-events & JS event listeners]
```

### 1. Image Protection (Anti-Download & Anti-Drag)
We will block download actions on the client browser using CSS and Javascript.

#### CSS Protection (`index.html` styles)
We will declare a utility class `.prevent-download` and apply it to all key images (gallery, banner slides, bride & groom portraits):
```css
.prevent-download {
  -webkit-touch-callout: none !important; /* Prevents long-press save menu on iOS */
  -webkit-user-select: none !important;
  user-select: none !important;
  pointer-events: none !important; /* Disables right-click and drag start on the image element */
  -webkit-user-drag: none !important; /* Prevents image dragging in WebKit browsers */
}
```

Since the image element has `pointer-events: none`, mouse clicks will pass through to the parent container (`.gallery-item`), allowing us to easily handle clicks for the lightbox without conflicting with the protection layer.

#### JavaScript Protection
To handle cases where images are accessed dynamically or fallback is needed, we will add global event blockers:
```javascript
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery-item') || e.target.closest('#lightbox')) {
        e.preventDefault();
    }
});
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
```

---

### 2. Fullscreen Lightbox Image Viewer

#### HTML Structure (`index.html`)
We will add a hidden overlay container at the bottom of the `<body>`:
```html
<div id="lightbox" class="fixed inset-0 z-[200] hidden bg-black/95 flex items-center justify-center backdrop-blur-md transition-opacity duration-300 opacity-0 select-none">
    <button id="lightbox-close" class="absolute top-6 right-6 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm" aria-label="Đóng">
        <span class="material-symbols-outlined text-3xl">close</span>
    </button>
    <button id="lightbox-prev" class="absolute left-4 md:left-8 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm" aria-label="Ảnh trước">
        <span class="material-symbols-outlined text-4xl">chevron_left</span>
    </button>
    <div id="lightbox-content" class="relative max-w-[92%] max-h-[88%] flex items-center justify-center">
        <img id="lightbox-img" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300 prevent-download" src="" alt="Full view" draggable="false">
    </div>
    <button id="lightbox-next" class="absolute right-4 md:right-8 text-white/80 hover:text-white transition-colors focus:outline-none z-[210] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm" aria-label="Ảnh tiếp">
        <span class="material-symbols-outlined text-4xl">chevron_right</span>
    </button>
</div>
```

#### Lightbox Styling (`index.html` styles)
```css
#lightbox-img {
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: 0;
  transform: scale(0.95);
}
#lightbox-img.loaded {
  opacity: 1;
  transform: scale(1);
}
```

#### JavaScript Logic (`index.html` script)
1. **Initialize Clicks**:
   Modify `createGalleryItem` to bind a click listener to the `wrapper` div:
   ```javascript
   wrapper.addEventListener('click', () => openLightbox(index));
   ```
2. **Lightbox Controls**:
   ```javascript
   let currentLightboxIndex = 0;
   const gallerySources = []; // Populated during initGallery

   function openLightbox(index) {
       currentLightboxIndex = index;
       const lightbox = document.getElementById('lightbox');
       const img = document.getElementById('lightbox-img');
       
       // Populate sources
       img.src = gallerySources[currentLightboxIndex];
       img.classList.remove('loaded');
       img.onload = () => img.classList.add('loaded');

       // Show lightbox with animation
       lightbox.classList.remove('hidden');
       setTimeout(() => {
           lightbox.classList.add('opacity-100');
       }, 10);

       // Lock scroll
       document.body.classList.add('overflow-hidden');
   }

   function closeLightbox() {
       const lightbox = document.getElementById('lightbox');
       lightbox.classList.remove('opacity-100');
       setTimeout(() => {
           lightbox.classList.add('hidden');
       }, 300);
       document.body.classList.remove('overflow-hidden');
   }

   function navigateLightbox(direction) {
       currentLightboxIndex = (currentLightboxIndex + direction + gallerySources.length) % gallerySources.length;
       const img = document.getElementById('lightbox-img');
       img.classList.remove('loaded');
       setTimeout(() => {
           img.src = gallerySources[currentLightboxIndex];
           img.onload = () => img.classList.add('loaded');
       }, 150);
   }
   ```
3. **Event Listeners**:
   - Keyboard arrows (Left / Right) and Escape (Esc).
   - Touch gestures (swipe left for next, swipe right for prev).
   - Click overlay (closing when clicking outside `lightbox-content`).

---

## Verification Plan

### Manual Verification
1. Open the page and click on any image in the Gallery. Verify the lightbox opens smoothly with a scale/fade zoom transition.
2. Click next/prev buttons, or swipe on mobile, or press keyboard arrows. Verify the images change smoothly.
3. Try to drag any image (gallery, banner, portraits, lightbox). Verify dragging is blocked.
4. Right-click on any image. Verify the context menu is blocked.
5. On mobile, press and hold an image. Verify that the "Save Image" option does not appear.
6. Verify page scroll is locked when the lightbox is open, and restored when closed.
