// Test registering directly via local Next.js API route
async function testRegister() {
  console.log('Sending test registration to http://localhost:3000/api/register ...');
  const payload = {
    teamName: 'Sheet Test Team V2',
    leaderName: 'Rajesh Kumar',
    leaderEmail: 'rajesh.test@gmail.com',
    leaderPhone: '9876501234',
    gender: 'Male',
    college: 'Ramco Institute of Technology',
    department: 'Information Technology',
    yearOfStudy: '3rd Year',
    rollNumber: '953621104999',
    upiTransactionId: '998877665544',
    paymentProofUrl: 'https://example.com/proof.jpg',
    accommodationRequired: true,
    members: [
      { name: 'Member Alpha', email: 'alpha@gmail.com', phone: '9876501235', college: 'Ramco Institute of Technology', department: 'IT' },
      { name: 'Member Beta', email: 'beta@gmail.com', phone: '9876501236', college: 'Ramco Institute of Technology', department: 'IT' }
    ]
  };

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('API Status:', res.status, res.statusText);
    const json = await res.json();
    console.log('API Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error testing registration API:', err);
  }
}

testRegister();
