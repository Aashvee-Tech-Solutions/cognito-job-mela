# Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```
1. Code already deployed ✅
2. Go to Vercel Settings → Environment Variables
3. Add: GOOGLE_DRIVE_API_KEY
4. Add: GOOGLE_DRIVE_FOLDER_ID
5. Redeploy
6. Test form submission
```

---

## 📍 Files Changed

| File | Type | Change |
|------|------|--------|
| `api/submit-form.js` | 🆕 NEW | Backend API endpoint |
| `src/App.tsx` | 📝 MODIFIED | Resume upload handling |
| `.env.example` | 📝 MODIFIED | New env variables |
| `README.md` | 📝 MODIFIED | New sections |

---

## 🔑 Environment Variables

### Required
```env
VITE_SCRIPT_URL=https://script.google.com/macros/s/ID/exec
```

### Optional (for resume uploads)
```env
GOOGLE_DRIVE_API_KEY=abc123def456...
GOOGLE_DRIVE_FOLDER_ID=xyz789abc123...
```

---

## 📚 Which Document to Read?

| Question | Read This |
|----------|-----------|
| What was fixed? | `START_HERE.md` |
| What do I do? | `SETUP_CHECKLIST.md` |
| How to set up Drive? | `BACKEND_SETUP.md` |
| What's different? | `CHANGES.md` |
| Will it break things? | `MIGRATION_GUIDE.md` |
| Show me a diagram | `ARCHITECTURE.md` |

---

## ⚙️ Minimal Setup (5 min)

```bash
# 1. Deploy code to Vercel (already done) ✅
# 2. Add environment variable in Vercel:
#    VITE_SCRIPT_URL = your_apps_script_url
# 3. Redeploy
# 4. Test form submission
#    → Check Google Sheets for data
```

---

## 🎯 Full Setup (30-45 min)

### Phase 1: Google Cloud (15 min)
```
1. Create Google Cloud Project
2. Enable Google Drive API
3. Create Service Account
4. Create API Key
→ Copy GOOGLE_DRIVE_API_KEY
```

### Phase 2: Google Drive (10 min)
```
1. Create folder: "Cognito Job Mela Resumes"
2. Share with service account
3. Get folder ID from URL
→ Copy GOOGLE_DRIVE_FOLDER_ID
```

### Phase 3: Deploy (10 min)
```
1. Add env variables in Vercel
2. Redeploy
3. Test form with resume file
4. Check Google Drive folder
```

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| Google Cloud | https://console.cloud.google.com |
| Vercel | https://vercel.com/dashboard |
| Google Drive | https://drive.google.com |
| This Project | See your Vercel domain |

---

## ✅ Testing Checklist

```
□ Form loads without errors
□ Can fill all fields
□ Resume file upload shows error for wrong format
□ Resume file upload succeeds for PDF/Word
□ Submit button disabled while loading
□ Success screen shows after submit
□ Data appears in Google Sheets
□ Resume appears in Google Drive (if configured)
□ Drive link works
```

---

## 🛠️ Troubleshooting

### Form won't submit
```
→ Check browser console (F12)
→ Check all required fields filled
→ Check file is < 10MB and PDF/Word
```

### Resume not uploading
```
→ Check GOOGLE_DRIVE_API_KEY is set
→ Check GOOGLE_DRIVE_FOLDER_ID is set
→ Check Drive folder exists
→ Check service account has access
```

### Data not in Google Sheets
```
→ Check VITE_SCRIPT_URL is correct
→ Test Apps Script URL in browser
→ Check Sheets exists and has headers
```

---

## 📊 Feature Summary

### What Users See
✅ Beautiful registration form  
✅ Resume upload input  
✅ Error messages  
✅ Success confirmation  
✅ Resume link display  
✅ Mobile responsive  

### What Happens Behind Scenes
✅ Form data → Google Sheets  
✅ Resume file → Google Drive  
✅ Link generated → Sent to user  
✅ Data backed up → localStorage  
✅ Errors logged → Console  

---

## 🔐 Security

✅ API keys in Vercel only  
✅ No credentials in frontend  
✅ File validation (type & size)  
✅ Secure Drive sharing  
✅ Error handling robust  

---

## 💰 Cost

```
Vercel: FREE
Google Sheets: FREE
Google Drive: FREE (15GB)
Total: $0/month
```

---

## 📞 Quick Help

```
General help → START_HERE.md
Step by step → SETUP_CHECKLIST.md
Google Drive → BACKEND_SETUP.md
How it works → ARCHITECTURE.md
Changed what? → CHANGES.md
Backward compat? → MIGRATION_GUIDE.md
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Read overview | 5 min |
| Deploy code | Done ✅ |
| Add env variables | 5 min |
| Test form | 5 min |
| Set up Google Drive | 30 min (optional) |
| **Total minimum** | **10 min** |
| **Total with Drive** | **45 min** |

---

## 🎯 Success Indicators

✅ Form submits successfully  
✅ Data in Google Sheets  
✅ Resume in Google Drive  
✅ Drive link works  
✅ No console errors  
✅ No Vercel log errors  

---

## 📋 API Endpoint

```
POST /api/submit-form
Content-Type: application/json

Request:
{
  "formData": { ...all fields },
  "resumeBase64": "base64string",
  "resumeFile": { "name": "file.pdf" }
}

Response:
{
  "success": true,
  "message": "Form submitted successfully",
  "driveLink": "https://drive.google.com/..."
}
```

---

## 🚀 One-Liner Deployment

```bash
# Code already deployed to Vercel!
# Just add 2 environment variables and redeploy.
# That's it! 🎉
```

---

## 💡 Pro Tips

1. **Test locally first**: `npm run dev`
2. **Check Drive folder**: Resumes appear immediately
3. **Share the link**: Users can download resumes
4. **Monitor logs**: `vercel logs` for debugging
5. **Backup Google Sheet**: Download periodically

---

## 🔄 Backward Compatibility

✅ OLD SYSTEM STILL WORKS  
✅ Form data still goes to Sheets  
✅ No breaking changes  
✅ Can opt-in to Drive feature  
✅ No forced migration  

---

## 📝 Files to Keep

```
START_HERE.md ..................... Read first
SETUP_CHECKLIST.md ................ Action items
BACKEND_SETUP.md .................. Detailed guide
DOCS_INDEX.md ..................... Navigation
All other docs .................... Reference
```

---

## 🎉 You're All Set!

1. ✅ Code deployed
2. ✅ Documentation complete
3. ⏳ Add environment variables
4. ⏳ Test form submission
5. 🎉 Done!

**Ready to deploy? Start with `START_HERE.md`** 🚀

---

## 📞 Need Help?

1. Check relevant documentation file
2. Review troubleshooting section
3. Check browser console (F12)
4. Check Vercel logs (`vercel logs`)
5. Verify environment variables

**Everything is documented. You've got this!** 💪
