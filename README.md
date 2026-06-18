# Jarvis Web

Your personal AI assistant, accessible from anywhere.

## Features

- Chat with AI (streaming responses)
- File browser and editor (Monaco)
- Terminal access
- Authentication
- Conversation history

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

3. Initialize database:
```bash
npx prisma db push
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Environment Variables

- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_SECRET` - Random string for session encryption
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `LLM_PROVIDER` - anthropic, openai, or groq
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `OPENAI_API_KEY` - Your OpenAI API key
- `GROQ_API_KEY` - Your Groq API key (free)

## Deploy to Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login:
```bash
fly auth login
```

3. Launch app:
```bash
fly launch
```

4. Set secrets:
```bash
fly secrets set NEXTAUTH_SECRET=your-secret-here
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
# or
fly secrets set GROQ_API_KEY=gsk_...
```

5. Deploy:
```bash
fly deploy
```

## Free Hosting Options

### Oracle Cloud (Always Free)
- 4 OCPU, 24GB RAM
- Full VM with root access
- Sign up: https://cloud.oracle.com

### Fly.io (Free Tier)
- 3 shared VMs, 160GB bandwidth/month
- Easy deployment
- Sign up: https://fly.io

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js
- Monaco Editor
- React Markdown
