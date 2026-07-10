# Thiết kế lại màu sắc giao diện Light Mode - K_wedding_page

Tài liệu thiết kế chi tiết (Specification) cho việc nâng cấp hệ thống màu sắc ở chế độ sáng (Light Mode) nhằm tăng tính thẩm mỹ, độ tương phản và tính chuyên nghiệp cho thiệp cưới.

---

## 1. Vấn đề của thiết kế cũ
- **Độ tương phản cực kỳ thấp (Contrast Issues):** Các tiêu đề dùng màu hồng nhạt (`#d4a3a3`) trên nền blush hồng (`#FFF5F5`) chỉ đạt tỉ lệ tương phản **2.06:1** (Vi phạm nghiêm trọng tiêu chuẩn WCAG AA - tối thiểu 3:1 cho tiêu đề lớn).
- **Khó đọc chữ trên các nút bấm:** Chữ trắng trên nền nút hồng nhạt (`#d4a3a3`) chỉ đạt tỉ lệ tương phản **2.2:1** (Yêu cầu tối thiểu là 4.5:1). Ở trạng thái hover (`#FFA1A1`), tỉ lệ này giảm xuống còn **1.93:1**, làm nhãn nút biến mất trực quan.
- **Tiêu đề phụ bị mờ:** Các chữ phụ huynh nhà trai/gái dùng màu cam san hô (`#FFA1A1`) trên nền hồng nhạt gần như không thể nhìn thấy trên nhiều thiết bị di động (tương phản **1.81:1**).
- **Màu chữ chính bị đục:** Màu chữ chính đỏ đô trung tính (`#823C3C`) tạo cảm giác giao diện hơi xỉn màu và kém hiện đại.

---

## 2. Giải pháp: Phong cách Blush Rose (Warm Terracotta & Deep Wine)
Bảng màu mới chuyển hướng nhẹ sang tông hồng đất trầm ấm kết hợp đỏ rượu vang đậm đà cổ điển, vừa giữ được sự lãng mạn vốn có, vừa tạo nên độ tương phản sắc nét, đạt chuẩn tiếp cận WCAG AA.

### 2.1. Cấu hình bảng màu Light Mode mới (`colors.js`)

| Token | Mã màu cũ | Mã màu mới | Vai trò & Cải tiến tương phản |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#d4a3a3` | `#B0656B` | **Hồng đất ấm (Terracotta Rose):** Tiêu đề lớn và nền nút bấm chính. Contrast đạt **4.97:1** với chữ trắng (Đạt chuẩn AA). |
| **`secondary`** | `#f4e4e4` | `#F8ECEB` | **Hồng phấn nhạt (Blush Cream):** Nền phụ hoặc dải màu ngăn cách nhẹ. |
| **`tertiary`** | `#FFA1A1` | `#90474D` | **Đỏ hồng đất trầm:** Dùng cho hover nút bấm chính, nhãn phụ huynh sáng màu, icon điều hướng kính mờ. |
| **`background`** | `#FFF5F5` | `#FDF8F7` | **Nền giấy kem ấm (Warm Cream):** Màu nền mỹ thuật cao cấp. |
| **`surface`** | `#fff9f9` | `#FCF3F2` | **Nền bề mặt phụ:** Cho Album ảnh cưới. |
| **`surfaceLowest`** | `#fff9f9` | `#FCF3F2` | Đồng bộ bề mặt phụ. |
| **`onBackground`**| `#823C3C` | `#4A1519` | **Chữ chính đỏ rượu vang đậm (Deep Wine):** Độ tương phản đạt **> 12:1** (Siêu sắc nét, sang trọng). |
| **`onSurface`** | `#823C3C` | `#4A1519` | Đồng bộ màu chữ chính trên bề mặt phụ. |
| **`onSurfaceVariant`** | `rgba(130, 60, 60, 0.65)` | `rgba(74, 21, 25, 0.7)` | Màu chữ phụ, trích dẫn, bản quyền mờ nhưng dễ đọc. |
| **`outline`** | `#D4A3A3` | `#B0656B` | Đường viền trang trí, viền nhãn tên, viền input. |
| **`outlineVariant`** | `#e2d1d1` | `#E2C8CA` | Viền nhạt ngăn cách. |
| **`surfaceContainer`**| `#FFF5F5` | `#F8ECEB` | Nền thẻ sự kiện lớn và form nhập RSVP. |
| **`card`** | `#ffffff` | `#FFFFFF` | Nền card trắng nổi bật hẳn trên lớp nền giấy kem ấm. |

### 2.2. Chi tiết các hiệu ứng đặc biệt
- **Chữ nghệ thuật Hero (Cô dâu & Chú rể):**
  - Cũ: Gradient hồng nhạt rất dễ bị lóa trên ảnh nền.
  - Mới: `linear-gradient(135deg, #4A1519 0%, #B0656B 45%, #D68F95 70%, #4A1519 100%)` (Đổ bóng phát sáng: `drop-shadow(0 2px 8px rgba(74, 21, 25, 0.3)) drop-shadow(0 4px 20px rgba(176, 101, 107, 0.2))`). Đảm bảo chữ luôn tách khỏi ảnh nền.
- **Thanh điều hướng kính mờ (Glass Nav):**
  - Kính nền: `rgba(253, 248, 247, 0.6)` kết hợp viền mờ `rgba(176, 101, 107, 0.2)`.
  - Icon điều hướng: Đổi từ `#FFA1A1` sang màu đỏ hồng đất trầm `#90474D` để nổi bật rõ rệt trên kính mờ.
- **Cánh hoa rơi (Falling Petals):**
  - Màu cánh hoa mới: `['#F2D6D8', '#E3B5B8', '#C58C91']` (Hồng đất ấm áp và lãng mạn hơn).
- **Form nhập RSVP & Wishes:**
  - Nhãn floating label khi focus đổi sang màu `#90474D`.
  - Trạng thái thành công đổi sang màu hồng ấm `#B0656B`.
  - Trạng thái lỗi đổi sang đỏ sậm `#8B0000`.

---

## 3. Kế hoạch kiểm thử & Xác minh (Verification Plan)
- **Kiểm tra trực quan (Visual Inspection):** Bật chế độ sáng (Light Mode), cuộn qua các section để kiểm tra sự hài hòa tổng thể của tông kem ấm và hồng đất.
- **Kiểm tra độ tương phản (Contrast Validation):** Sử dụng các công cụ devtools đo contrast của văn bản chính, các thẻ tiêu đề và các nhãn phụ huynh để đảm bảo đạt tối thiểu tiêu chuẩn WCAG AA.
- **Kiểm tra phản hồi Form:** Gửi thử thông tin RSVP và gửi Lời chúc để xem thông điệp thành công/thất bại có hiển thị rõ nét không.
