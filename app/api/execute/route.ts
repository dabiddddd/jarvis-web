import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeCommand } from '@/lib/executor';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { command, cwd } = await req.json();

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Basic command filtering for safety
    const blocked = ['rm -rf /', 'mkfs', ':(){', 'fork', 'shutdown', 'reboot', 'halt', 'poweroff'];
    if (blocked.some((b) => command.includes(b))) {
      return NextResponse.json(
        { error: 'Command blocked for safety' },
        { status: 400 }
      );
    }

    const result = await executeCommand(command, cwd);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
