/**
 * INFINIX '26 HACKATHON — GOOGLE APPS SCRIPT AUTOMATIC MIRROR SYNC (ROBUST v4)
 * 
 * SPREADSHEET ID CONFIGURATION:
 * If your Apps Script was created directly at script.google.com (Standalone Script),
 * enter your Google Sheet ID below (the long ID in your sheet's browser URL between /d/ and /edit).
 * Example: https://docs.google.com/spreadsheets/d/1ABC123xyz/edit -> SPREADSHEET_ID = "1ABC123xyz";
 */

var SPREADSHEET_ID = "1I60wEQUYeDtQQUy-nxF8mSjkzZqvkrUrE848ZZ-_D8E"; // Standalone Google Sheet ID
var SHEET_NAME = "Registrations";

var HEADERS = [
  "Registration ID",
  "Team Name",
  "College Type",
  "College Name",
  "Team Leader Name",
  "Leader Email",
  "Leader Phone",
  "Team Size",
  "Member 2 Name",
  "Member 2 Email",
  "Member 2 College & Dept",
  "Member 3 Name",
  "Member 3 Email",
  "Member 3 College & Dept",
  "Member 4 Name",
  "Member 4 Email",
  "Member 4 College & Dept",
  "Member 5 Name",
  "Member 5 Email",
  "Member 5 College & Dept",
  "Total Fee",
  "UPI Transaction ID",
  "Payment Screenshot URL",
  "Payment Status",
  "Registration Status",
  "Verified By",
  "Verification Time",
  "Created At",
  "Updated At"
];

function doGet(e) {
  var output = {
    status: "active",
    message: "INFINIX '26 Google Apps Script Sync Web App is Live!",
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var output = { success: false, message: "" };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      output.message = "No POST payload received.";
      return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
    }

    var contents;
    try {
      contents = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      contents = e.parameter || {};
    }

    var action = (contents.action || "").toLowerCase();
    if (!action && (contents.teamId || contents.team_id || contents.registrationId || contents.data)) {
      action = "create";
    }
    var payloadData = contents.data || contents;
    var regId = contents.registrationId || payloadData.registrationId || payloadData.teamId || payloadData.team_id || "";
    var targetSpreadsheetId = contents.spreadsheetId || payloadData.spreadsheetId || SPREADSHEET_ID;

    var sheet = getOrCreateSheet(targetSpreadsheetId);
    ensureHeaders(sheet);

    if (action === "attendance") {
      output = handleAttendance(targetSpreadsheetId, contents);
    } else if (action === "create" || action === "update" || action === "approve") {
      output = handleUpsert(sheet, contents, payloadData, regId, action);
    } else if (action === "delete") {
      output = handleDelete(sheet, regId);
    } else {
      output = { success: false, message: "Unknown action: " + action };
    }
  } catch (err) {
    output = {
      success: false,
      error: err.toString(),
      message: "Apps Script exception: " + err.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function handleAttendance(targetSpreadsheetId, contents) {
  var ss = getOrCreateSheet(targetSpreadsheetId).getParent();
  var sheet = ss.getSheetByName("Attendance");
  var headers = ["Check-In Time (IST)", "Team ID", "Team Name", "Leader Name", "Contact Phone", "College", "Checked In By"];

  if (!sheet) {
    sheet = ss.insertSheet("Attendance");
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#00D9FF");
  }

  var data = contents.data || contents;
  var istTime = data.timestamp || data.checkInTime || formatToIST(new Date());
  var teamId = data.teamId || data.team_id || contents.teamId || "";
  var teamName = data.teamName || data.team_name || "";
  var leaderName = data.leaderName || data.leader_name || "";
  var leaderPhone = data.leaderPhone || data.leader_phone || "";
  var college = data.college || "";
  var checkedInBy = data.checkedInBy || contents.checkedInBy || "Admin";

  var rowData = [
    istTime,
    teamId,
    teamName,
    leaderName,
    leaderPhone,
    college,
    checkedInBy
  ];

  var targetRow = findFirstAvailableRow(sheet);
  sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

  return { success: true, action: "attendance_logged", teamId: teamId, row: targetRow };
}

function formatToIST(val) {
  try {
    var d = val ? new Date(val) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return Utilities.formatDate(d, "Asia/Kolkata", "dd-MMM-yyyy hh:mm:ss a") + " IST";
  } catch (e) {
    return Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy hh:mm:ss a") + " IST";
  }
}

function handleUpsert(sheet, contents, data, regId, action) {
  if (!data) return { success: false, message: "No data payload provided" };
  
  var id = regId || data.registrationId || data.teamId || data.team_id || "";
  if (!id) return { success: false, message: "Missing Registration ID" };

  var rowIdx = findRowIndexByRegId(sheet, id);
  var rowData = formatTeamRow(data, id, contents, action);

  if (rowIdx > 1) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, action: "updated", registrationId: id, row: rowIdx };
  } else {
    var targetRow = findFirstAvailableRow(sheet);
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, action: "created", registrationId: id, row: targetRow };
  }
}

function findFirstAvailableRow(sheet) {
  try {
    var values = sheet.getRange("A:A").getValues();
    for (var i = 1; i < values.length; i++) {
      if (!values[i][0] || String(values[i][0]).trim() === "") {
        return i + 1;
      }
    }
    return values.length + 1;
  } catch (e) {
    return sheet.getLastRow() + 1;
  }
}

function handleDelete(sheet, regId) {
  if (!regId) return { success: false, message: "Missing Registration ID for deletion" };

  var rowIdx = findRowIndexByRegId(sheet, regId);
  if (rowIdx > 1) {
    sheet.getRange(rowIdx, 21).setValue("[DELETED]");
    sheet.getRange(rowIdx, 25).setValue(formatToIST(new Date()));
    return { success: true, action: "deleted", registrationId: regId, row: rowIdx };
  }

  return { success: true, message: "ID " + regId + " not found in sheet; nothing deleted." };
}

function findRowIndexByRegId(sheet, regId) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return -1;

    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var target = String(regId).trim().toUpperCase();

    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] && String(ids[i][0]).trim().toUpperCase() === target) {
        return i + 2;
      }
    }
  } catch (err) {
    Logger.log("findRowIndexByRegId notice: " + err);
  }
  return -1;
}

function formatTeamRow(data, overrideId, contents, action) {
  data = data || {};
  var regId = overrideId || data.registrationId || data.teamId || data.team_id || "";
  var teamName = data.teamName || data.team_name || "";
  var rawCollege = String(data.college || "");
  var colLower = rawCollege.toLowerCase();
  var isRamco = colLower.indexOf("ramco") !== -1 || colLower.indexOf("rit") !== -1;
  var collegeType = isRamco ? "Internal (Ramco)" : "External College";
  var college = isRamco ? "Ramco Institute of Technology" : rawCollege;
  var leaderName = data.leaderName || data.leader_name || "";
  var leaderEmail = data.leaderEmail || data.leader_email || "";
  var leaderPhone = data.leaderPhone || data.leader_phone || "";

  var members = [];
  if (Array.isArray(data.members)) {
    members = data.members;
  } else if (typeof data.members === "string") {
    try { members = JSON.parse(data.members); } catch (e) { members = []; }
  }

  var teamSize = data.teamSize || data.team_size || (members.length + 1);

  var getMemCollege = function(m) {
    if (!m) return "";
    var col = m.college || college || "";
    var dept = m.department || data.department || "";
    return col + (dept ? " (" + dept + ")" : "");
  };

  var m2Name = members[0] ? (members[0].name || members[0].memberName || "") : "";
  var m2Email = members[0] ? (members[0].email || members[0].memberEmail || "") : "";
  var m2College = getMemCollege(members[0]);

  var m3Name = members[1] ? (members[1].name || members[1].memberName || "") : "";
  var m3Email = members[1] ? (members[1].email || members[1].memberEmail || "") : "";
  var m3College = getMemCollege(members[1]);

  var m4Name = members[2] ? (members[2].name || members[2].memberName || "") : "";
  var m4Email = members[2] ? (members[2].email || members[2].memberEmail || "") : "";
  var m4College = getMemCollege(members[2]);

  var m5Name = members[3] ? (members[3].name || members[3].memberName || "") : "";
  var m5Email = members[3] ? (members[3].email || members[3].memberEmail || "") : "";
  var m5College = getMemCollege(members[3]);

  var totalFee = data.paymentAmount || data.payment_amount || (teamSize * (isRamco ? 200 : 350));
  var upiTxId = data.upiTransactionId || data.upi_transaction_id || "";
  var rawPaymentProof = data.paymentProofUrl || data.payment_proof_url || "";
  var paymentProofUrl = rawPaymentProof;

  if (rawPaymentProof && (rawPaymentProof.indexOf("http://") === 0 || rawPaymentProof.indexOf("https://") === 0)) {
    paymentProofUrl = '=HYPERLINK("' + rawPaymentProof + '", "📸 View Slip")';
  }

  var paymentStatus = data.paymentStatus || data.payment_status || (contents ? contents.paymentStatus : "") || "Pending Verification";
  var regStatus = data.registrationStatus || data.registration_status || (contents ? contents.registrationStatus : "") || "Pending Payment Verification";

  if (action === "approve") {
    paymentStatus = contents.paymentStatus || "Paid";
    regStatus = contents.registrationStatus || "Approved";
  }

  var nowIST = formatToIST(new Date());
  var createdAt = formatToIST(data.createdAt || data.created_at);
  var updatedAt = nowIST;

  var isVerified = regStatus === "Verified" || regStatus === "Approved" || paymentStatus === "Verified" || paymentStatus === "Paid";
  var verifier = isVerified ? (data.checkedInBy || (contents ? contents.verifiedBy : "") || "Admin") : "N/A";
  var verifTime = isVerified ? formatToIST(data.checkInTime || (contents ? contents.verificationTime : "") || new Date()) : "N/A";

  return [
    regId,
    teamName,
    collegeType,
    college,
    leaderName,
    leaderEmail,
    leaderPhone,
    teamSize,
    m2Name,
    m2Email,
    m2College,
    m3Name,
    m3Email,
    m3College,
    m4Name,
    m4Email,
    m4College,
    m5Name,
    m5Email,
    m5College,
    totalFee,
    upiTxId,
    paymentProofUrl,
    paymentStatus,
    regStatus,
    verifier,
    verifTime,
    createdAt,
    updatedAt
  ];
}

function getOrCreateSheet(targetSpreadsheetId) {
  var ss = null;
  var idToUse = targetSpreadsheetId || SPREADSHEET_ID;

  if (idToUse && String(idToUse).trim() !== "") {
    try {
      ss = SpreadsheetApp.openById(String(idToUse).trim());
    } catch (e) {
      Logger.log("SpreadsheetApp.openById error: " + e);
    }
  }

  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      Logger.log("SpreadsheetApp.getActiveSpreadsheet error: " + e);
    }
  }

  if (!ss) {
    throw new Error("⚠️ Please paste your Google Sheet ID in line 10: var SPREADSHEET_ID = 'your_sheet_id_here';");
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      sheet = sheets[0];
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (!sheet) {
    sheet = getOrCreateSheet(SPREADSHEET_ID);
  }
  if (!sheet) return;
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#00D9FF");
}

/**
 * Run this function directly inside Google Apps Script Editor to instantly set Row 1 Headers!
 */
function setupSheetHeaders() {
  var sheet = getOrCreateSheet(SPREADSHEET_ID);
  if (sheet) {
    ensureHeaders(sheet);
    Logger.log("✅ Row 1 Headers successfully updated to 29 Columns!");
  }
}
