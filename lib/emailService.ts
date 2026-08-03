import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Team } from './portalState';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendStudentWelcomeEmail(team: Team): Promise<EmailResult> {
  const teamIdClean = team.teamId.trim();
  const publicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(teamIdClean)}`;

  // Generate PNG Buffer for Nodemailer CID Inline Attachment (Gmail / Outlook 100% compatible)
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer(teamIdClean, {
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch (err) {
    console.error('Failed to generate QR buffer:', err);
  }

  // Plain Text Version (CRITICAL to prevent Gmail Spam classification)
  const textContent = `
INFINIX'26 HACKATHON — REGISTRATION VERIFIED

Dear Team Leader ${team.leaderName} (${team.teamName}),

Your registration for INFINIX'26 Hackathon at Ramco Institute of Technology has been verified.

YOUR CREDENTIALS:
- Team ID: ${team.teamId}
- Student Portal Password: ${team.password || 'hackathon2026'}
- Student Portal URL: https://infinix26.ritrjpm.ac.in/student/login

REPORTING DETAILS:
- College & Department: ${team.college} (${team.department})
- Reporting Venue: Auditorium Hall, RIT Campus
- Date & Time: September 10, 2026 @ 08:30 AM IST

Check-in QR Code Image: ${publicQrUrl}

Please present your Team ID and QR Code at the registration desk upon arrival.

Helpline: infinix26@ritrjpm.ac.in | +91 63748 47027
Ramco Institute of Technology
`.trim();

  // HTML Template using CID attachment with public URL fallback for Gmail compatibility
  const buildHtmlContent = (qrImgSrc: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>INFINIX'26 Registration Pass</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #030712; padding: 24px; text-align: center;">
              <h1 style="color: #00D9FF; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: 2px;">INFINIX'26</h1>
              <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">National Level Hackathon • Ramco Institute of Technology</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 16px; margin-top: 0;">Dear <strong>${team.leaderName}</strong> (${team.teamName}),</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Your team registration for <strong>INFINIX'26 Hackathon</strong> is verified. Below are your login credentials and check-in QR pass.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin: 16px 0; padding: 16px;">
                <tr>
                  <td style="padding: 6px 12px;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Team ID</div>
                    <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 2px;">${team.teamId}</div>
                  </td>
                  <td style="padding: 6px 12px; text-align: right;">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Portal Password</div>
                    <div style="font-size: 18px; font-weight: bold; color: #0284c7; font-family: monospace; margin-top: 2px;">${team.password || 'hackathon2026'}</div>
                  </td>
                </tr>
              </table>

              <!-- QR Code Section -->
              <div style="text-align: center; background: #fafafa; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="font-size: 12px; font-weight: bold; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">📱 OFFICIAL CHECK-IN QR CODE</div>
                <img src="${qrImgSrc}" alt="Team QR Code Pass" width="220" height="220" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #cbd5e1;" />
                <p style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500;">
                  Show this QR Code at the registration desk upon arriving at RIT campus for instant check-in.
                </p>
              </div>

              <!-- Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="font-size: 13px; color: #64748b;">College:</strong>
                    <div style="font-size: 14px; color: #0f172a;">${team.college} (${team.department})</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="font-size: 13px; color: #64748b;">Reporting Venue:</strong>
                    <div style="font-size: 14px; color: #0f172a;">Auditorium Hall, RIT Campus</div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; margin-bottom: 8px;"><strong>Instructions:</strong></p>
              <ul style="font-size: 13px; color: #334155; padding-left: 20px; line-height: 1.6;">
                <li>Login to student portal at <a href="https://infinix26.ritrjpm.ac.in/student/login" style="color: #0284c7; font-weight: bold;">/student/login</a> using your Team ID & Password.</li>
                <li>Bring your official College ID Cards and laptops.</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Support Helpline: infinix26@ritrjpm.ac.in | +91 63748 47027<br />
              © 2026 Ramco Institute of Technology. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // METHOD 1: Resend API
  const resendApiKey = process.env.RESEND_API_KEY || '';
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'INFINIX26 Organizers <onboarding@resend.dev>',
          to: [team.leaderEmail],
          subject: `[INFINIX'26] Registration Verified & Check-in Pass - Team ${team.teamId}`,
          text: textContent,
          html: buildHtmlContent(publicQrUrl),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.id };
      } else {
        console.error('Resend API Error:', data);
      }
    } catch (err: any) {
      console.error('Resend fetch error:', err);
    }
  }

  // METHOD 2: Nodemailer (SMTP / Gmail Transporter)
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
  const smtpPass = rawPass.replace(/\s+/g, '').trim();

  if (smtpUser && smtpPass) {
    const isGmail = smtpUser.toLowerCase().includes('gmail.com');
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
    );

    try {
      const mailOptions: any = {
        from: `"INFINIX'26 Organizers" <${smtpUser}>`,
        to: team.leaderEmail,
        subject: `[INFINIX'26] Registration Verified & Check-in Pass - Team ${team.teamId}`,
        text: textContent,
        html: buildHtmlContent(qrBuffer ? 'cid:qrcode@infinix26' : publicQrUrl),
      };

      // Add CID inline image attachment if QR Buffer was generated
      if (qrBuffer) {
        mailOptions.attachments = [
          {
            filename: 'qrcode.png',
            content: qrBuffer,
            cid: 'qrcode@infinix26', // matches src="cid:qrcode@infinix26"
          },
        ];
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Nodemailer to:', team.leaderEmail, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (e: any) {
      console.error('SMTP Email send error:', e);
      return {
        success: false,
        error: `Gmail error: ${e.message || 'SMTP failed'}`,
      };
    }
  }

  return {
    success: false,
    error: 'No Email Provider Configured. Add SMTP_USER & SMTP_PASS in Environment Variables.',
  };
}
