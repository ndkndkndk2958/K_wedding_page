function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Lấy tiêu đề cột hiện tại
    var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    
    // Nếu sheet trống, tự động tạo tiêu đề từ keys của data
    if (sheet.getLastRow() === 0) {
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
      return data[header] !== undefined ? data[header] : "";
    });
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
