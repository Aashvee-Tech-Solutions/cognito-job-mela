const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, resumeFile, resumeBase64 } = req.body;

    // Validate required fields
    if (!formData || !formData.fullName || !formData.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Send form data to Google Sheets via Apps Script
    const scriptUrl = process.env.VITE_SCRIPT_URL;
    let sheetsSuccess = false;
    if (scriptUrl) {
      try {
        await makeHttpRequest(scriptUrl, 'POST', {
          ...formData,
          submittedAt: new Date().toISOString(),
        });
        sheetsSuccess = true;
        console.log('[v0] Form data sent to Google Sheets successfully');
      } catch (error) {
        console.error('[v0] Error sending to Google Sheets:', error.message);
        // Continue even if Google Sheets fails
      }
    }

    // Step 2: Upload resume to Google Drive if provided
    let driveFileUrl = null;
    let driveSuccess = false;
    if (resumeBase64 && process.env.GOOGLE_DRIVE_API_KEY && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      try {
        driveFileUrl = await uploadToDrive(
          resumeBase64,
          `${formData.fullName}_Resume${getFileExtension(resumeFile?.name || '.pdf')}`,
          process.env.GOOGLE_DRIVE_FOLDER_ID,
          process.env.GOOGLE_DRIVE_API_KEY
        );
        driveSuccess = true;
        console.log('[v0] Resume uploaded to Google Drive:', driveFileUrl);
      } catch (error) {
        console.error('[v0] Error uploading to Google Drive:', error.message);
        // Continue even if Drive upload fails
      }
    } else if (resumeBase64) {
      console.warn('[v0] Resume file present but missing Drive credentials (GOOGLE_DRIVE_API_KEY or GOOGLE_DRIVE_FOLDER_ID)');
    }

    // Step 3: Return success response
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      driveLink: driveFileUrl,
      sheetsSubmitted: sheetsSuccess,
      driveSubmitted: driveSuccess,
    });
  } catch (error) {
    console.error('[v0] Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit form: ' + error.message,
    });
  }
};

function getFileExtension(fileName) {
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  return ext || '.pdf';
}

function makeHttpRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const payload = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function uploadToDrive(fileBase64, fileName, folderId, apiKey) {
  try {
    console.log('[v0] Starting Drive upload for:', fileName);
    
    // Decode base64 to get file content
    const fileContent = Buffer.from(fileBase64, 'base64');
    console.log('[v0] File size:', fileContent.length, 'bytes');

    // Create file metadata
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: getMimeType(fileName),
    };

    // Create multipart body for file upload
    const boundary = '===============7330845974216740156==';
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`),
      Buffer.from(JSON.stringify(metadata)),
      Buffer.from(`\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`),
      fileContent,
      Buffer.from(`\r\n--${boundary}--`),
    ]);

    // Upload file with multipart
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${apiKey}`;
    
    const uploadResponse = await makeHttpRequestMultipart(
      uploadUrl,
      'POST',
      multipartBody,
      `multipart/related; boundary="${boundary}"`
    );

    const fileData = JSON.parse(uploadResponse);
    const fileId = fileData.id;
    console.log('[v0] File created with ID:', fileId);

    // Return the file link
    const driveLink = `https://drive.google.com/file/d/${fileId}/view`;
    return driveLink;
  } catch (error) {
    console.error('[v0] Drive upload error:', error.message);
    throw error;
  }
}

function getMimeType(fileName) {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function makeHttpRequestMultipart(url, method, body, contentType) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': contentType,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
