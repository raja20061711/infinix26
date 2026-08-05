import { NextResponse } from 'next/server';
import { isRegistrationOpen, setRegistrationOpen } from '@/lib/registrationSettings';

export async function GET() {
  const isOpen = await isRegistrationOpen();
  return NextResponse.json({ success: true, isOpen });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { isOpen } = body;

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isOpen parameter must be a boolean (true or false).' },
        { status: 400 }
      );
    }

    const updatedStatus = await setRegistrationOpen(isOpen);
    return NextResponse.json({
      success: true,
      isOpen: updatedStatus,
      message: updatedStatus
        ? 'Registration successfully activated and opened.'
        : 'Registration successfully paused and stopped.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
