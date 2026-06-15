---
name: Ethereal Union
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#484740'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#79776f'
  outline-variant: '#cac6bd'
  surface-tint: '#605e58'
  primary: '#605e58'
  on-primary: '#ffffff'
  primary-container: '#f5f1e9'
  on-primary-container: '#6f6d67'
  inverse-primary: '#c9c6bf'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff0ce'
  on-tertiary-container: '#866a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6e2da'
  primary-fixed-dim: '#c9c6bf'
  on-primary-fixed: '#1c1c17'
  on-primary-fixed-variant: '#484741'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1140px
  gutter: 24px
  margin-mobile: 20px
  section-gap-desktop: 120px
  section-gap-mobile: 64px
---

## Brand & Style
The design system is centered on the concepts of timeless elegance, romantic intimacy, and understated luxury. It targets a discerning audience looking for a sophisticated digital experience that mirrors the tactile quality of premium letterpress stationery.

The design style is a blend of **High-End Editorial Minimalism** and **Soft Tactility**. It prioritizes generous whitespace (breathing room) to evoke a sense of calm and importance. Visual elements are delicate, utilizing thin strokes and subtle transitions rather than aggressive shadows or bold blocks of color. The emotional response should be one of "quiet luxury"—sophisticated, welcoming, and deeply personal.

## Colors
The palette is rooted in a "Paper & Ink" philosophy. 

- **Primary & Neutral:** These represent the canvas. Use `#FDFBF7` (White/Cream) for the main backgrounds and `#F5F1E9` (Beige) for section layering and container backgrounds to create subtle depth.
- **Secondary:** Used primarily for typography and structural lines. `#2C3E50` provides the necessary contrast to ensure legibility while remaining softer and more "organic" than pure black.
- **Accent:** `#D4AF37` (Rose Gold/Gold) is used sparingly for interactive elements, highlights, and decorative flourishes. It should feel like a "foil stamp" on the digital page.

## Typography
The typography strategy relies on the high-contrast pairing of a sophisticated Serif and a clean, wide-set Sans-Serif. 

- **Playfair Display** is the voice of the event. It should be used for names, section titles, and large atmospheric quotes. Use "Italic" styles for emphasis to enhance the romantic feel.
- **Montserrat** handles the functional information. By using a slightly increased letter-spacing on body text and labels, we maintain a luxurious, airy feel even in dense information blocks.
- **Label-caps** should be used for small headers above sections or button text to create a structured, organized appearance.

## Layout & Spacing
This design system utilizes a **Fixed Centered Grid** for desktop to mimic the layout of a physical invitation card.

- **Desktop:** A 12-column grid with a maximum width of 1140px. 
- **Rhythm:** Use an 8px base unit. Section vertical spacing should be aggressive (120px+) to allow the content to "breathe" and signal a change in narrative.
- **Mobile:** Transition to a single-column fluid layout with 20px side margins. 
- **Dividers:** Use extremely thin (0.5pt to 1pt) horizontal lines in the Secondary color at 20% opacity to separate content without creating visual clutter.

## Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional shadows. 

- **Surface Tiers:** Use the Primary/Neutral colors to create "stacked paper" effects. A light beige (`#F5F1E9`) card sitting on a cream (`#FDFBF7`) background provides enough distinction.
- **Soft Shadows:** If elevation is required for interactivity (like a floating RSVP button), use an ultra-diffused shadow: `0px 10px 30px rgba(44, 62, 80, 0.05)`. 
- **Borders:** Use thin, solid borders in the Accent color (`#D4AF37`) for high-priority cards or selected states, mimicking a gold-leaf edge.

## Shapes
The shape language is **Soft and Rectilinear**. 

- **Corners:** Maintain a very slight radius (4px to 8px) for containers and buttons. This softens the "digital" hardness of the UI without becoming overly bubbly or casual.
- **Interactive Elements:** Buttons should be standard rectangles with the soft radius, avoiding pill shapes to maintain the formal, editorial aesthetic.
- **Imagery:** Photography should utilize the same corner radius or be presented in classic arch shapes for a more traditional wedding feel.

## Components
- **Buttons:** Primary buttons use a solid Accent background (`#D4AF37`) with white text. Secondary buttons use a transparent background with a thin Secondary color border. Use `label-caps` typography for all button labels.
- **Input Fields:** Use a "Minimalist Line" style—only a bottom border in a lightened Secondary color. Labels should float above the line in `label-caps`.
- **Cards:** Cards should have no visible border and a very subtle background shift to `#F5F1E9`. Use generous internal padding (32px+).
- **RSVP Chips:** Use small, rectangular chips with a 1px border. Selected states fill with the Accent color.
- **Dividers:** Incorporate a decorative element, such as a small centered leaf icon or a simple dot, in the middle of horizontal dividers for a bespoke touch.
- **Image Containers:** Use thin 1px inset borders to frame photos, creating a "gallery" look.