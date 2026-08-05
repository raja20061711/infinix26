import https from 'https';
import http from 'http';
import { URL } from 'url';

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6_r2F5QSEkZ232uDQRvPNghCBS2Z7AeLuPuecG1lT8lrLJ1FC4lkV-tkfxVcKJEbo/exec';

function postHttps(urlStr, dataObj) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = typeof dataObj === 'string' ? dataObj : new URLSearchParams(dataObj).toString();

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
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
          resolve({ status: res.statusCode, headers: res.headers, body, json: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body, json: null });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runNativeHttpsTest() {
  console.log('--- TESTING NATIVE HTTPS IMAGE UPLOAD TO IMGBB ---');
  const rawBase64 = sampleBase64Image.replace(/^data:image\/png;base64,/, '');
  const apiKey = '6d327376d51724658e65f3a0937a7b88';

  try {
    const res = await postHttps(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      image: rawBase64,
      name: 'test_slip_native'
    });

    console.log('HTTP Status:', res.status);
    console.log('JSON Response:', JSON.stringify(res.json, null, 2));

    if (res.json && res.json.success && res.json.data && res.json.data.url) {
      const publicUrl = res.json.data.url;
      console.log('\n🎉 SUCCESS! Generated Public Image URL:', publicUrl);

      // Now sync to Google Sheets
      console.log('\n--- SYNCING TO GOOGLE SHEETS ---');
      const teamId = `INF26-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        action: 'create',
        registrationId: teamId,
        data: {
          teamId: teamId,
          team_id: teamId,
          registrationId: teamId,
          teamName: 'Public Image Sync Test Team',
          teamSize: 3,
          leaderName: 'Test Leader',
          leaderEmail: 'leader.test@gmail.com',
          leaderPhone: '9876543210',
          college: 'Ramco Institute of Technology',
          department: 'Information Technology',
          upiTransactionId: '998877665544',
          paymentProofUrl: publicUrl,
          paymentAmount: 600,
          paymentStatus: 'Pending Verification',
          registrationStatus: 'Pending Payment Verification',
          spreadsheetId: '1I60wEQUYeDtQQUy-nxF8mSjkzZqvkrUrE848ZZ-_D8E'
        }
      };

      const sheetRes = await postHttps(SCRIPT_URL, JSON.stringify(payload));
      console.log('Google Sheets Sync Output:', sheetRes.body);
    }
  } catch (err) {
    console.error('❌ Native HTTPS Test Error:', err);
  }
}

runNativeHttpsTest();
