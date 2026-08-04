import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Team } from './portalState';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/J77QEl8Iig7DdeaAVYmu8A?s=cl&p=a&ilr=1';

function getAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && envUrl.trim()) {
    let url = envUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://infinix26.ritrjpm.ac.in';
}

export async function sendStudentWelcomeEmail(team: Team): Promise<EmailResult> {
  const teamIdClean = team.teamId.trim();
  const publicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(teamIdClean)}`;
  const baseUrl = getAppBaseUrl();
  const studentLoginUrl = `${baseUrl}/student/login`;

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
INFINIX'26 HACKATHON — REGISTRATION RECEIVED

Dear Team Leader ${team.leaderName} (${team.teamName}),

Your registration for INFINIX'26 Hackathon at Ramco Institute of Technology has been successfully received.

YOUR CREDENTIALS:
- Team ID: ${team.teamId}
- Student Portal Password: ${team.password || 'hackathon2026'}
- Student Portal URL: ${studentLoginUrl}

IMPORTANT — JOIN OFFICIAL WHATSAPP COMMUNITY:
Please join our official INFINIX'26 WhatsApp Community for instant announcements, schedule updates & participant coordination:
${WHATSAPP_COMMUNITY_URL}

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
        <title>INFINIX'26 Official Registration & Venue Pass</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #040914; color: #e2e8f0; margin: 0; padding: 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background: #0b1329; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 50px rgba(0, 217, 255, 0.15);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #020d1e 0%, #061833 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #00D9FF;">
              <div style="display: inline-block; padding: 4px 14px; background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 20px; color: #7CE7FF; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                OFFICIAL REGISTRATION PASS
              </div>
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 900; letter-spacing: 3px; font-family: 'Arial Black', sans-serif;">
                INFINIX<span style="color: #00D9FF;">'26</span>
              </h1>
              <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                32-Hours National Level Hackathon • Ramco Institute of Technology
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 17px; margin-top: 0; color: #ffffff;">Dear <strong>${team.leaderName}</strong>,</p>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
                Welcome to <strong>INFINIX'26 Hackathon</strong>! Your team registration for <strong style="color: #7CE7FF;">${team.teamName}</strong> has been successfully registered. Below are your official Team Credentials and Entry Pass.
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #040c1a; border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 12px; margin: 20px 0; padding: 18px;">
                <tr>
                  <td style="padding: 6px 12px;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">TEAM ID</div>
                    <div style="font-size: 22px; font-weight: 900; color: #00D9FF; letter-spacing: 1px; margin-top: 2px;">${team.teamId}</div>
                  </td>
                  <td style="padding: 6px 12px; text-align: right;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">PORTAL PASSWORD</div>
                    <div style="font-size: 18px; font-weight: 800; color: #38bdf8; font-family: monospace; margin-top: 2px; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 6px; display: inline-block;">${team.password || 'hackathon2026'}</div>
                  </td>
                </tr>
              </table>

              <!-- WhatsApp Community Box -->
              <div style="background: linear-gradient(135deg, #092e20 0%, #061c14 100%); border: 1px solid #25D366; border-radius: 14px; padding: 20px; margin: 24px 0; text-align: center; box-shadow: 0 0 25px rgba(37, 211, 102, 0.2);">
                <div style="font-size: 11px; font-weight: 900; color: #25D366; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                  💬 MANDATORY STEP — JOIN WHATSAPP COMMUNITY
                </div>
                <p style="color: #e2e8f0; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5;">
                  All registered team leaders and members are requested to join the official <strong>INFINIX'26 WhatsApp Community</strong> for live announcements, schedule updates, and instant support.
                </p>
                <a href="${WHATSAPP_COMMUNITY_URL}" style="background: #25D366; color: #040914; font-weight: 900; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 30px; display: inline-block; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 0 20px rgba(37, 211, 102, 0.4);">
                  👉 JOIN WHATSAPP COMMUNITY NOW
                </a>
              </div>

              <!-- QR Code Desk Pass -->
              <div style="text-align: center; background: #061124; border: 2px dashed rgba(0, 217, 255, 0.4); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <div style="font-size: 12px; font-weight: 800; color: #00D9FF; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;">
                  📱 OFFICIAL VENUE CHECK-IN QR PASS
                </div>
                <img src="${qrImgSrc}" alt="Team QR Code Pass" width="210" height="210" style="display: block; margin: 0 auto; border-radius: 12px; border: 3px solid #00D9FF; padding: 8px; background: #ffffff;" />
                <p style="font-size: 12px; color: #cbd5e1; margin-top: 14px; font-weight: 600; line-height: 1.4;">
                  Please present this QR Code at the registration desk upon arriving at RIT campus for instant check-in.
                </p>
              </div>

              <!-- Team Roster Box -->
              <div style="margin: 24px 0;">
                <h3 style="font-size: 13px; font-weight: 800; color: #7CE7FF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                  👥 REGISTERED TEAM ROSTER (${(team.members?.length || 0) + 1} MEMBERS)
                </h3>
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #040c1a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; font-size: 12px;">
                  <thead>
                    <tr style="background: #020712; color: #64748b; text-align: left; text-transform: uppercase; font-size: 10px;">
                      <th style="padding: 10px 12px;">Participant Name</th>
                      <th style="padding: 10px 12px;">College & Department</th>
                      <th style="padding: 10px 12px;">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #0f172a;">
                      <td style="padding: 10px 12px; color: #ffffff; font-weight: 700;">${team.leaderName}</td>
                      <td style="padding: 10px 12px; color: #94a3b8;">${team.college} (${team.department})</td>
                      <td style="padding: 10px 12px;"><span style="background: rgba(0, 217, 255, 0.2); color: #00D9FF; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 10px;">LEADER</span></td>
                    </tr>
                    ${(team.members || []).map((m: any, idx: number) => `
                      <tr style="border-bottom: 1px solid #0f172a;">
                        <td style="padding: 10px 12px; color: #e2e8f0;">${m.name}</td>
                        <td style="padding: 10px 12px; color: #94a3b8;">${m.college || team.college} (${m.department || team.department})</td>
                        <td style="padding: 10px 12px;"><span style="background: #1e293b; color: #cbd5e1; padding: 2px 8px; border-radius: 4px; font-size: 10px;">MEMBER ${idx + 2}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Key Event Info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #040c1a; border-radius: 10px; padding: 16px; margin: 20px 0; border: 1px solid #1e293b;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">
                    🗓️ <strong style="color: #ffffff;">Date & Time:</strong> September 10-11, 2026 @ 08:30 AM IST
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">
                    📍 <strong style="color: #ffffff;">Reporting Venue:</strong> Auditorium Hall, Ramco Institute of Technology, Rajapalayam
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">
                    🏠 <strong style="color: #ffffff;">Accommodation:</strong> ${team.accommodationRequired ? 'Hostel Stay Requested ✅' : 'Not Requested'}
                  </td>
                </tr>
              </table>

              <!-- Student Portal CTA Button -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${studentLoginUrl}" style="background: linear-gradient(90deg, #00D9FF 0%, #38bdf8 100%); color: #040914; font-weight: 900; font-size: 13px; text-decoration: none; padding: 14px 32px; border-radius: 30px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 0 25px rgba(0, 217, 255, 0.4);">
                  LOG IN TO STUDENT PORTAL
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #020712; padding: 20px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: 600;">
                📞 Support Helpline: <a href="mailto:infinix26@ritrjpm.ac.in" style="color: #00D9FF; text-decoration: none;">infinix26@ritrjpm.ac.in</a> | +91 63748 47027
              </p>
              © 2026 Ramco Institute of Technology, Rajapalayam. All rights reserved.
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
          subject: `[INFINIX'26] Registration Pass & WhatsApp Community - Team ${team.teamId}`,
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
  const smtpUser = (process.env.SMTP_USER && !process.env.SMTP_USER.includes('infinix.itrit26') ? process.env.SMTP_USER : 'admininfinixrit@gmail.com').trim();
  const smtpPass = (process.env.SMTP_PASS && process.env.SMTP_PASS.includes(' ') ? process.env.SMTP_PASS : 'ztqn kbcj utfu udbr').trim();

  console.log(`[Email Service Debug] Using smtpUser: "${smtpUser}" | smtpPass: "${smtpPass}"`);

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
        subject: `[INFINIX'26] Registration Pass & WhatsApp Community - Team ${team.teamId}`,
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

/**
 * Sends an Admin notification email whenever a new team registers for INFINIX'26
 */
export async function sendAdminNotificationEmail(newTeam: any): Promise<EmailResult> {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admininfinixrit@gmail.com').trim();
  const smtpUser = (process.env.SMTP_USER && !process.env.SMTP_USER.includes('infinix.itrit26') ? process.env.SMTP_USER : 'admininfinixrit@gmail.com').trim();
  const smtpPass = (process.env.SMTP_PASS && process.env.SMTP_PASS.includes(' ') ? process.env.SMTP_PASS : 'ztqn kbcj utfu udbr').trim();

  const baseUrl = getAppBaseUrl();
  const adminDashboardUrl = `${baseUrl}/admin/dashboard`;

  const members: any[] = newTeam.members || [];
  const membersText = members.map((m, i) => `  - Member ${i + 2}: ${m.name} (${m.email || 'No email'}) | Phone: ${m.phone || 'N/A'}`).join('\n');

  const textContent = `
🚨 NEW REGISTRATION ALERT — INFINIX'26

A new team has registered on the website!

TEAM SUMMARY:
- Team Name: ${newTeam.team_name}
- Team ID: ${newTeam.team_id}
- Password: ${newTeam.password_hash}
- Fee Amount: ₹${newTeam.payment_amount}
- UPI UTR / Ref ID: ${newTeam.upi_transaction_id}

LEADER DETAILS:
- Leader Name: ${newTeam.leader_name}
- Email: ${newTeam.leader_email}
- Phone: ${newTeam.leader_phone}
- College: ${newTeam.college}
- Department: ${newTeam.department}
- Year: ${newTeam.year_of_study || 'N/A'}
- Roll No: ${newTeam.roll_number || 'N/A'}

TEAM MEMBERS (${members.length + 1} total):
${membersText || '  (No additional members specified)'}

LOGISTICS:
- Accommodation Requested: ${newTeam.accommodation_required ? 'YES' : 'NO'}

Direct Dashboard Link: ${adminDashboardUrl}
`.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #040914; color: #e2e8f0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #0b1329; border: 1px solid #00D9FF; border-radius: 12px; padding: 24px;">
          <div style="background: rgba(0, 217, 255, 0.1); border-left: 4px solid #00D9FF; padding: 12px; margin-bottom: 20px;">
            <h2 style="color: #00D9FF; margin: 0; font-size: 20px;">🚨 NEW TEAM REGISTRATION RECEIVED</h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">INFINIX'26 Hackathon Admin Notification</p>
          </div>

          <table width="100%" cellpadding="8" cellspacing="0" style="background: #060b13; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 20px; font-size: 13px;">
            <tr><td style="color: #94a3b8;">Team Name:</td><td style="color: #ffffff; font-weight: bold;">${newTeam.team_name}</td></tr>
            <tr><td style="color: #94a3b8;">Team ID:</td><td style="color: #00D9FF; font-weight: bold;">${newTeam.team_id}</td></tr>
            <tr><td style="color: #94a3b8;">Payment Amount:</td><td style="color: #4ade80; font-weight: bold;">₹${newTeam.payment_amount}</td></tr>
            <tr><td style="color: #94a3b8;">UPI UTR / Ref ID:</td><td style="color: #38bdf8; font-family: monospace;">${newTeam.upi_transaction_id}</td></tr>
            <tr><td style="color: #94a3b8;">Team Leader:</td><td style="color: #ffffff;">${newTeam.leader_name} (${newTeam.leader_email})</td></tr>
            <tr><td style="color: #94a3b8;">Leader Phone:</td><td style="color: #ffffff;">${newTeam.leader_phone}</td></tr>
            <tr><td style="color: #94a3b8;">College & Dept:</td><td style="color: #ffffff;">${newTeam.college} (${newTeam.department})</td></tr>
            <tr><td style="color: #94a3b8;">Total Team Size:</td><td style="color: #ffffff;">${members.length + 1} Members</td></tr>
            <tr><td style="color: #94a3b8;">Accommodation Stay:</td><td style="color: #ffffff;">${newTeam.accommodation_required ? 'Yes ✅' : 'No ❌'}</td></tr>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${adminDashboardUrl}" style="background: #00D9FF; color: #040914; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 20px; display: inline-block;">
              OPEN ADMIN DASHBOARD
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  if (smtpUser && smtpPass) {
    const isGmail = smtpUser.toLowerCase().includes('gmail.com');
    const transporter = nodemailer.createTransport(
      isGmail
        ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: { user: smtpUser, pass: smtpPass },
          }
    );

    try {
      const info = await transporter.sendMail({
        from: `"INFINIX'26 Registration System" <${smtpUser}>`,
        to: adminEmail,
        subject: `🚨 [NEW REGISTRATION] Team ${newTeam.team_name} (${newTeam.team_id}) - ₹${newTeam.payment_amount}`,
        text: textContent,
        html: htmlContent,
      });
      console.log('✅ Admin notification email sent to:', adminEmail, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (e: any) {
      console.error('Failed to send admin notification email:', e);
      return { success: false, error: e.message };
    }
  }

  return { success: false, error: 'No email credentials for admin notification' };
}

