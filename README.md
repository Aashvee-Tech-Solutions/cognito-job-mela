# Cognito Mega Job Mela 2026 — Registration Form

A React/Vite registration form with resume uploads that stores data in **Google Sheets** and resumes in **Google Drive** (100% free), hosted on **Vercel**.

## Architecture (100% Free)

- **Frontend hosting:** Vercel (free) → `yourapp.vercel.app`
- **Form backend:** Vercel Serverless Functions + Google Apps Script
- **Data storage:** Google Sheets (free)
- **File storage:** Google Drive (free)
- **Resumes:** Automatically uploaded to Google Drive with shareable links

---

## Part 1 — Set Up Google Sheets + Apps Script

### Step 1: Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Copy the **Sheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`

### Step 2: Deploy the Apps Script

1. Open [script.google.com](https://script.google.com) → **New project**.
2. Delete the default code and paste the entire contents of `google-apps-script.js`.
3. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID.
4. Click **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize permissions, and copy the **Web App URL**:
   `https://script.google.com/macros/s/AKfy.../exec`

> Verify it works: open the URL in your browser — you should see `{"status":"Cognito Job Mela script is live!"}`

---

## Part 1.5 — Enable Resume Uploads (Optional but Recommended)

To automatically store uploaded resumes in Google Drive:

### Step 2a: Set Up Google Drive

1. Follow the detailed setup in `BACKEND_SETUP.md`
2. You'll get two credentials:
   - `GOOGLE_DRIVE_API_KEY` - Google Cloud API key
   - `GOOGLE_DRIVE_FOLDER_ID` - Your Drive folder ID

### Step 2b: Add Environment Variables

When deploying on Vercel (see Part 2), add these two variables to **Settings → Environment Variables**:
- `GOOGLE_DRIVE_API_KEY`
- `GOOGLE_DRIVE_FOLDER_ID`

> Resume uploads are optional. The form works perfectly without them—data still goes to Google Sheets.

---

## Part 2 — Deploy to Vercel

### Step 3: Push to GitHub

```
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/blurhack/cognito-job-mela.git
git push -u origin main
```

### Step 4: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New → Project** → import your repo → click **Deploy**.
3. Your site is live at `https://cognito-job-mela.vercel.app`.

### Step 5: Add environment variables

1. Vercel project → **Settings → Environment Variables**.
2. Add these variables:
   - `VITE_SCRIPT_URL` = your Web App URL from Step 2
   - `GOOGLE_DRIVE_API_KEY` = (if setting up resume uploads)
   - `GOOGLE_DRIVE_FOLDER_ID` = (if setting up resume uploads)
3. Go to **Deployments → Redeploy** to apply them.

---

## Part 3 — Custom Domain (Optional)

If you own a domain (e.g. `cognitoinsights.ai`):

1. Vercel project → **Settings → Domains** → add `jobs.cognitoinsights.ai`.
2. In your DNS provider add a CNAME: `jobs → cname.vercel-dns.com`
3. Vercel auto-provisions SSL in ~1 minute.

---

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Copy the env file: `cp .env.example .env.local`
3. Edit `.env.local` and set `VITE_SCRIPT_URL` to your Apps Script Web App URL.
4. Run the app: `npm run dev`

---

## Documentation

- **`BACKEND_SETUP.md`** — Detailed guide for Google Drive resume uploads
- **`IMPLEMENTATION_SUMMARY.md`** — Overview of what was changed
- **`MIGRATION_GUIDE.md`** — If you're upgrading from an older version

---

## Optional: Confirmation Emails

The `google-apps-script.js` includes a commented-out block to email each applicant a confirmation via Gmail (free, 100 emails/day). Uncomment it in Apps Script to enable.

---

## Features

✅ Beautiful, modern registration form  
✅ Form validation with error messages  
✅ Resume file upload (PDF & Word documents)  
✅ Automatic Google Sheets integration  
✅ Automatic Google Drive resume storage (optional)  
✅ Mobile responsive design  
✅ Smooth animations and transitions  
✅ Success confirmation screen  
✅ Accessible form with ARIA labels  
✅ Zero cost to run
