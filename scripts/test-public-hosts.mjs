import https from 'https';

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Test 1: Catbox.moe API (Permanent Public CDN)
function uploadCatbox(base64Str) {
  return new Promise((resolve) => {
    const rawBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+\-]+;base64,/, '');
    const buffer = Buffer.from(rawBase64, 'base64');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="fileToUpload"; filename="payment_slip.png"\r\n';
    body += 'Content-Type: image/png\r\n\r\n';

    const headerBuffer = Buffer.from(body, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([headerBuffer, buffer, footerBuffer]);

    const options = {
      hostname: 'catbox.moe',
      port: 443,
      path: '/user/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ host: 'catbox.moe', status: res.statusCode, body: resBody.trim() }));
    });

    req.on('error', (e) => resolve({ host: 'catbox.moe', error: e.message }));
    req.write(payload);
    req.end();
  });
}

// Test 2: TmpFiles.org API
function uploadTmpFiles(base64Str) {
  return new Promise((resolve) => {
    const rawBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+\-]+;base64,/, '');
    const buffer = Buffer.from(rawBase64, 'base64');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="file"; filename="payment_slip.png"\r\n';
    body += 'Content-Type: image/png\r\n\r\n';

    const headerBuffer = Buffer.from(body, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([headerBuffer, buffer, footerBuffer]);

    const options = {
      hostname: 'tmpfiles.org',
      port: 443,
      path: '/api/v1/upload',
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
          let url = json?.data?.url;
          if (url && url.includes('tmpfiles.org/')) {
            url = url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          }
          resolve({ host: 'tmpfiles.org', status: res.statusCode, url, json });
        } catch (e) {
          resolve({ host: 'tmpfiles.org', status: res.statusCode, body: resBody });
        }
      });
    });

    req.on('error', (e) => resolve({ host: 'tmpfiles.org', error: e.message }));
    req.write(payload);
    req.end();
  });
}

async function testPublicHosts() {
  console.log('Testing Catbox.moe...');
  const catboxRes = await uploadCatbox(sampleBase64Image);
  console.log('Catbox Response:', catboxRes);

  console.log('\nTesting TmpFiles.org...');
  const tmpRes = await uploadTmpFiles(sampleBase64Image);
  console.log('TmpFiles Response:', tmpRes);
}

testPublicHosts();
