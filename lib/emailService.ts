import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Team } from './portalState';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendStudentWelcomeEmail(team: Team): Promise<EmailResult> {
  // Generate QR Code Data URL for the team if not already present
  let qrCodeDataUrl = team.qrCodeUrl;
  if (!qrCodeDataUrl) {
    try {
      const qrData = JSON.stringify({
        teamId: team.teamId,
        teamName: team.teamName,
        event: "INFINIX'26 Hackathon",
      });
      qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        margin: 1,
        width: 250,
        color: { dark: '#00D9FF', light: '#ffffff' },
      });
    } catch (err) {
      console.error('Failed to generate QR code for email:', err);
      qrCodeDataUrl = '';
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #01050e; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #04162e; border: 1px solid rgba(0, 217, 255, 0.4); border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,217,255,0.2); }
          .header { text-align: center; border-b: 1px solid rgba(0, 217, 255, 0.2); padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 900; color: #00D9FF; letter-spacing: 3px; }
          .title { font-size: 14px; font-weight: 700; color: #7CE7FF; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
          .card { background: #020b18; border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px; padding: 15px; margin: 15px 0; }
          .field-label { font-size: 11px; font-weight: bold; color: #7CE7FF; text-transform: uppercase; letter-spacing: 1px; }
          .field-val { font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 4px; }
          .pass-highlight { background: rgba(0, 217, 255, 0.15); border: 1px solid #00D9FF; color: #00D9FF; padding: 12px; font-size: 20px; font-weight: bold; letter-spacing: 3px; text-align: center; border-radius: 8px; font-family: monospace; }
          .qr-section { text-align: center; background: #020b18; border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 16px; padding: 20px; margin: 20px 0; }
          .qr-title { font-size: 12px; font-weight: bold; color: #00D9FF; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-t: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">INFINIX'26</div>
            <div class="title">NATIONAL LEVEL HACKATHON • RAMCO INSTITUTE OF TECHNOLOGY</div>
          </div>
          
          <p>Dear Team Leader <strong>${team.leaderName}</strong> (${team.teamName}),</p>
          <p>Your team registration for <strong>INFINIX'26 Hackathon</strong> has been verified. Below are your official student portal login credentials and your venue desk check-in QR Code:</p>
          
          <div class="card">
            <div class="field-label">Official Team ID</div>
            <div class="field-val">${team.teamId}</div>
          </div>

          <div class="card">
            <div class="field-label">Student Portal Password</div>
            <div class="pass-highlight">${team.password || 'hackathon2026'}</div>
          </div>

          <!-- Official QR Code Section -->
          ${
            qrCodeDataUrl
              ? `
          <div class="qr-section">
            <div class="qr-title">📱 OFFICIAL DESK CHECK-IN QR CODE</div>
            <img src="${qrCodeDataUrl}" alt="Team QR Code" style="width: 200px; height: 200px; border-radius: 12px; border: 3px solid #00D9FF; padding: 6px; background: #ffffff;" />
            <p style="font-size: 11px; color: #94a3b8; margin-top: 10px; font-weight: 500;">
              Show this QR Code at the registration desk upon arriving at RIT campus for instant check-in.
            </p>
          </div>
          `
              : ''
          }

          <div class="card">
            <div class="field-label">College & Department</div>
            <div class="field-val">${team.college} (${team.department})</div>
          </div>

          <div class="card">
            <div class="field-label">Reporting Venue & Date</div>
            <div class="field-val">Auditorium Hall, RIT Campus • September 10, 2026 @ 08:30 AM IST</div>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Login to your student portal at <a href="https://infinix26.ritrjpm.ac.in/student/login" style="color: #00D9FF; font-weight: bold;">/student/login</a> using your Team ID and Password.</li>
            <li>Present this QR Code on your mobile or printout at the registration desk.</li>
            <li>Bring your official college ID cards and hardware modules.</li>
          </ol>

          <div class="footer">
            <p>Support Helpline: infinix26@ritrjpm.ac.in | +91 63748 47027</p>
            <p>© 2026 Ramco Institute of Technology. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // METHOD 1: Resend API (Recommended - No Gmail Blocking)
  const resendApiKey = process.env.RESEND_API_KEY || '';
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'INFINIX26 Organizers <onboarding@resend.dev>',
          to: [team.leaderEmail],
          subject: `[INFINIX'26] Registration Verified & Check-in QR Code - Team ${team.teamId}`,
          html: htmlContent,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.id };
      } else {
        console.error('Resend API Error:', data);
        return { success: false, error: data.message || 'Resend Email Failed' };
      }
    } catch (err: any) {
      console.error('Resend fetch error:', err);
    }
  }

  // METHOD 2: Nodemailer Gmail SMTP
  const smtpUser = process.env.SMTP_USER || '';
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
  const smtpPass = rawPass.replace(/\s+/g, ''); // Strip spaces automatically

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"INFINIX'26 Organizers" <${smtpUser}>`,
        to: team.leaderEmail,
        subject: `[INFINIX'26] Registration Verified & Check-in QR Code - Team ${team.teamId}`,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    } catch (e: any) {
      console.error('SMTP Email send error:', e);
      return {
        success: false,
        error: `Gmail BadCredentials (535): Ensure 2-Step Verification is ON in Google, generate a 16-character App Password, and paste it into SMTP_PASS without normal password.`,
      };
    }
  }

  return {
    success: false,
    error: 'No Email Provider Configured. Add RESEND_API_KEY or SMTP_USER & SMTP_PASS in Vercel Environment Variables.',
  };
}
