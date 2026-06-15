// ============================================================
// CẤU HÌNH MÀU SẮC — Chỉnh sửa tại đây
// Sau khi đổi màu theme, chạy: npm run build:css (nếu thêm token mới)
// ============================================================
const THEME_PALETTES = {
    light: {
        primary: '#d4a3a3',
        secondary: '#f4e4e4',
        tertiary: '#FFA1A1',
        background: '#FFF5F5',
        surface: '#fff9f9',
        surfaceLowest: '#fff9f9',
        onBackground: '#823C3C',
        onSurface: '#823C3C',
        onSurfaceVariant: 'rgba(130, 60, 60, 0.65)',
        outline: '#D4A3A3',
        outlineVariant: '#e2d1d1',
        surfaceContainer: '#FFF5F5',
        card: '#ffffff',
        surfaceContainerHigh: '#ffffff',
        surfaceContainerHighest: '#ffffff',
        hero: {
            nameGradient: 'linear-gradient(160deg, #fff5f8 0%, #ffd6e0 25%, #ffb3c6 50%, #f4a4b8 75%, #ffeef3 100%)',
            nameGlow: 'drop-shadow(0 2px 12px rgba(255, 105, 135, 0.45)) drop-shadow(0 6px 28px rgba(212, 100, 120, 0.35))',
            ampersand: '#ffe8ef',
            dateText: '#ffe8ef',
            halo: 'radial-gradient(ellipse at center, rgba(255, 182, 193, 0.35) 0%, rgba(244, 194, 194, 0.15) 45%, transparent 70%)',
            divider: 'linear-gradient(90deg, transparent, rgba(255, 182, 193, 0.9), rgba(255, 228, 236, 1), rgba(255, 182, 193, 0.9), transparent)',
            dividerGlow: '0 0 12px rgba(255, 182, 193, 0.6)',
            ampersandGlow: '0 0 40px rgba(255, 182, 193, 0.9), 0 0 80px rgba(244, 163, 184, 0.5), 0 2px 16px rgba(212, 100, 120, 0.4)',
        },
        petals: ['#ffe4e1', '#fff0f5', '#ffebee'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(212, 163, 163, 0.35) 30%, rgba(255, 182, 193, 0.55) 50%, rgba(212, 163, 163, 0.35) 70%, transparent 95%)',
        musicPulse: 'rgba(226, 86, 86, 0.4)',
        form: { error: '#ba1a1a', success: '#b08585' },
        glass: {
            background: 'rgba(255, 255, 255, 0.4)',
            border: 'rgba(255, 255, 255, 0.3)',
        },
    },
    dark: {
        primary: '#f1bebe',
        secondary: '#d7c4a4',
        tertiary: '#c5b393',
        background: '#131313',
        surface: '#131313',
        surfaceLowest: '#0e0e0e',
        onBackground: '#e5e2e1',
        onSurface: '#e5e2e1',
        onSurfaceVariant: 'rgba(212, 194, 194, 0.75)',
        outline: '#9d8d8d',
        outlineVariant: '#504444',
        surfaceContainer: '#201f1f',
        card: '#2a2a2a',
        surfaceContainerHigh: '#2a2a2a',
        surfaceContainerHighest: '#353534',
        hero: {
            nameGradient: 'linear-gradient(160deg, #ffffff 0%, #f4e0e0 35%, #edbaba 70%, #ffffff 100%)',
            nameGlow: 'drop-shadow(0 2px 16px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 24px rgba(241, 190, 190, 0.35))',
            ampersand: '#edbaba',
            dateText: '#f4e0e0',
            halo: 'radial-gradient(ellipse at center, rgba(241, 190, 190, 0.25) 0%, rgba(19, 19, 19, 0.2) 50%, transparent 70%)',
            divider: 'linear-gradient(90deg, transparent, rgba(241, 190, 190, 0.7), rgba(255, 255, 255, 0.85), rgba(241, 190, 190, 0.7), transparent)',
            dividerGlow: '0 0 14px rgba(241, 190, 190, 0.45)',
            ampersandGlow: '0 0 40px rgba(241, 190, 190, 0.55), 0 0 80px rgba(124, 84, 84, 0.35), 0 2px 16px rgba(0, 0, 0, 0.4)',
        },
        petals: ['#f1bebe', '#613d3d', '#482728'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(157, 141, 141, 0.35) 30%, rgba(241, 190, 190, 0.45) 50%, rgba(157, 141, 141, 0.35) 70%, transparent 95%)',
        musicPulse: 'rgba(241, 190, 190, 0.4)',
        form: { error: '#ffb4ab', success: '#f1bebe' },
        glass: {
            background: 'rgba(19, 19, 19, 0.55)',
            border: 'rgba(255, 255, 255, 0.1)',
        },
    },
};

function getActivePalette() {
    if (typeof document === 'undefined') return THEME_PALETTES.light;
    return document.documentElement.classList.contains('dark')
        ? THEME_PALETTES.dark
        : THEME_PALETTES.light;
}

function applyThemeColors() {
    const root = document.documentElement;
    const t = getActivePalette();

    root.style.setProperty('--color-primary', t.primary);
    root.style.setProperty('--color-secondary', t.secondary);
    root.style.setProperty('--color-tertiary', t.tertiary);
    root.style.setProperty('--color-background', t.background);
    root.style.setProperty('--color-surface', t.surface);
    root.style.setProperty('--color-surface-lowest', t.surfaceLowest);
    root.style.setProperty('--color-on-background', t.onBackground);
    root.style.setProperty('--color-on-surface', t.onSurface);
    root.style.setProperty('--color-on-surface-variant', t.onSurfaceVariant);
    root.style.setProperty('--color-outline', t.outline);
    root.style.setProperty('--color-outline-variant', t.outlineVariant);
    root.style.setProperty('--color-surface-container', t.surfaceContainer);
    root.style.setProperty('--color-card', t.card);
    root.style.setProperty('--color-surface-container-high', t.surfaceContainerHigh);
    root.style.setProperty('--color-surface-container-highest', t.surfaceContainerHighest);

    root.style.setProperty('--hero-name-gradient', t.hero.nameGradient);
    root.style.setProperty('--hero-name-glow', t.hero.nameGlow);
    root.style.setProperty('--hero-ampersand', t.hero.ampersand);
    root.style.setProperty('--hero-date-text', t.hero.dateText);
    root.style.setProperty('--hero-halo', t.hero.halo);
    root.style.setProperty('--hero-divider', t.hero.divider);
    root.style.setProperty('--hero-divider-glow', t.hero.dividerGlow);
    root.style.setProperty('--hero-ampersand-glow', t.hero.ampersandGlow);

    root.style.setProperty('--section-divider', t.sectionDivider);
    root.style.setProperty('--music-pulse', t.musicPulse);
    root.style.setProperty('--form-error', t.form.error);
    root.style.setProperty('--form-success', t.form.success);
    root.style.setProperty('--glass-bg', t.glass.background);
    root.style.setProperty('--glass-border', t.glass.border);
    root.style.setProperty('--petal-default', t.petals[0]);
}

if (typeof document !== 'undefined') {
    applyThemeColors();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { THEME_PALETTES, getActivePalette };
}

// Giữ tương thích code cũ dùng THEME_COLORS.petals
const THEME_COLORS = {
    get petals() { return getActivePalette().petals; },
};
