# Cognito Mega Job Mela 2026 — Registration Form

A React/Vite registration form that sends submissions to **Google Sheets** (free, no server required), hosted on **Vercel** with a free custom subdomain.

## Architecture (100% Free)

- **Frontend hosting:** Vercel (free) → `yourapp.vercel.app`
- **Form backend:** Google Apps Script (free serverless endpoint)
- **Data storage:** Google Sheets (free)

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

### Step 5: Add the environment variable

1. Vercel project → **Settings → Environment Variables**.
2. Add: Name = `VITE_SCRIPT_URL`, Value = your Web App URL from Step 2.
3. Go to **Deployments → Redeploy** to apply it.

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

## Optional: Confirmation Emails

The `google-apps-script.js` includes a commented-out block to email each applicant a confirmation via Gmail (free, 100 emails/day). Uncomment it in Apps Script to enable.
