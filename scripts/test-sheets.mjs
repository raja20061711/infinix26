// Native Node.js fetch test script

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKzE8_cUGd__1N5z5tj1kUqrOXN4oiT8vZIpu_1vk3Y5tU50kcSB8f9q3c28E4nRA/exec';

const payload = {
  action: 'create',
  registrationId: 'INF26-7890',
  data: {
    team_id: 'INF26-7890',
    teamId: 'INF26-7890',
    registrationId: 'INF26-7890',
    team_name: 'Alpha Coders Test',
    team_size: 3,
    leader_name: 'Suresh R',
    leader_email: 'suresh.test@gmail.com',
    leader_phone: '9876543210',
    gender: 'Male',
    college: 'Ramco Institute of Technology',
    department: 'Information Technology',
    year_of_study: '3rd Year',
    roll_number: '953621104020',
    members: [
      { name: 'Member 2', email: 'm2@gmail.com', phone: '9876543211', college: 'Ramco Institute of Technology', department: 'IT' },
      { name: 'Member 3', email: 'm3@gmail.com', phone: '9876543212', college: 'Ramco Institute of Technology', department: 'IT' }
    ],
    accommodation_required: false,
    upi_transaction_id: '423589012345',
    payment_proof_url: 'https://example.com/slip.jpg',
    payment_amount: 750,
    payment_status: 'Pending Verification',
    attendance_status: 'Not Checked In',
    registration_status: 'Pending Payment Verification',
    spreadsheetId: '1I60wEQUYeDtQQUy-nxF8mSjkzZqvkrUrE848ZZ-_D8E'
  }
};

async function runTest() {
  console.log('Sending payload to Google Apps Script URL:', SCRIPT_URL);
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    console.log('Response Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response Text:', text);
  } catch (err) {
    console.error('Error during fetch:', err);
  }
}

runTest();
