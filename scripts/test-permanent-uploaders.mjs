import https from 'https';

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Test 1: FreeImage.host API
function testFreeImageHost(base64Str) {
  return new Promise((resolve) => {
    const rawBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+\-]+;base64,/, '');
    const postData = new URLSearchParams({
      key: '6d207e02198a847aa98d0a2a901485a5',
      action: 'upload',
      source: rawBase64,
      format: 'json'
    }).toString();

    const options = {
      hostname: 'freeimage.host',
      port: 443,
      path: '/api/1/upload',
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
          resolve({ provider: 'freeimage.host', status: res.statusCode, url: json?.image?.url || json?.image?.display_url, json });
        } catch (e) {
          resolve({ provider: 'freeimage.host', status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => resolve({ provider: 'freeimage.host', error: e.message }));
    req.write(postData);
    req.end();
  });
}

// Test 2: ImgBB with multiple public keys
function testImgBB(base64Str, key) {
  return new Promise((resolve) => {
    const rawBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+\-]+;base64,/, '');
    const postData = new URLSearchParams({
      key: key,
      image: rawBase64
    }).toString();

    const options = {
      hostname: 'api.imgbb.com',
      port: 443,
      path: '/1/upload',
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
          resolve({ provider: 'imgbb', key, status: res.statusCode, url: json?.data?.url || json?.data?.display_url, json });
        } catch (e) {
          resolve({ provider: 'imgbb', key, status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => resolve({ provider: 'imgbb', key, error: e.message }));
    req.write(postData);
    req.end();
  });
}

// Test 3: Telegra.ph (Telegram Telegraph CDN - Permanent Public HTTP)
function testTelegraph(base64Str) {
  return new Promise((resolve) => {
    const rawBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+\-]+;base64,/, '');
    const buffer = Buffer.from(rawBase64, 'base64');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let bodyHeader = '';
    bodyHeader += `--${boundary}\r\n`;
    bodyHeader += 'Content-Disposition: form-data; name="file"; filename="payment_proof.png"\r\n';
    bodyHeader += 'Content-Type: image/png\r\n\r\n';

    const headerBuffer = Buffer.from(bodyHeader, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([headerBuffer, buffer, footerBuffer]);

    const options = {
      hostname: 'telegra.ph',
      port: 443,
      path: '/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(resBody);
          let url = '';
          if (Array.isArray(json) && json[0]?.src) {
            url = 'https://telegra.ph' + json[0].src;
          }
          resolve({ provider: 'telegra.ph', status: res.statusCode, url, json });
        } catch (e) {
          resolve({ provider: 'telegra.ph', status: res.statusCode, body: resBody });
        }
      });
    });

    req.on('error', (e) => resolve({ provider: 'telegra.ph', error: e.message }));
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('Testing FreeImage.host...');
  const res1 = await testFreeImageHost(sampleBase64Image);
  console.log('FreeImage.host Result:', res1);

  console.log('\nTesting Telegra.ph...');
  const res2 = await testTelegraph(sampleBase64Image);
  console.log('Telegra.ph Result:', res2);

  const imgbbKeys = ['70248ff1ebce01e40ebad3cf5d921868', '6d207e02198a847aa98d0a2a901485a5'];
  for (const k of imgbbKeys) {
    console.log(`\nTesting ImgBB key ${k}...`);
    const res3 = await testImgBB(sampleBase64Image, k);
    console.log(`ImgBB Result (${k}):`, res3);
  }
}

runTests();
