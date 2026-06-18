import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listFiles, readFile, writeFile, deleteFile } from '@/lib/executor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const filePath = searchParams.get('path') || '';

    if (action === 'list') {
      const files = await listFiles(filePath);
      return NextResponse.json({ files });
    }

    if (action === 'read') {
      if (!filePath) {
        return NextResponse.json({ error: 'Path required' }, { status: 400 });
      }
      const content = await readFile(filePath);
      return NextResponse.json({ content, path: filePath });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, path: filePath, content } = await req.json();

    if (action === 'write') {
      if (!filePath || content === undefined) {
        return NextResponse.json(
          { error: 'Path and content required' },
          { status: 400 }
        );
      }
      await writeFile(filePath, content);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (!filePath) {
        return NextResponse.json({ error: 'Path required' }, { status: 400 });
      }
      await deleteFile(filePath);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
