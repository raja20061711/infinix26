import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zznpxqtyalvrekqlkpel.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6_r2F5QSEkZ232uDQRvPNghCBS2Z7AeLuPuecG1lT8lrLJ1FC4lkV-tkfxVcKJEbo/exec';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function setupBucketAndTestUpload() {
  console.log('--- STEP 0: Auto-Creating Storage Bucket "payment-proofs" ---');
  
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('payment-proofs', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  });

  if (bucketError) {
    console.log('Bucket Creation Notice/Result:', bucketError.message);
  } else {
    console.log('✅ Bucket "payment-proofs" created successfully:', bucketData);
  }

  console.log('\n--- TEST 1: Uploading Base64 Image to Supabase Storage ---');
  const teamId = `INF26-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const contentType = 'image/png';
  const rawBase64 = sampleBase64Image.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(rawBase64, 'base64');
  const filePath = `payment_slips/${teamId}_${Date.now()}.png`;

  console.log(`Uploading image to 'payment-proofs' bucket at path '${filePath}'...`);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('❌ Upload Error:', uploadError.message);
    return;
  }

  console.log('✅ Upload Success! Path:', uploadData.path);

  const { data: pubData } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(uploadData.path);

  const publicUrl = pubData?.publicUrl;
  console.log('✅ Generated Permanent Public URL:', publicUrl);

  console.log('\n--- TEST 2: Verify Public URL Accessibility ---');
  try {
    const fetchRes = await fetch(publicUrl);
    console.log(`HTTP Status: ${fetchRes.status} ${fetchRes.statusText}`);
    console.log(`Content-Type: ${fetchRes.headers.get('content-type')}`);
    console.log(`Content-Length: ${fetchRes.headers.get('content-length')} bytes`);
    
    if (fetchRes.status === 200) {
      console.log('🎉 Public URL is 100% accessible directly in browser!');
    } else {
      console.error('⚠️ Image URL returned non-200 status code!');
    }
  } catch (err) {
    console.error('❌ Failed to fetch public image URL:', err);
  }

  console.log('\n--- TEST 3: Sync Record to Google Sheets ---');
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

  try {
    const sheetRes = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const resText = await sheetRes.text();
    console.log('Google Apps Script Response:', resText);
  } catch (sheetErr) {
    console.error('❌ Google Sheets sync failed:', sheetErr);
  }
}

setupBucketAndTestUpload();
