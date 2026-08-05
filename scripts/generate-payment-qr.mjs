import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

async function generatePaymentQR() {
  const upiUrl = 'upi://pay?pa=ritotherfees700@fbl&pn=RIT%20OTHER%20FEES&cu=INR';
  const outputPath = path.join(process.cwd(), 'public', 'rit-payment-qr.png');

  await QRCode.toFile(outputPath, upiUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 500,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  console.log('✅ Generated official RIT Payment QR Code image at:', outputPath);
}

generatePaymentQR();
