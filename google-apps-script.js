/**
 * COGNITO JOB MELA - Google Apps Script Backend
 * ==============================================
 * Paste this entire file into Google Apps Script (script.google.com),
 * then deploy it as a Web App (see README.md for steps).
 *
 * SETUP:
 * 1. Open your Google Sheet and copy the Sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/  <-- SHEET_ID --> /edit
 * 2. Paste that ID into SHEET_ID below.
 * 3. Deploy as Web App (Execute as: Me, Who has access: Anyone).
 * 4. Copy the Web App URL and set it as VITE_SCRIPT_URL in Vercel.
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Registrations';

const HEADERS = [
  'Submitted At',
  'Full Name',
  "Father's Name",
  'Date of Birth',
  'Gender',
  'Mobile',
  'Email',
  'Aadhaar',
  'Qualification',
  'Specialization',
  'Year of Passing',
  'Percentage / CGPA',
  'Applying For',
  'Experience Level',
  'Skills',
  'Preferred Location',
  'Job Mela City',
  'Resume File Name',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist yet
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.fullName        || '',
      data.fatherName      || '',
      data.dateOfBirth     || '',
      data.gender          || '',
      data.mobile          || '',
      data.email           || '',
      data.aadhaar         || '',
      data.qualification   || '',
      data.specialization  || '',
      data.yearOfPassing   || '',
      data.percentage      || '',
      data.applyingFor     || '',
      data.experienceLevel || '',
      data.skills          || '',
      data.preferredLocation || '',
      data.jobMelaCity     || '',
      data.resume          || '',
    ]);

    // ---------------------------------------------------------------
    // OPTIONAL: Send a confirmation email to the applicant.
    // Uncomment the block below to enable email notifications.
    // Make sure the Gmail quota is sufficient (100 emails/day free).
    // ---------------------------------------------------------------
    // if (data.email) {
    //   MailApp.sendEmail({
    //     to: data.email,
    //     subject: 'Registration Confirmed – Cognito Mega Job Mela 2026',
    //     body:
    //       `Dear ${data.fullName},\n\n` +
    //       `Thank you for registering for the Cognito Mega Job Mela 2026!\n\n` +
    //       `Your application has been received. Our HR team will review your profile ` +
    //       `and shortlisted candidates will receive an interview invite.\n\n` +
    //       `Keep your mobile (${data.mobile}) and email active for updates.\n\n` +
    //       `Best regards,\nCognito Insights Solutions Pvt Ltd\n` +
    //       `📞 +91 8978246111 | 🌐 www.cognitoinsights.ai`,
    //   });
    // }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health check – visit the Web App URL in a browser to confirm it works
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Cognito Job Mela script is live!' }))
    .setMimeType(ContentService.MimeType.JSON);
}
