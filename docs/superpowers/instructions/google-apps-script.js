// CÁCH DÙNG:
// Triển khai (Deploy) script này làm Web App với:
//   - Thực thi dưới dạng: Tôi (Me)
//   - Ai có quyền truy cập: Mọi người (Anyone)
//
// Lưu ý: Dùng doGet thay vì doPost để tránh lỗi mất body sau redirect của Google Apps Script.
// Worker gửi data qua query param "payload" (JSON encoded).

function doGet(e) {
  try {
    // Đọc payload JSON từ query param
    var payloadStr = e.parameter && e.parameter.payload;
    if (!payloadStr) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Không có dữ liệu.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(payloadStr);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Lấy tiêu đề cột hiện tại
    var lastCol = sheet.getLastColumn();
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    // Nếu sheet trống, tự động tạo tiêu đề từ keys của data
    if (sheet.getLastRow() === 0 || headers.length === 0) {
      headers = Object.keys(data);
      sheet.appendRow(headers);
    }

    // Nếu xuất hiện key mới trong data chưa có ở headers, tự động thêm cột mới
    var keys = Object.keys(data);
    var newKeys = keys.filter(function(key) {
      return headers.indexOf(key) === -1;
    });

    if (newKeys.length > 0) {
      var startCol = headers.length + 1;
      sheet.getRange(1, startCol, 1, newKeys.length).setValues([newKeys]);
      headers = headers.concat(newKeys);
    }

    // Ánh xạ dữ liệu khớp theo cột tiêu đề
    var row = headers.map(function(header) {
      return data[header] !== undefined ? data[header] : '';
    });

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
