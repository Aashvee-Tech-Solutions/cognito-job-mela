# Backend Setup Guide for Cognito Job Mela

This guide will help you set up the backend to properly store form data and resume files.

## Overview

The backend now handles:
1. **Form Data Storage**: Sends form data to Google Sheets via Apps Script
2. **Resume Upload**: Uploads resume files to Google Drive
3. **Error Handling**: Graceful fallbacks if either service fails

## Prerequisites

- Google Account
- Vercel Account (for deployment)
- Google Cloud Project (for Drive API)

## Step 1: Google Sheets & Apps Script Setup (Existing)

If you already have your Google Apps Script set up that sends data to Google Sheets, you can keep using it.

**Make sure you have:**
- Google Sheets spreadsheet with columns for all form fields
- Deployed Apps Script Web App with the spreadsheet data endpoint
- The deployment URL in your `.env` as `VITE_SCRIPT_URL`

## Step 2: Google Drive API Setup (New)

Follow these steps to enable resume file uploads to Google Drive:

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Name it "Cognito Job Mela" and create it
4. Wait for the project to be created

### 2.2 Enable Google Drive API

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and click "Enable"

### 2.3 Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - Service account name: `cognito-job-mela`
   - Description: `For uploading resumes to Google Drive`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 2.4 Create an API Key

1. Go back to "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key and save it (this is your `GOOGLE_DRIVE_API_KEY`)

### 2.5 Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named "Cognito Job Mela Resumes"
3. Right-click on the folder → "Share"
4. Share it with the service account email (found in your Service Account details)
5. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
6. This is your `GOOGLE_DRIVE_FOLDER_ID`

## Step 3: Environment Variables

### Local Development

Create a `.env.local` file in the project root:

```env
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_DRIVE_API_KEY=your_api_key_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:
   - `GOOGLE_DRIVE_API_KEY` - Your Google Drive API Key
   - `GOOGLE_DRIVE_FOLDER_ID` - Your Google Drive Folder ID
   - `VITE_SCRIPT_URL` - Your Apps Script URL (optional, can be in `.env.local`)

## Step 4: Verify Setup

To test that everything works:

1. Start your dev server: `npm run dev`
2. Fill out the form completely
3. Upload a PDF or Word document as your resume
4. Submit the form
5. Check:
   - Your Google Sheets for the form data entry
   - Your Google Drive folder for the uploaded resume file

## API Endpoint

The backend API is available at `/api/submit-form` and handles:

**Request:**
```json
{
  "formData": {
    "fullName": "John Doe",
    "email": "john@example.com",
    ...other form fields
  },
  "resumeBase64": "base64_encoded_file_content",
  "resumeFile": {
    "name": "resume.pdf",
    "type": "application/pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "driveLink": "https://drive.google.com/file/d/FILE_ID/view"
}
```

## Troubleshooting

### Resume not uploading
- Check that the service account has write access to the Drive folder
- Verify the `GOOGLE_DRIVE_API_KEY` and `GOOGLE_DRIVE_FOLDER_ID` are correct
- Check browser console for any error messages

### Form data not appearing in Google Sheets
- Verify the `VITE_SCRIPT_URL` is correct
- Test the Apps Script URL directly in a browser
- Check if the Apps Script is still deployed and active

### API errors
- Check Vercel logs: `vercel logs`
- Ensure all environment variables are set in Vercel
- Verify the API endpoint is accessible at `/api/submit-form`

## File Type and Size Restrictions

- **Allowed formats**: PDF, Word (.doc, .docx)
- **Max size**: 10MB

## Security Notes

- Never commit `.env` files with real credentials to GitHub
- Use Vercel's environment variables for production
- The API accepts requests from any origin (CORS enabled) - consider adding origin restrictions in production
- Files are uploaded as "Anyone can view" - adjust permissions as needed in Google Drive

## Support

For issues with:
- **Google APIs**: Visit [Google Cloud Support](https://cloud.google.com/support)
- **Vercel Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
