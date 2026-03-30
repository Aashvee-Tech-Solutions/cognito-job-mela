# System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      React/Vite Form Application                         │   │
│  │  - Beautiful form UI                                     │   │
│  │  - Client-side validation                                │   │
│  │  - File upload input (resume.pdf)                        │   │
│  │  - Success/Error screens                                 │   │
│  │                                                          │   │
│  │  Data entered:                                           │   │
│  │  - fullName, email, mobile, etc.                         │   │
│  │  - Resume file (PDF/Word)                                │   │
│  └─────────────────┬──────────────────────────────────────┘   │
│                    │                                             │
│                    │ (1) FormData + resumeBase64                │
│                    │                                             │
└────────────────────┼─────────────────────────────────────────────┘
                     │
                     │ HTTPS POST
                     │ ↓
         ┌───────────────────────────┐
         │    VERCEL EDGE NETWORK    │
         │  (Global, Ultra-fast)     │
         └───────────┬───────────────┘
                     │
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
  ┌──────────────┐         ┌──────────────────┐
  │ Google Sheets│         │  Google Drive    │
  │   (Data)     │         │  (Resume Files)  │
  │              │         │                  │
  │ • fullName   │         │ • John_Resume.pdf│
  │ • email      │         │ • Jane_Resume.pdf│
  │ • mobile     │         │ • Mike_Resume.pdf│
  │ • skills     │         │                  │
  │ • etc.       │         │ Shared links:    │
  │              │         │ get sent to      │
  │ Writable by: │         │ HR team          │
  │ Apps Script  │         │                  │
  │ Backend API  │         │ Writable by:     │
  │              │         │ Backend API      │
  └──────────────┘         │ (via Google API) │
                           └──────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│                   (src/App.tsx)                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Form Component                                          │   │
│  │  ├─ Personal Info Inputs                                │   │
│  │  │  (fullName, email, mobile, etc.)                     │   │
│  │  │                                                      │   │
│  │  ├─ Education Info                                      │   │
│  │  │  (qualification, yearOfPassing, etc.)                │   │
│  │  │                                                      │   │
│  │  ├─ Resume Upload                                       │   │
│  │  │  - File input (accepts PDF/Word only)                │   │
│  │  │  - Validation: size < 10MB                           │   │
│  │  │  - Error messages                                    │   │
│  │  │                                                      │   │
│  │  ├─ Submit Handler                                      │   │
│  │  │  1. Validate all fields                              │   │
│  │  │  2. Convert resume to base64                         │   │
│  │  │  3. POST to /api/submit-form                         │   │
│  │  │  4. Show success/error                               │   │
│  │  │                                                      │   │
│  │  └─ UI State                                            │   │
│  │     - formData (all fields)                             │   │
│  │     - resumeFile (File object)                          │   │
│  │     - isSubmitting (loading state)                      │   │
│  │     - submissionError (error message)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS POST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                  (/api/submit-form.js)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Request Handler                                         │   │
│  │                                                          │   │
│  │  1. Receive POST request                                │   │
│  │     - formData (JSON)                                   │   │
│  │     - resumeBase64 (base64 string)                      │   │
│  │     - resumeFile metadata (name, type)                  │   │
│  │                                                          │   │
│  │  2. Validate Input                                      │   │
│  │     - Check required fields                             │   │
│  │     - Check API keys configured                         │   │
│  │                                                          │   │
│  │  3. Send to Google Sheets (Async)                       │   │
│  │     ├─ Convert to JSON                                  │   │
│  │     ├─ POST to Apps Script URL                          │   │
│  │     └─ Store data                                       │   │
│  │                                                          │   │
│  │  4. Upload Resume to Drive (Async)                      │   │
│  │     ├─ Convert base64 to Buffer                         │   │
│  │     ├─ Create file metadata                             │   │
│  │     ├─ Upload file via Drive API                        │   │
│  │     ├─ Set permissions (viewer access)                  │   │
│  │     └─ Get shareable link                               │   │
│  │                                                          │   │
│  │  5. Return Success Response                             │   │
│  │     ├─ success: true                                    │   │
│  │     ├─ message: "Form submitted successfully"           │   │
│  │     └─ driveLink: "https://drive.google.com/..."        │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
STEP 1: User Action
───────────────────
User fills form → selects resume.pdf → clicks Submit
                    │
                    ▼
STEP 2: Client Validation
───────────────────────────
validateField() checks:
  ✓ fullName not empty
  ✓ email valid format
  ✓ resume file selected
  ✓ resume is PDF/Word
  ✓ resume < 10MB
                    │
                    ▼ (if valid)
STEP 3: Prepare Request
───────────────────────
FileReader.readAsDataURL()
  → Convert resume.pdf to base64 string
                    │
                    ▼
Create request payload:
  {
    "formData": {
      "fullName": "John Doe",
      "email": "john@example.com",
      ...all form fields
    },
    "resumeBase64": "JVBERi0xLjQK%3D%3D...",
    "resumeFile": {
      "name": "resume.pdf",
      "type": "application/pdf"
    }
  }
                    │
                    ▼
STEP 4: Send to Backend
──────────────────────
fetch('/api/submit-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
                    │
                    ▼
STEP 5: Backend Process (Async Parallel)
─────────────────────────────────────────

  Path A: Google Sheets               Path B: Google Drive
  ────────────────────────           ─────────────────────
  1. Receive form data                1. Receive base64 resume
  2. Add timestamp                    2. Decode to binary
  3. POST to Apps Script              3. Create Drive file metadata
  4. Sheets updated ✓                 4. Upload file content
                                      5. Set permissions
                                      6. Get sharing link
                                      7. Drive file saved ✓
                    │
                    └────────┬────────┘
                             │
                             ▼
STEP 6: Return Response
──────────────────────
HTTP 200 OK
{
  "success": true,
  "message": "Form submitted successfully",
  "driveLink": "https://drive.google.com/file/d/1ABC123/view"
}
                    │
                    ▼
STEP 7: Frontend Update
──────────────────────
Show success screen:
  ✓ "Registration Successful!"
  ✓ Display user name
  ✓ Show Drive link
  ✓ Store data in localStorage
  ✓ Show next steps
                    │
                    ▼
STEP 8: User Actions
──────────────────────
User can:
  • Print receipt
  • Edit details
  • Share Drive link
  • Download resume from Drive
```

## Environment & Configuration

```
┌──────────────────────────────────────────────────────────────┐
│              ENVIRONMENT VARIABLES                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  FRONTEND (Vite)                                              │
│  ────────────────                                             │
│  VITE_SCRIPT_URL                                              │
│  ├─ URL to Google Apps Script Web App                         │
│  ├─ Example: https://script.google.com/macros/s/.../exec      │
│  ├─ Source: Google Apps Script deployment                     │
│  ├─ Used by: Backend API to forward data                      │
│  └─ Required: YES                                             │
│                                                                │
│                                                                │
│  BACKEND (Node.js on Vercel)                                  │
│  ──────────────────────────────                               │
│  GOOGLE_DRIVE_API_KEY                                         │
│  ├─ API key for Google Drive access                           │
│  ├─ Source: Google Cloud Console                              │
│  ├─ Used by: Resume upload API calls                          │
│  └─ Required: NO (optional, for Drive uploads)                │
│                                                                │
│  GOOGLE_DRIVE_FOLDER_ID                                       │
│  ├─ ID of Google Drive folder for resumes                     │
│  ├─ Source: Google Drive folder URL                           │
│  ├─ Used by: Destination for resume uploads                   │
│  └─ Required: NO (optional, for Drive uploads)                │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## API Endpoint Specification

```
┌──────────────────────────────────────────────────────────────┐
│              POST /api/submit-form                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  REQUEST                                                       │
│  ───────                                                       │
│  Headers:                                                      │
│    Content-Type: application/json                             │
│    CORS: Allowed from *                                       │
│                                                                │
│  Body:                                                         │
│  {                                                             │
│    "formData": {                                               │
│      "fullName": "string",                                     │
│      "fatherName": "string",                                   │
│      "dateOfBirth": "YYYY-MM-DD",                              │
│      "gender": "string",                                       │
│      "mobile": "string (10 digits)",                           │
│      "email": "string (valid email)",                          │
│      "aadhaar": "string (12 digits)",                          │
│      "qualification": "string",                                │
│      "specialization": "string",                               │
│      "yearOfPassing": "YYYY",                                  │
│      "percentage": "string (0-100)",                           │
│      "applyingFor": "string",                                  │
│      "experienceLevel": "string",                              │
│      "skills": "string",                                       │
│      "preferredLocation": "string",                            │
│      "jobMelaCity": "string",                                  │
│      "resume": "string (filename)"                             │
│    },                                                          │
│    "resumeBase64": "string (base64 encoded file)",             │
│    "resumeFile": {                                             │
│      "name": "string",                                         │
│      "type": "string (MIME type)"                              │
│    }                                                           │
│  }                                                             │
│                                                                │
│  RESPONSE                                                      │
│  ────────                                                      │
│  Success (200):                                                │
│  {                                                             │
│    "success": true,                                            │
│    "message": "Form submitted successfully",                   │
│    "driveLink": "https://drive.google.com/file/d/{ID}/view"   │
│  }                                                             │
│                                                                │
│  Error (400):                                                  │
│  {                                                             │
│    "error": "Missing required fields"                          │
│  }                                                             │
│                                                                │
│  Error (500):                                                  │
│  {                                                             │
│    "success": false,                                           │
│    "error": "Failed to submit form: {reason}"                  │
│  }                                                             │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## File Upload Handling

```
┌─────────────────────────────────────────────────────────────┐
│                RESUME FILE UPLOAD PROCESS                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  INPUT VALIDATION (Frontend)                                 │
│  ──────────────────────────                                  │
│  Input: <input type="file" accept=".pdf,.doc,.docx" />       │
│                                                               │
│  Validation:                                                  │
│  ├─ File type check                                          │
│  │  ✓ application/pdf                                        │
│  │  ✓ application/msword                                     │
│  │  ✓ application/vnd.openxmlformats-...(Word)               │
│  │  ✗ Reject others                                          │
│  │                                                            │
│  ├─ File size check                                          │
│  │  ✓ < 10 MB                                                │
│  │  ✗ Reject larger files                                    │
│  │                                                            │
│  └─ Required field check                                     │
│     ✓ Resume must be selected                                │
│                                                               │
│  Error Handling:                                              │
│  └─ Show error message to user                               │
│     "File size must be less than 10MB"                       │
│     "Only PDF and Word documents are allowed"                │
│                                                               │
│                        ▼                                      │
│                                                               │
│  FILE ENCODING (Frontend)                                    │
│  ────────────────────────                                    │
│  FileReader API:                                              │
│  ├─ readAsDataURL() converts file to base64                  │
│  └─ Returns: "data:application/pdf;base64,JVBERi0xLjQK..."   │
│                                                               │
│  Extract base64 string:                                       │
│  └─ Remove "data:*;base64," prefix                            │
│     Result: "JVBERi0xLjQK..."                                │
│                                                               │
│                        ▼                                      │
│                                                               │
│  BACKEND PROCESSING                                           │
│  ────────────────────                                         │
│  1. Receive base64 string                                     │
│  2. Convert to Buffer: Buffer.from(base64, 'base64')          │
│  3. Create Drive file metadata:                               │
│     {                                                         │
│       "name": "{fullName}_Resume.pdf",                        │
│       "parents": ["{FOLDER_ID}"]                              │
│     }                                                         │
│  4. POST to Google Drive API (create file)                    │
│  5. PATCH to Google Drive API (upload content)                │
│  6. POST permissions (set viewer access)                      │
│  7. Return shareable link                                     │
│                                                               │
│                        ▼                                      │
│                                                               │
│  FILE STORED IN GOOGLE DRIVE                                  │
│  ─────────────────────────────                                │
│  Location: {FOLDER_ID}/John_Doe_Resume.pdf                   │
│  Permissions: Anyone with link can view                       │
│  Link: https://drive.google.com/file/d/{FILE_ID}/view         │
│                                                               │
│  Access:                                                       │
│  ├─ HR team: Direct folder access                             │
│  ├─ Applicant: Gets shareable link                            │
│  └─ Others: Can't access without link                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TARGETS                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GITHUB                                                       │
│  ──────                                                       │
│  Repository: Aashvee-Tech-Solutions/cognito-job-mela         │
│  Branch: main                                                 │
│  Files:                                                       │
│  ├─ src/App.tsx (frontend)                                   │
│  ├─ api/submit-form.js (backend)                             │
│  ├─ package.json (dependencies)                              │
│  └─ .env.example (configuration template)                    │
│                                                               │
│                        │                                      │
│                        │ (Webhook: Auto-deploy on push)       │
│                        ▼                                      │
│                                                               │
│  VERCEL                                                       │
│  ──────                                                       │
│  Project: cognito-job-mela                                   │
│  Domain: cognito-job-mela.vercel.app                          │
│  Endpoints:                                                   │
│  ├─ GET / → Frontend (React/Vite)                             │
│  ├─ POST /api/submit-form → Backend (Node.js)                │
│  └─ Static files → Next.js/Vercel CDN                         │
│                                                               │
│  Environment Variables (Set in Vercel):                       │
│  ├─ VITE_SCRIPT_URL                                          │
│  ├─ GOOGLE_DRIVE_API_KEY                                     │
│  └─ GOOGLE_DRIVE_FOLDER_ID                                   │
│                                                               │
│                        │                                      │
│                        │ (HTTPS)                              │
│                        ▼                                      │
│                                                               │
│  END USERS                                                    │
│  ──────────                                                   │
│  Access via: https://cognito-job-mela.vercel.app              │
│  Or custom domain: https://jobs.yourdomain.com                │
│                                                               │
│  User Flow:                                                   │
│  ├─ Load form page                                            │
│  ├─ Fill form (browser validates)                             │
│  ├─ Upload resume (client-side check)                         │
│  ├─ Submit (POST to /api/submit-form)                         │
│  ├─ Backend processes request                                 │
│  └─ Success screen with Drive link                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                          │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  CLIENT-SIDE ERRORS                                       │
│  ──────────────────                                       │
│  ├─ Invalid form fields → Display error message           │
│  ├─ Wrong file type → "Only PDF and Word allowed"         │
│  ├─ File too large → "File size must be < 10MB"           │
│  ├─ API not responding → "Failed to submit form"          │
│  └─ Network error → "Check your connection"               │
│                                                            │
│  SERVER-SIDE ERRORS                                       │
│  ──────────────────                                       │
│  ├─ Missing API keys → Gracefully skip Drive upload       │
│  ├─ Drive API failure → Log error, continue              │
│  ├─ Sheets API failure → Log error, continue             │
│  ├─ Invalid request → Return 400 Bad Request             │
│  └─ Server error → Return 500 Internal Server Error      │
│                                                            │
│  RECOVERY STRATEGY                                         │
│  ──────────────────                                       │
│  Priority 1: Save form data to Sheets (critical)          │
│  Priority 2: Upload resume to Drive (nice-to-have)       │
│  Priority 3: Return Drive link (nice-to-have)            │
│                                                            │
│  If Sheets fails: Return error, ask user to retry        │
│  If Drive fails: Show error but form data is safe        │
│  If both fail: All data saved locally in localStorage    │
│                                                            │
│  Fallback: LocalStorage backup                            │
│  ├─ Always saved: formData                                │
│  ├─ Always saved: driveLink (if available)                │
│  └─ User can recover later if needed                      │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────┐
│                  PERFORMANCE METRICS                      │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  FRONTEND OPERATIONS                                      │
│  ───────────────────                                      │
│  Form Load        ~ 100-200ms                             │
│  Field Validation ~ <1ms per field                        │
│  File Upload UI   ~ Instant (<50ms)                       │
│  Form Submission  ~ 50-100ms                              │
│  Success Screen   ~ 2-3 seconds total                     │
│                                                            │
│  BACKEND OPERATIONS                                       │
│  ──────────────────                                       │
│  Request receive  ~ <10ms                                 │
│  Parse JSON       ~ <5ms                                  │
│  Validate         ~ <20ms                                 │
│  Sheets POST      ~ 500-1000ms (async)                    │
│  Drive upload     ~ 1000-2000ms (async)                   │
│  Return response  ~ <10ms                                 │
│                                                            │
│  TOTAL USER EXPERIENCE                                    │
│  ───────────────────────                                  │
│  Form fill        ~ 2-5 minutes (user-dependent)          │
│  Submit to success~ 2-3 seconds                           │
│  Data in Sheets   ~ Immediate to 5 seconds                │
│  Resume in Drive  ~ Immediate to 10 seconds               │
│                                                            │
│  Parallel Operations (Reduces Total Time):                │
│  ├─ Sheets upload & Drive upload happen simultaneously   │
│  └─ Total backend time: max(2000ms) not 3000ms           │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

This architecture provides a robust, scalable, and user-friendly form submission system with automatic resume file handling integrated into Google Drive.
