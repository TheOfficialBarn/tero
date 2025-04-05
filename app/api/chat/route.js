import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
const maxDuration = 30;

async function POST(req) {
  const body = await req.json();
  const messages = body.messages;

  // THis is not correct code, but I need this to deploy on Vercel
  const result = streamText({
    model: google('a google model goes here'),
    system: 'You are a helpful assistant.',
    messages: messages,
  });

  return result.toDataStreamResponse();
}

export { maxDuration, POST };