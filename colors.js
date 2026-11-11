// ============================================================
// CẤU HÌNH MÀU SẮC — Chỉnh sửa tại đây
// Sau khi đổi màu theme, chạy: npm run build:css (nếu thêm token mới)
//
// Bản thiết kế đã duyệt:
// • Light mode: Trắng ngà (#F5F0EB) – Đỏ rượu vang (#762D40).
// • Dark mode: Cacao ấm (#30221D) – Champagne (#F1D5AB / #F3D9AF).
// ============================================================
const THEME_PALETTES = {
    light: {
        primary: '#762D40',                  // Đỏ rượu vang — tên cặp đôi, biểu tượng nhấn & nền nút chính
        primaryHover: '#602235',             // Nền nút chính khi hover
        onPrimary: '#FFFFFF',                // Chữ nút chính
        secondary: '#DED0BF',                // Viền & đường trang trí (champagne ấm)
        tertiary: '#602235',                 // Đỏ rượu đậm khi hover
        background: '#F5F0EB',               // Nền trang trắng ngà sạch, không ám vàng xanh
        surface: '#FAF5EF',                  // Bề mặt ngà ấm
        surfaceLowest: '#EFEAE3',            // Lớp nền sâu hơn
        onBackground: '#392D31',             // Chữ chính, tiêu đề (WCAG AAA)
        onSurface: '#392D31',                // Chữ chính trên thiệp
        onSurfaceVariant: '#705E61',         // Chữ phụ
        outline: '#DED0BF',                  // Viền và đường trang trí mảnh 1px
        outlineVariant: '#E8DFD3',           // Viền phụ mờ
        surfaceContainer: '#F7F2EC',         // Hộp chứa nội dung
        card: '#FFFCF8',                     // Nền tấm thiệp trắng ngà tinh khôi
        surfaceContainerHigh: '#FFFFFF',
        surfaceContainerHighest: '#FFFFFF',
        inputBg: '#FFFFFF',                  // Nền trường nhập liệu
        inputBorder: '#CDBDB4',              // Viền trường nhập liệu
        inputText: '#392D31',                // Chữ trường nhập liệu
        inputPlaceholder: 'rgba(112, 94, 97, 0.65)',
        hero: {
            nameGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7F2 45%, #F5DFD5 80%, #FFFFFF 100%)',
            nameGlow: 'drop-shadow(0 4px 18px rgba(38, 20, 26, 0.45)) drop-shadow(0 2px 8px rgba(118, 45, 64, 0.35))',
            ampersand: '#F3D9AF',
            dateText: '#FFFDF9',
            halo: 'radial-gradient(ellipse at center, rgba(38, 20, 26, 0.32) 0%, rgba(38, 20, 26, 0.12) 50%, transparent 72%)',
            divider: 'linear-gradient(90deg, transparent, rgba(222, 208, 191, 0.85), #FFFFFF, rgba(222, 208, 191, 0.85), transparent)',
            dividerGlow: '0 0 14px rgba(222, 208, 191, 0.45)',
            ampersandGlow: '0 0 28px rgba(243, 217, 175, 0.55), 0 2px 12px rgba(0, 0, 0, 0.45)',
        },
        petals: ['#EADBD3', '#D6C0B5', '#C0A093'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(222, 208, 191, 0.4) 30%, rgba(118, 45, 64, 0.55) 50%, rgba(222, 208, 191, 0.4) 70%, transparent 95%)',
        musicPulse: 'rgba(118, 45, 64, 0.35)',
        form: { error: '#A82835', success: '#2E6930' },
        glass: {
            background: 'rgba(255, 252, 248, 0.88)',
            border: '#DED0BF',
        },
    },
    dark: {
        primary: '#F1D5AB',                  // Champagne lì sang trọng (nền nút chính)
        primaryHover: '#F7E2C3',             // Nền nút chính khi hover
        onPrimary: '#39271E',                // Chữ nút chính màu nâu trầm
        secondary: '#B69B7B',                // Viền & đường trang trí (champagne lì)
        tertiary: '#F7E2C3',                 // Champagne sáng hover
        background: '#30221D',               // Nền trang cacao ấm
        surface: '#43332B',                  // Espresso Cacao
        surfaceLowest: '#231814',            // Onyx Cacao
        onBackground: '#FFF6E8',             // Chữ chính, tiêu đề
        onSurface: '#FFF6E8',                // Chữ chính trên thiệp
        onSurfaceVariant: '#E8D9CA',         // Chữ phụ
        outline: '#B69B7B',                  // Viền và đường trang trí champagne lì mảnh 1px
        outlineVariant: '#5A453A',           // Viền phụ nâu bronze
        surfaceContainer: '#554238',         // Hộp chứa nâu taupe mềm
        card: '#695247',                     // Nền tấm thiệp nâu taupe ấm (sáng hơn nền cacao rõ ràng)
        surfaceContainerHigh: '#735B50',
        surfaceContainerHighest: '#7F6558',
        inputBg: '#49372F',                  // Nền trường nhập liệu cacao trầm
        inputBorder: '#B69B7B',              // Viền trường nhập liệu champagne lì
        inputText: '#FFF6E8',                // Chữ trường nhập liệu
        inputPlaceholder: 'rgba(232, 217, 202, 0.65)',
        hero: {
            nameGradient: 'linear-gradient(150deg, #FFFFFF 0%, #FFF6E8 38%, #F3D9AF 72%, #FFFFFF 100%)',
            nameGlow: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.75)) drop-shadow(0 2px 14px rgba(243, 217, 175, 0.35))',
            ampersand: '#F3D9AF',
            dateText: '#FFF6E8',
            halo: 'radial-gradient(ellipse at center, rgba(48, 34, 29, 0.5) 0%, rgba(48, 34, 29, 0.2) 50%, transparent 72%)',
            divider: 'linear-gradient(90deg, transparent, rgba(182, 155, 123, 0.8), rgba(255, 246, 232, 0.95), rgba(182, 155, 123, 0.8), transparent)',
            dividerGlow: '0 0 16px rgba(182, 155, 123, 0.4)',
            ampersandGlow: '0 0 36px rgba(243, 217, 175, 0.5), 0 2px 16px rgba(0, 0, 0, 0.5)',
        },
        petals: ['#F1D5AB', '#8C6C57', '#5A4335'],
        sectionDivider: 'linear-gradient(90deg, transparent 5%, rgba(182, 155, 123, 0.3) 30%, rgba(241, 213, 171, 0.6) 50%, rgba(182, 155, 123, 0.3) 70%, transparent 95%)',
        musicPulse: 'rgba(241, 213, 171, 0.38)',
        form: { error: '#FF9E9E', success: '#F1D5AB' },
        glass: {
            background: 'rgba(105, 82, 71, 0.88)',
            border: '#B69B7B',
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
    root.style.setProperty('--color-primary-hover', t.primaryHover);
    root.style.setProperty('--color-on-primary', t.onPrimary);
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

    root.style.setProperty('--input-bg', t.inputBg);
    root.style.setProperty('--input-border', t.inputBorder);
    root.style.setProperty('--input-text', t.inputText);
    root.style.setProperty('--input-placeholder', t.inputPlaceholder);

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
    module.exports = { THEME_PALETTES, getActivePalette, applyThemeColors };
}

// Giữ tương thích code cũ dùng THEME_COLORS.petals
const THEME_COLORS = {
    get petals() { return getActivePalette().petals; },
};
