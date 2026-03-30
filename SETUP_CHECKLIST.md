# Backend Setup Checklist

## ✅ Code Implementation (Already Done)

- [x] Backend API endpoint created (`/api/submit-form.js`)
- [x] Frontend form updated for resume uploads (`/src/App.tsx`)
- [x] File validation implemented
- [x] Error handling added
- [x] Environment variables documented
- [x] Backward compatibility maintained
- [x] Code pushed to GitHub

---

## ⏳ Your Setup Tasks

### Option 1: Minimal Setup (Google Sheets Only)
Estimated time: **5 minutes**

- [ ] Push code to Vercel (auto-deploys)
- [ ] Test form submission
- [ ] Verify data appears in Google Sheets
- [ ] Done! Resume uploads won't work but form works perfectly

**Environment variable needed:**
- `VITE_SCRIPT_URL` (you already have this)

### Option 2: Full Setup (Google Sheets + Resume Uploads)
Estimated time: **30-45 minutes**

#### Phase 1: Create Google Cloud Project (15 min)
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project: "Cognito Job Mela"
- [ ] Enable Google Drive API
- [ ] Create Service Account
- [ ] Create API Key
- [ ] Copy `GOOGLE_DRIVE_API_KEY`

**Follow exact steps in:** `BACKEND_SETUP.md` → Section 2

#### Phase 2: Create Google Drive Folder (10 min)
- [ ] Create folder in Google Drive: "Cognito Job Mela Resumes"
- [ ] Get folder ID from URL
- [ ] Share folder with service account email
- [ ] Copy `GOOGLE_DRIVE_FOLDER_ID`

**Follow exact steps in:** `BACKEND_SETUP.md` → Section 2.5

#### Phase 3: Deploy to Vercel (10 min)
- [ ] Push code to GitHub
- [ ] Vercel auto-deploys
- [ ] Add environment variables in Vercel:
  - [ ] `GOOGLE_DRIVE_API_KEY`
  - [ ] `GOOGLE_DRIVE_FOLDER_ID`
- [ ] Redeploy on Vercel
- [ ] Test form submission

#### Phase 4: Test (5 min)
- [ ] Fill form on live site
- [ ] Upload PDF/Word resume
- [ ] Click Submit
- [ ] Check Google Sheets for data
- [ ] Check Google Drive folder for resume file
- [ ] Verify success screen shows Drive link

---

## Testing Checklist

### Local Testing (`npm run dev`)
- [ ] Form loads without errors
- [ ] Validation messages show correctly
- [ ] Can upload resume file
- [ ] File validation works (rejects wrong type)
- [ ] Submit button triggers submission
- [ ] Success screen appears

### Production Testing (After Vercel deployment)
- [ ] Form loads at your Vercel domain
- [ ] All fields validate correctly
- [ ] Can upload resume file
- [ ] Submit triggers API call (check Network tab)
- [ ] Success screen shows
- [ ] Data appears in Google Sheets
- [ ] Resume appears in Google Drive (if configured)
- [ ] Drive link works and opens file

---

## Troubleshooting Quick Reference

### Form won't submit
- [ ] Check all required fields are filled
- [ ] Check file upload validation errors
- [ ] Open browser console (F12) for JavaScript errors
- [ ] Check Vercel logs: `vercel logs`

### Resume not uploading
- [ ] Check `GOOGLE_DRIVE_API_KEY` in Vercel is set
- [ ] Check `GOOGLE_DRIVE_FOLDER_ID` in Vercel is set
- [ ] Check Drive folder exists
- [ ] Check service account has folder access
- [ ] Check file size < 10MB
- [ ] Check file type is PDF or Word

### Form data not in Google Sheets
- [ ] Check `VITE_SCRIPT_URL` is correct
- [ ] Test Apps Script URL directly in browser
- [ ] Check Apps Script is still deployed
- [ ] Check sheet exists and has headers

### API endpoint not found
- [ ] Verify deployment completed: `vercel ls`
- [ ] Check endpoint: `https://your-domain.vercel.app/api/submit-form`
- [ ] Verify environment variables are set

---

## Important Files to Reference

| File | Purpose |
|------|---------|
| `BACKEND_SETUP.md` | Step-by-step Google Drive setup guide |
| `IMPLEMENTATION_SUMMARY.md` | Overview of what changed |
| `MIGRATION_GUIDE.md` | FAQ about the migration |
| `CHANGES.md` | Technical details of implementation |
| `.env.example` | Environment variable template |

---

## Environment Variables at a Glance

### For Google Sheets (Required)
```env
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### For Google Drive Resume Upload (Optional)
```env
GOOGLE_DRIVE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_FOLDER_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to add:**
1. Local: Create `.env.local` file
2. Production: Vercel Settings → Environment Variables

---

## One-Step Deployment

```bash
# 1. Code is already pushed to GitHub ✓
# 2. Vercel auto-deploys

# 3. Add environment variables in Vercel dashboard
# Settings → Environment Variables
# Add: GOOGLE_DRIVE_API_KEY
# Add: GOOGLE_DRIVE_FOLDER_ID

# 4. Redeploy
# Deployments → Redeploy Latest

# 5. Test at your domain
# Fill form → Upload resume → Submit
# Check Google Sheets & Drive for results
```

---

## Quick Help

**Need detailed Google Drive setup?**  
→ Read `BACKEND_SETUP.md` (165 lines, but copy-paste ready)

**Want to understand what changed?**  
→ Read `IMPLEMENTATION_SUMMARY.md` (quick overview)

**Have questions about migration?**  
→ Read `MIGRATION_GUIDE.md` (FAQs)

**Something broken?**  
→ Check `BACKEND_SETUP.md` troubleshooting section

---

## Success Indicators

✅ You're done when:
- [ ] Code deployed to Vercel without errors
- [ ] Form submits successfully on live site
- [ ] Form data appears in Google Sheets
- [ ] Resume file appears in Google Drive (if set up)
- [ ] No errors in browser console
- [ ] No errors in Vercel logs

---

## Next Steps

1. **Now:** Read this checklist
2. **Next:** Choose Option 1 or Option 2
3. **Then:** Follow the setup steps
4. **Finally:** Test and verify everything works

Good luck! 🚀
