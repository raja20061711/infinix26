import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CREDENTIALS_FILE = path.join(process.cwd(), 'admin_credentials.json');

declare global {
  var infinix_admin_email: string | undefined;
  var infinix_admin_pass: string | undefined;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (globalThis.infinix_admin_email && globalThis.infinix_admin_pass) {
      return NextResponse.json({
        success: true,
        email: globalThis.infinix_admin_email,
        password: globalThis.infinix_admin_pass,
      });
    }

    if (fs.existsSync(CREDENTIALS_FILE)) {
      const content = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.email && parsed.password) {
        globalThis.infinix_admin_email = parsed.email.trim().toLowerCase();
        globalThis.infinix_admin_pass = parsed.password.trim();

        return NextResponse.json({
          success: true,
          email: globalThis.infinix_admin_email,
          password: globalThis.infinix_admin_pass,
        });
      }
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    email: globalThis.infinix_admin_email || 'admininfinixrit@gmail.com',
    password: globalThis.infinix_admin_pass || 'Infinix#Admin2026',
    isDefault: !globalThis.infinix_admin_pass,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and Password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    globalThis.infinix_admin_email = cleanEmail;
    globalThis.infinix_admin_pass = cleanPass;

    try {
      fs.writeFileSync(
        CREDENTIALS_FILE,
        JSON.stringify({ email: cleanEmail, password: cleanPass, updatedAt: new Date().toISOString() })
      );
    } catch (err) {}

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'Admin credentials updated successfully on server! Only your new password can unlock the portal.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
