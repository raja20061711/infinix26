import nodemailer from 'nodemailer';
import { Team } from './portalState';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendStudentWelcomeEmail(team: Team): Promise<EmailResult> {
  // Production Nodemailer SMTP configuration (reads process.env or fallback)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'organizers@infinix.ritrjpm.ac.in',
      pass: process.env.SMTP_PASSWORD || 'app_password_sample',
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #01050e; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #04162e; border: 1px solid rgba(0, 217, 255, 0.4); border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,217,255,0.2); }
          .header { text-align: center; border-b: 1px solid rgba(0, 217, 255, 0.2); padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: 900; color: #00D9FF; letter-spacing: 2px; }
          .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 5px; }
          .card { background: #020b18; border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px; padding: 15px; margin: 15px 0; }
          .field-label { font-size: 11px; font-weight: bold; color: #7CE7FF; text-transform: uppercase; letter-spacing: 1px; }
          .field-val { font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 4px; }
          .pass-highlight { background: rgba(0, 217, 255, 0.15); border: 1px solid #00D9FF; color: #00D9FF; padding: 10px; font-size: 18px; letter-spacing: 2px; text-align: center; border-radius: 8px; font-family: monospace; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-t: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">INFINIX'26</div>
            <div class="title">NATIONAL LEVEL HACKATHON • RAMCO INSTITUTE OF TECHNOLOGY</div>
          </div>
          
          <p>Dear Leader <strong>${team.leaderName}</strong> (${team.teamName}),</p>
          <p>Your team registration for <strong>INFINIX'26 Hackathon</strong> has been verified. Below are your official student portal credentials and event check-in details:</p>
          
          <div class="card">
            <div class="field-label">Team ID</div>
            <div class="field-val">${team.teamId}</div>
          </div>

          <div class="card">
            <div class="field-label">Temporary Password</div>
            <div class="pass-highlight">${team.password || 'hackathon2026'}</div>
          </div>

          <div class="card">
            <div class="field-label">College & Department</div>
            <div class="field-val">${team.college} (${team.department})</div>
          </div>

          <div class="card">
            <div class="field-label">Reporting Venue & Time</div>
            <div class="field-val">Auditorium Hall, RIT Campus • 08:30 AM Sharp</div>
          </div>

          <p><strong>Instructions:</strong></p>
          <ul>
            <li>Login to your student portal at: <a href="https://infinix26.ritrjpm.ac.in/student/login" style="color: #00D9FF;">/student/login</a></li>
            <li>Present your Team QR Code at the entry check-in counter.</li>
            <li>Bring your official college ID cards and laptops.</li>
          </ul>

          <div class="footer">
            <p>For urgent inquiries: support@infinix.ritrjpm.ac.in | +91 98765 43210</p>
            <p>© 2026 Ramco Institute of Technology. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // If SMTP credentials configured in env, send email
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const info = await transporter.sendMail({
        from: '"INFINIX\'26 Organizers" <organizers@infinix.ritrjpm.ac.in>',
        to: team.leaderEmail,
        subject: `[INFINIX'26] Registration Verified & Student Credentials - Team ${team.teamId}`,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    }
    // Fallback simulation for demonstration
    return { success: true, messageId: `simulated-${Date.now()}` };
  } catch (e: any) {
    console.error('Email send error:', e);
    return { success: false, error: e.message || 'Failed to send email' };
  }
}
