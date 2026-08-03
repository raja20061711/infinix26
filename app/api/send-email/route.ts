import { NextResponse } from 'next/server';
import { sendStudentWelcomeEmail } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team } = body;
    if (!team) {
      return NextResponse.json({ success: false, error: 'Team data is required' }, { status: 400 });
    }

    const result = await sendStudentWelcomeEmail(team);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Send Email error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
