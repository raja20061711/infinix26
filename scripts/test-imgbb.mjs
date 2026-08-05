import https from 'https';

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Test list of public keys
const keys = [
  '70248ff1ebce01e40ebad3cf5d921868',
  'b289cf00fb51a669bc0cb5c7ce1a5e17',
  '456637e19d7bdf91e1d0337f7636e78d',
  '9f9024f224976c66cf17f692bbfe1fb4'
];

function uploadImgBB(key) {
  return new Promise((resolve) => {
    const rawBase64 = sampleBase64Image.replace(/^data:image\/png;base64,/, '');
    const postData = new URLSearchParams({
      image: rawBase64,
      name: 'test_slip'
    }).toString();

    const options = {
      hostname: 'api.imgbb.com',
      port: 443,
      path: `/1/upload?key=${key}`,
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
          resolve({ key, status: res.statusCode, json });
        } catch (e) {
          resolve({ key, status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => resolve({ key, error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function testKeys() {
  for (const k of keys) {
    console.log(`Testing ImgBB Key: ${k}...`);
    const res = await uploadImgBB(k);
    if (res.json && res.json.success && res.json.data && res.json.data.url) {
      console.log(`🎉 WORKING KEY FOUND: ${k}`);
      console.log(`Generated Image URL: ${res.json.data.url}`);
      return;
    } else {
      console.log(`Key ${k} failed: ${res.json?.error?.message || res.status}`);
    }
  }
}

testKeys();
