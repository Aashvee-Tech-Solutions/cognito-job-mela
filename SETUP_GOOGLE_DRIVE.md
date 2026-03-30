# Google Drive & Google Sheets Setup for Resume Storage

This guide will help you set up the form submission backend to store form data in Google Sheets and resume files in Google Drive.

## Quick Summary

The form submission now:
1. ✅ Sends all form data to Google Sheets via Apps Script
2. ✅ Uploads resume files to a Google Drive folder
3. ✅ Returns a shareable Google Drive link to the resume

## Prerequisites

- Google Account
- A Google Sheets spreadsheet (for storing form data)
- A Google Drive folder (for storing resumes)
- Vercel project deployed (or local testing with environment variables)

---

## Part 1: Google Sheets Setup (Existing)

If you already have this working, skip to Part 2.

### 1.1 Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Cognito Job Mela Applications"
3. Add column headers for all form fields:
   - Full Name, Email, Phone, Location, Current Role, Company Name, Years of Experience, Education, Desired Roles, Skills, Available From, Visa Status, About You, Submitted At

### 1.2 Create Google Apps Script

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. Replace the code with the following:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Build row data matching headers
    const row = headers.map(header => data[header] || '');
    
    // Add the new row
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy → New deployment**
5. Select type: **Web app**
6. Execute as: Your Google Account
7. Allow access to: **Anyone**
8. Copy the deployment URL (looks like: `https://script.google.com/macros/s/YOUR_ID/exec`)
9. Save this URL - you'll need it for `VITE_SCRIPT_URL`

---

## Part 2: Google Drive Setup (for Resume Files)

### 2.1 Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services → Credentials**
4. Click **+ Create Credentials → Service Account**
5. Fill in details:
   - Service account name: `cognito-job-mela`
   - Service account ID: auto-filled (leave as is)
   - Service account description: `Resume file uploads`
6. Click **Create and Continue**
7. Skip the optional grant roles step and click **Done**

### 2.2 Create an API Key

1. Go to **APIs & Services → Credentials**
2. Under "Service Accounts", click the email of the service account you just created
3. Go to **Keys → Add Key → Create new key**
4. Choose **JSON** format
5. A JSON file will download - keep this safe
6. From the JSON file, copy the entire `private_key` value (the long string starting with `-----BEGIN`)
7. **Important:** This is your `GOOGLE_DRIVE_API_KEY`

### 2.3 Enable Google Drive API

1. Go to **APIs & Services → Library**
2. Search for "Google Drive API"
3. Click on it and click **Enable**

### 2.4 Create a Folder for Resumes

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder: **Right-click → New folder → Name it "Cognito Job Mela Resumes"**
3. Right-click the folder → **Share**
4. Share it with the service account email (find it in your Google Cloud Console under the service account)
5. Grant **Editor** permissions
6. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/{FOLDER_ID}`
   - Extract just the `{FOLDER_ID}` part
7. This is your `GOOGLE_DRIVE_FOLDER_ID`

---

## Part 3: Environment Variables Setup

### For Local Development

Create a `.env.local` file in your project root (same level as `package.json`):

```env
# Google Apps Script URL for form data (from Part 1)
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Google Drive API Key (from Part 2.2 - the private_key from JSON)
GOOGLE_DRIVE_API_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n

# Google Drive Folder ID (from Part 2.4)
GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID_HERE
```

### For Vercel Production

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add three new variables:

| Name | Value |
|------|-------|
| `VITE_SCRIPT_URL` | Your Apps Script URL from Part 1.2 |
| `GOOGLE_DRIVE_API_KEY` | Your private key from Part 2.2 |
| `GOOGLE_DRIVE_FOLDER_ID` | Your folder ID from Part 2.4 |

3. Deploy your project

---

## Testing Your Setup

1. Start your dev server: `npm run dev`
2. Fill out the form completely with all required fields
3. Upload a PDF or Word document as your resume
4. Click **Submit**
5. Check:
   - ✅ Your Google Sheet should have a new row with form data
   - ✅ Your "Cognito Job Mela Resumes" folder should have the uploaded file
   - ✅ The success message should show a Google Drive link

---

## Troubleshooting

### Resume not uploading to Google Drive

**Error in console:** `Missing required fields` or `Drive upload error`

**Solutions:**
- Verify `GOOGLE_DRIVE_API_KEY` and `GOOGLE_DRIVE_FOLDER_ID` are set in environment variables
- Check that the service account has **Editor** permissions on the resume folder
- Check the browser console for detailed error messages
- Ensure the file is not larger than 10MB

### Form data not appearing in Google Sheets

**Error in console:** Blank response or timeout

**Solutions:**
- Verify your `VITE_SCRIPT_URL` is correct and ends with `/exec`
- Test the URL directly in your browser - it should return a 405 error (expected for GET)
- Make sure your Apps Script is deployed as a "Web app"
- Check that the Apps Script has permission to edit your Google Sheet

### "Failed to submit form" error

**Solutions:**
- Open browser Developer Tools (F12) → Console tab
- Look for specific error messages
- Try with just the form (no resume) to isolate the issue
- Check that `fullName` and `email` fields are filled

### "Private Key Invalid" error

**Solution:**
- The private key from the service account JSON should include the `-----BEGIN` and `-----END` lines
- Make sure the entire key is copied, including newlines (`\n`)
- In Vercel environment variables, paste the entire key as-is

---

## File Type and Size Limits

- **Supported formats:** PDF, Word (.doc, .docx), Plain text (.txt)
- **Maximum file size:** 10MB
- **File naming:** `{FullName}_Resume.{ext}`

---

## Security Best Practices

- ⚠️ **Never commit `.env.local` to Git** - use `.gitignore` (it should already be there)
- ⚠️ **Never share your `GOOGLE_DRIVE_API_KEY`** - it's like a password
- ⚠️ **Use the service account key** - not your personal Google account credentials
- ✅ **Regenerate the API key** if you accidentally commit it to GitHub
- ✅ **Review Drive permissions** - only share the resume folder with necessary people

---

## Need Help?

- **Google APIs Issues:** [Google Cloud Support](https://cloud.google.com/support)
- **Apps Script Issues:** [Apps Script Documentation](https://developers.google.com/apps-script)
- **Vercel Issues:** [Vercel Support](https://vercel.com/help)
