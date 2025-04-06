import {NextResponse} from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const systemInstruction = process.env.SYSTEM_INSTRUCTION;

export async function POST(req) {
  const data = await req.json(); //User Prompt
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 1.6,
    },
  });
  const chat = model.startChat({ history: data.chatHistory });
  
  const responseStream = await chat.sendMessageStream(data.prompt);
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream.stream) {
        const content = chunk.text();
        controller.enqueue(content); //Create a Readable ResponseStream
      }
      controller.close();
    }
  });
  
  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
  
}