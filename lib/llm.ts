import { prisma } from './db';

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

const SYSTEM_PROMPT = `You are Jarvis, Tony Stark's personal AI assistant. You are helpful, concise, and professional. You have access to the user's files and can execute code. Always refer to yourself as Jarvis.

When executing code or editing files, be careful and explain what you're doing. If the user asks you to run code, do it safely and report the results.`;

export async function* streamChat(
  messages: LLMMessage[],
  options: LLMOptions = {}
): AsyncGenerator<string> {
  const provider = process.env.LLM_PROVIDER || 'anthropic';
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPT;

  const apiMessages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  if (provider === 'anthropic') {
    yield* streamAnthropic(apiMessages, options);
  } else if (provider === 'openai') {
    yield* streamOpenAI(apiMessages, options);
  } else if (provider === 'groq') {
    yield* streamGroq(apiMessages, options);
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function* streamAnthropic(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      system: messages.find((m) => m.role === 'system')?.content,
      messages: messages.filter((m) => m.role !== 'system'),
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta') {
          yield event.delta.text || '';
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function* streamOpenAI(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        const event = JSON.parse(data);
        const content = event.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function* streamGroq(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Groq API Key exists:', !!apiKey);
  console.log('Groq API Key length:', apiKey?.length);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'llama-3.3-70b-versatile',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    throw new Error(`Groq API error: ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        const event = JSON.parse(data);
        const content = event.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip malformed JSON
      }
    }
  }
}
