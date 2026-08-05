import https from 'https';

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function uploadToCloudinary(base64Str) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      file: base64Str,
      upload_preset: 'docs_upload_example_us_preset' // Cloudinary public unsigned preset
    }).toString();

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: '/v1_1/demo/image/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, json });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('Testing Cloudinary Unsigned Upload...');
  try {
    const res = await uploadToCloudinary(sampleBase64Image);
    console.log('HTTP Status:', res.status);
    console.log('Response:', JSON.stringify(res.json, null, 2));

    if (res.json && res.json.secure_url) {
      console.log('🎉 SUCCESS! Public Cloudinary Image URL:', res.json.secure_url);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

runTest();
