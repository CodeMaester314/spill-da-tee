// ══════════════════════════════════════════════════════════════
//  SPILL DA TEE STUDIO — Google Apps Script Order Logger
//  Target sheet: https://docs.google.com/spreadsheets/d/1U1lkq86zmkB7dta_AqKtAXQv-GH_y3c_v3ZkhyoVEAI
//
//  SETUP (one-time, ~3 minutes):
//  1. Go to https://script.google.com → click "New project"
//  2. Delete the default code, paste everything below
//  3. Click Deploy → New deployment
//     - Type: Web app
//     - Execute as: Me
//     - Who has access: Anyone
//  4. Click Deploy → copy the /exec URL
//  5. Paste the URL into the APPS_SCRIPT_URL constant in your HTML file
// ══════════════════════════════════════════════════════════════

const ORDERS_SHEET_ID = '1U1lkq86zmkB7dta_AqKtAXQv-GH_y3c_v3ZkhyoVEAI';

/**
 * Handles POST requests from the website checkout form.
 * Appends a new row to the active sheet with order details.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const spreadsheet = SpreadsheetApp.openById(ORDERS_SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();

    // Add headers on first run if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Customer Name',
        'Address',
        'Contact',
        'Order Details',
        'Total',
        'Status'
      ]);
      // Bold the header row
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    // Append the order row
    sheet.appendRow([
      new Date(),                           // Timestamp
      data.name    || '',                   // Customer Name
      data.address || '',                   // Address
      data.contact || '',                   // Contact
      data.orderDetails || '',              // Order Details (one line per SKU)
      '₱' + Number(data.total || 0).toLocaleString(), // Total
      'Pending'                             // Status (manual update later)
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 7);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Order logged.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Health check — visit the /exec URL in a browser to confirm it's live.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Spill Da Tee Studio order logger is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
