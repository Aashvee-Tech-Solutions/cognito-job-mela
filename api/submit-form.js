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
    if (scriptUrl) {
      try {
        await makeHttpRequest(scriptUrl, 'POST', {
          ...formData,
          submittedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error sending to Google Sheets:', error.message);
        // Continue even if Google Sheets fails
      }
    }

    // Step 2: Upload resume to Google Drive if provided
    let driveFileUrl = null;
    if (resumeBase64 && process.env.GOOGLE_DRIVE_API_KEY && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      try {
        driveFileUrl = await uploadToDrive(
          resumeBase64,
          `${formData.fullName}_Resume.pdf`,
          process.env.GOOGLE_DRIVE_FOLDER_ID,
          process.env.GOOGLE_DRIVE_API_KEY
        );
      } catch (error) {
        console.error('Error uploading to Google Drive:', error.message);
        // Continue even if Drive upload fails
      }
    }

    // Step 3: Return success response
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      driveLink: driveFileUrl,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit form: ' + error.message,
    });
  }
};

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
        resolve(responseData);
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function uploadToDrive(fileBase64, fileName, folderId, apiKey) {
  try {
    // First, create the file metadata
    const createData = {
      name: fileName,
      parents: [folderId],
    };

    const createResponse = await makeHttpRequest(
      `https://www.googleapis.com/drive/v3/files?key=${apiKey}`,
      'POST',
      createData
    );

    const fileData = JSON.parse(createResponse);
    const fileId = fileData.id;

    // Then upload the file content using multipart
    const fileContent = Buffer.from(fileBase64, 'base64');
    await uploadFileContent(fileId, fileContent, apiKey);

    // Make the file publicly accessible (optional)
    const permissionData = {
      role: 'reader',
      type: 'anyone',
    };

    await makeHttpRequest(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?key=${apiKey}`,
      'POST',
      permissionData
    );

    // Return the file link
    return `https://drive.google.com/file/d/${fileId}/view`;
  } catch (error) {
    console.error('Drive upload error:', error.message);
    throw error;
  }
}

function uploadFileContent(fileId, fileContent, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/upload/drive/v3/files/${fileId}?uploadType=media&key=${apiKey}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve(responseData);
      });
    });

    req.on('error', reject);
    req.write(fileContent);
    req.end();
  });
}
