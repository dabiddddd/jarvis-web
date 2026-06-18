import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { streamChat } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.slice(0, 100),
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    });

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit history
    });

    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          for await (const chunk of streamChat(messages)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
            );
          }

          // Save assistant message
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: fullResponse,
              conversationId: conversation.id,
            },
          });

          // Update conversation title if first message
          if (history.length <= 1) {
            const title = message.slice(0, 100);
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { title },
            });
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`
            )
          );
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
