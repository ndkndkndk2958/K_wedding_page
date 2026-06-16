// ============================================================
// MẪU CẤU HÌNH — Sao chép thành config.js và chỉnh sửa
// ============================================================
// Phần email/turnstile: xem worker/README.md để deploy Worker + Turnstile.
// Secret (accessKey, email nhận) KHÔNG đặt ở đây — chỉ trong Cloudflare Worker.

const WEDDING_CONFIG = {
    couple: {
        groom: { name: 'Tên chú rể', father: 'Tên bố', mother: 'Tên mẹ' },
        bride: { name: 'Tên cô dâu', father: 'Tên bố', mother: 'Tên mẹ' },
    },
    wedding: {
        dateDisplay: '20 . 04 . 2027',
        invitationText: 'Trân trọng kính mời bạn đến chung vui cùng chúng tôi trong ngày trọng đại này.',
    },
    event: {
        title: 'Tiệc Chúc Mừng',
        time: '06:00 PM',
        dateText: 'Ngày 20 Tháng 04 Năm 2027',
        venueName: 'Tên địa điểm',
        venueAddress: 'Địa chỉ',
        mapsUrl: 'https://maps.google.com',
    },
    rsvp: {
        deadlineText: 'Vui lòng phản hồi trước ngày 10/04/2027',
    },
    footer: {
        names: 'Tên chú rể & Tên cô dâu',
        message: 'Cảm ơn bạn đã là một phần trong câu chuyện tình yêu của chúng tôi.',
        copyright: '© 2027 Tên cặp đôi. Made with love.',
    },
    images: {
        header: [],
        groom: '',
        bride: '',
        gallery: [],
    },
    music: {
        src: 'assets/wedding-music.mp3',
        volume: 0.4,
        autoplay: true,
    },
    email: {
        endpoint: 'https://wedding-mail.<account>.workers.dev/send',
    },
    turnstile: {
        siteKey: '0x...',
    },
};
