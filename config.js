// ============================================================
// CẤU HÌNH THIỆP CƯỚI — Chỉnh sửa tại đây
// ============================================================
const WEDDING_CONFIG = {
    couple: {
        groom: {
            name: 'Đăng Khoa',
            father: 'Văn Đức',
            mother: 'Ánh Nguyệt',
        },
        bride: {
            name: 'Cẩm Nhung',
            father: 'Văn Nghĩa',
            mother: 'Hồng Phượng',
        },
    },
    wedding: {
        dateDisplay: '25 . 04 . 2027',
        invitationText: 'Trân trọng kính mời bạn đến chung vui cùng chúng tôi trong ngày trọng đại này.',
    },
    event: {
        title: 'Tiệc Chúc Mừng',
        time: '06:00 PM',
        dateText: 'Ngày 25 Tháng 04 Năm 2027',
        venueName: 'Wedding Palace - Sảnh Diamond',
        venueAddress: 'Quận 1, TP. Hồ Chí Minh',
        mapsUrl: 'https://maps.google.com',
    },
    rsvp: {
        deadlineText: 'Vui lòng phản hồi trước ngày 20/04/2027',
    },
    footer: {
        names: 'Đăng Khoa & Cẩm Nhung',
        message: 'Cảm ơn bạn đã là một phần trong câu chuyện tình yêu của chúng tôi.',
        copyright: '© 2027 Đăng Khoa & Cẩm Nhung. Made with love.',
    },
    images: {
        // Ảnh slideshow banner (header)
        header: [
            'https://lh3.googleusercontent.com/aida/AP1WRLv_rDcNvozsB_BxMJ6nDdh18TfAwWwk09foggCY-rpc4enmRIE0moWrLV62C_xno7NdhII2E0nQpo5FsZL1QGThev5yAi22H8GVaMjJwzxbhRkhte4M-7ue3cBFC9qxbGf-bwOI8O38g-9OhL0FLvT4CepndRSHo_asETxBuuGE7tfkIm48mzejqlN-cxqRgviv88cAr4K8MrL28nJFEm5hTzJ2DZ7WRVYtAk7CGytfgrNBlHyRBod6VuY',
            'https://lh3.googleusercontent.com/aida/AP1WRLu-gSc3lsRV1dpf5kcHt_jD15aXMcaVSfYkke6PfyvoV1J-PbHOu3OoDntPq0QgqVtvmMRs6R4WhSylkmKGzkrdun9GxwHflhUo6f3FlkuQktX50XlXlm1EEw-2haYUS8rTMbMNb5jJkd6tjWGMkypll3Igu6sAS8KTgMTRAupvH3cZz4fBHSgHlNesJSk2GOQWCwXo4KwVx2ZIbKihAcbHv3nODtzSg5yu6GvBbEvd7WTuEXCHuNjpFVk',
            'https://lh3.googleusercontent.com/aida/AP1WRLuC9m1yOiANB1ITIVRbkl__jkke8DcS3sdiBw4aWVNKKPw0vLPfSR5SW76aDl7IACN2rgGEgvTGJk1XxT3LeNRWyysHL0C3fJDEafWTMK7AKbEI9qqlFqvyt3SVG7aZn3XWFmTbAb-mpdgS4dzzMXRo809PLJsQ9r_yxYCkZYyju3379eBtqBqqbfdL3njFUM_818k7EVjEv95Wp3Sw3FCk2pOtV2v0Bm2To8a1-1oUc-o8Vwq2chbmKA',
            'https://lh3.googleusercontent.com/aida/AP1WRLv_rDcNvozsB_BxMJ6nDdh18TfAwWwk09foggCY-rpc4enmRIE0moWrLV62C_xno7NdhII2E0nQpo5FsZL1QGThev5yAi22H8GVaMjJwzxbhRkhte4M-7ue3cBFC9qxbGf-bwOI8O38g-9OhL0FLvT4CepndRSHo_asETxBuuGE7tfkIm48mzejqlN-cxqRgviv88cAr4K8MrL28nJFEm5hTzJ2DZ7WRVYtAk7CGytfgrNBlHyRBod6VuY',
            'https://lh3.googleusercontent.com/aida/AP1WRLu-gSc3lsRV1dpf5kcHt_jD15aXMcaVSfYkke6PfyvoV1J-PbHOu3OoDntPq0QgqVtvmMRs6R4WhSylkmKGzkrdun9GxwHflhUo6f3FlkuQktX50XlXlm1EEw-2haYUS8rTMbMNb5jJkd6tjWGMkypll3Igu6sAS8KTgMTRAupvH3cZz4fBHSgHlNesJSk2GOQWCwXo4KwVx2ZIbKihAcbHv3nODtzSg5yu6GvBbEvd7WTuEXCHuNjpFVk',
            'https://lh3.googleusercontent.com/aida/AP1WRLuC9m1yOiANB1ITIVRbkl__jkke8DcS3sdiBw4aWVNKKPw0vLPfSR5SW76aDl7IACN2rgGEgvTGJk1XxT3LeNRWyysHL0C3fJDEafWTMK7AKbEI9qqlFqvyt3SVG7aZn3XWFmTbAb-mpdgS4dzzMXRo809PLJsQ9r_yxYCkZYyju3379eBtqBqqbfdL3njFUM_818k7EVjEv95Wp3Sw3FCk2pOtV2v0Bm2To8a1-1oUc-o8Vwq2chbmKA',
        ],
        // Ảnh chân dung cô dâu & chú rể
        groom: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1qHvPtpS5U37Mq263QzHDW3hC1gnUckVn37HcWP-3-ZhCoNwnJCIKFsvY0Nszmb0JWFBl2AzMs9FaW81aJJ0pZm86OCkAuHA9AZjhEzXRS38XFnzc02mcyiQ5EKX-63KOHQc8WAVrU5R4CERXur4aRqUs91o1K7-Y7HcbSZyOm4MUkGhPsf5Hz9ptOORNXRC7PjhotV-NMy6cP1yBAXUfkrBVvosrL82v7HsOzo4Tyw8Q_1cr9k3lKBnag--70JCl8RVvDh7NifU',
        bride: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLE4WPGCAD6ZcUhd4GU6P8SFWgubPHrgFupN2u0MNgNYxsCxsnjHQj0412HEQpAgRXq5L2T24zYBMWuF8fEWvCabYH21Yzu6RqemqVmrCDV8VQi23bxBwSTvAPxIts283DztXVg_WVFYfdDtaTmreghkyHvu5WtSMydqQrsLs0zYm3WOq-Ck40CI0pMXgLcSLHaQgISO1IkZP-38omMppyK_FlGQSoGKra8HzRaMadSKKeF0Udfny9-WXsWf1Jb0hjxl1XpUX1I9w',
        // Album gallery — thêm URL ảnh (hiển thị lưới 2 cột mobile / 3 cột tablet+)
        gallery: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAr7HhXtbvsdZrznWPINk24223SjSAVo69piwJ61lZZx0JYGVMHUSbzlAaxv68T9j9A29OJc4Lv5Grn43643I-Suj76VNcGXnvnkmtVcLiWqjdP9vPYeceheLu_CBmy4dznoZnFwmQ0pSrIy3BUbZP6bKFLc7pt5iPVObCTW3Jk81KxWmYEahmDuvNR4LHpccjyKpS4Xt4dlodqkv9Jb5Gnc0T_GlxcVfTgxwW0-W1-0m3hf0JUfL2GPn2WO8bm3SJ03Tc_x5xky6I',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA1na3YtCbXhfShYsdh-x6g698S_UBY1HuecCjTB1J5N_W0TL3XundJeU46Z6G5EFbcwCcCkL6AX8cOZcAkCjD85J4rRTnBenJR67JtG-iCT9Bm5zPvuvUyEjMtI-2CNDnB_DeYbo6Vh8dLxeK3qel7rgeSAhAuRUjdNJfmwrm8xwn6zJTWV4uXUlymmOe7t5XGhyXef0HFQiLaCNPK1CA7bCQaVsttgdg0tMWvEu4Ax2Iz9Wcb71wcToxkh_e5NOwOM1knirH0kUI',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAnTsjgWVFxewxtFrXhwdYhQothNLBHYuzwVomF08ReyS3xbthWaGnGRkB0PllcCaqtuW5iAOdFL-hNC3K-Y646pHrUeiwO4JIV2_3XJbLjZLQU2koGCJK55LF2ZN02ckvPPC2s_C-oMuhbZjzi3EJ6G5wBmUzQ_ku2sxUfk8SEkjEGTYWSd27CpS1TTgW5hwq97SIRA5QWhzUysFPhdfAYIMJa3nbDKR2FFhwMAcvQodtr6P9RVfsyUjE5KQdP42UW8Aavuvb2rcM',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhNx-olKiek-26zh9ZqpAbD5OMlj1HiAe6SUu0tW5syymbYP1WsqY0A4NpAyiRwh6oQWu03-jo5VzrLEkZ2Idk22FxyFZ1hs0kaIsR30Nr_Q_IHft3ui8XHHT_9bH73UULWzMm4AwWufqy2rPctoVt1MiB2qV_d-cKnF_rfIKqCeKWfsYIskrufrGk9yxR2X-xbdKzEu6_xnNduYFgCirdQoib19O5WG_xg3RYEfVGezLIWZKn1U7rcDfomt3zomaffUGb21l0D8',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAnTsjgWVFxewxtFrXhwdYhQothNLBHYuzwVomF08ReyS3xbthWaGnGRkB0PllcCaqtuW5iAOdFL-hNC3K-Y646pHrUeiwO4JIV2_3XJbLjZLQU2koGCJK55LF2ZN02ckvPPC2s_C-oMuhbZjzi3EJ6G5wBmUzQ_ku2sxUfk8SEkjEGTYWSd27CpS1TTgW5hwq97SIRA5QWhzUysFPhdfAYIMJa3nbDKR2FFhwMAcvQodtr6P9RVfsyUjE5KQdP42UW8Aavuvb2rcM',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhNx-olKiek-26zh9ZqpAbD5OMlj1HiAe6SUu0tW5syymbYP1WsqY0A4NpAyiRwh6oQWu03-jo5VzrLEkZ2Idk22FxyFZ1hs0kaIsR30Nr_Q_IHft3ui8XHHT_9bH73UULWzMm4AwWufqy2rPctoVt1MiB2qV_d-cKnF_rfIKqCeKWfsYIskrufrGk9yxR2X-xbdKzEu6_xnNduYFgCirdQoib19O5WG_xg3RYEfVGezLIWZKn1U7rcDfomt3zomaffUGb21l0D8',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhNx-olKiek-26zh9ZqpAbD5OMlj1HiAe6SUu0tW5syymbYP1WsqY0A4NpAyiRwh6oQWu03-jo5VzrLEkZ2Idk22FxyFZ1hs0kaIsR30Nr_Q_IHft3ui8XHHT_9bH73UULWzMm4AwWufqy2rPctoVt1MiB2qV_d-cKnF_rfIKqCeKWfsYIskrufrGk9yxR2X-xbdKzEu6_xnNduYFgCirdQoib19O5WG_xg3RYEfVGezLIWZKn1U7rcDfomt3zomaffUGb21l0D8',
        ],
    },
    music: {
        // Đặt file nhạc vào thư mục assets/ (ví dụ: assets/wedding-music.mp3)
        src: 'assets/BeautifulInWhite.mp3',
        volume: 0.4,
        autoplay: true,
    },
    email: {
        // Tự chọn endpoint: local → wrangler dev, production → Worker đã deploy
        endpoint: (typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname))
            ? 'http://localhost:8787/send'
            : 'https://wedding-mail.ndkndkndk2958.workers.dev/send',
    },
    turnstile: {
        // Site key công khai từ Cloudflare Turnstile Dashboard
        siteKey: '0x4AAAAAADlq16jn93APeJp8',
    },
};
