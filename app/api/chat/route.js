import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
const maxDuration = 30;

async function POST(req) {
  const body = await req.json();
  const messages = body.messages;

  const result = await streamText({
    model: google('gemini-1'),
    system: 'You are a helpful assistant.',
    messages: messages,
  });

  return result.toDataStreamResponse();
}


export { maxDuration, POST };