import nodemailer from 'nodemailer';

async function testMail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'admininfinixrit@gmail.com',
      pass: 'ztqn kbcj utfu udbr',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"INFINIX\'26 Organizers" <infinix.itrit26@gmail.com>',
      to: 'infinix.itrit26@gmail.com',
      subject: '[INFINIX\'26] Registration Confirmation Email Test',
      text: 'Hello! Registration confirmation email system is fully functional.',
    });
    console.log('✅ Email Test SUCCESS! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Email Test Error:', err);
  }
}

testMail();
