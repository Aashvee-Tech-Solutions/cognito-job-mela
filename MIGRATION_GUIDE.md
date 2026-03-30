# Migration Guide: Old to New Backend

## What Changed

Previously, your form was sending data directly to Google Apps Script from the browser. Now it goes through a Vercel API endpoint that:
1. Handles resume file uploads properly
2. Sends data to Google Sheets
3. Uploads resumes to Google Drive
4. Returns proper error handling

## Breaking Changes

None! The upgrade is backward compatible. If you don't set up Google Drive:
- Form data still goes to Google Sheets as before
- Resumes won't upload (but won't break anything)
- Everything else works exactly the same

## Migration Steps

### Step 1: Update Environment Variables

**Before:**
```env
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**After:** (add these two new variables)
```env
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_DRIVE_API_KEY=your_api_key
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

The `VITE_SCRIPT_URL` remains the same and still works!

### Step 2: No Database Migration Needed

Your Google Sheets is still used exactly the same way. The new API just forwards data to it.

### Step 3: Test the New System

1. Deploy code to Vercel:
   ```bash
   git add .
   git commit -m "feat: add resume upload backend"
   git push
   ```

2. Add environment variables in Vercel:
   - Go to your project Settings
   - Navigate to "Environment Variables"
   - Add `GOOGLE_DRIVE_API_KEY` and `GOOGLE_DRIVE_FOLDER_ID`

3. Test form submission:
   - Fill out the form
   - Upload a PDF resume
   - Check both Google Sheets AND Google Drive
   - You should see data in both places

### Step 4: Verify Old Form Data Still Works

Your existing Google Sheets entries are untouched. The new system just adds new entries the same way.

## What Users Will Notice

### Before:
```
Fill Form → Click Submit → Google Sheets gets data → Done
(resume was just a filename string)
```

### After:
```
Fill Form → Choose Resume File → Click Submit → Both services updated
→ Google Sheets: gets data + resume filename
→ Google Drive: gets actual resume file
→ User sees success message with Drive link
```

## Rollback (If Needed)

If something goes wrong, you can rollback:

1. Go to Vercel deployments
2. Click the previous working deployment
3. Click "Redeploy"

The old system will work exactly as before.

## Frequently Asked Questions

### Q: Will existing form submissions break?
**A:** No. The new system uses the same Apps Script URL. All existing data is safe.

### Q: Do I have to set up Google Drive?
**A:** No. It's optional. Forms will work with just Google Sheets, resumes just won't auto-upload.

### Q: Can I test locally without Google Drive setup?
**A:** Yes. Set `VITE_SCRIPT_URL` in `.env.local` and test form submission. Sheets will work, Drive upload will fail silently.

### Q: What happens if Google Drive upload fails?
**A:** The form submission still succeeds and data goes to Sheets. The user gets a message that Drive upload failed, but the most important data is preserved.

### Q: How do users download their resumes?
**A:** They get a Google Drive link in the success screen and it's stored in localStorage. They can access the folder anytime.

### Q: Can I still access form data the same way?
**A:** Yes! Everything goes to the same Google Sheets spreadsheet. No changes needed to how you access the data.

## Performance Impact

- Form submission slightly slower (now makes 2 API calls instead of 1)
- But they run in parallel, so ~same speed overall
- Resume upload runs async, doesn't block the success screen

## Security Improvements

1. **Resume files are secure** - Stored in your Google Drive, not on Vercel servers
2. **API credentials hidden** - Drive API key never exposed to frontend
3. **File validation** - Resumes must be PDF/Word, max 10MB
4. **Graceful failures** - Bad uploads don't crash the system

## Monitoring

### Check if submissions are working:
1. **Google Sheets**: New data appears
2. **Google Drive folder**: Resume files appear
3. **Vercel logs**: `vercel logs` shows no errors

### Common issues:
- Missing environment variables → Add to Vercel
- Drive folder not shared → Share with service account
- API key invalid → Generate new key
- Apps Script URL broken → Test directly

## Support

For migration help:
1. Read `IMPLEMENTATION_SUMMARY.md` for overview
2. Read `BACKEND_SETUP.md` for detailed setup
3. Check `MIGRATION_GUIDE.md` (this file) for FAQs
4. Check Vercel logs: `vercel logs`
5. Check browser console for frontend errors

## Timeline

- ✅ Code changes deployed to Vercel
- ⏳ Add environment variables in Vercel
- ⏳ Set up Google Drive (optional but recommended)
- ⏳ Test form submission
- ✅ Done! The system is live

You can proceed at your own pace. The form still works without Google Drive setup!
