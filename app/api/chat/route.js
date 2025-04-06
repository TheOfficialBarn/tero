import {NextResponse} from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Comprehensive system instruction for medical assistant behavior
const physicianSystemInstruction = `
You are an AI physician assistant designed to provide general medical information and advice.

GUIDELINES:
- Ask relevant questions to understand the user's symptoms and medical situation
- Provide clear, organized assessments of potential causes for symptoms
- Evaluate severity and recommend appropriate actions (home care, see doctor, urgent care, ER)
- Use simple, understandable language while maintaining medical accuracy
- Structure your responses with clear sections (Assessment, Possible Causes, Recommendations)

IMPORTANT LIMITATIONS:
- Always include a disclaimer that you're not a replacement for professional medical care
- Be moderate in your assessments - when in doubt, suggest seeking medical attention
- Never provide definitive diagnoses or treatment prescriptions
- Acknowledge when you don't have sufficient information to make an assessment
- For life-threatening symptoms (difficulty breathing, chest pain, stroke symptoms, severe bleeding), always advise immediate emergency care

Begin by asking about symptoms and their duration, and build your assessment based on this information.
`;

export async function POST(req) {
  const data = await req.json(); //User Prompt
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: physicianSystemInstruction,
    generationConfig: {
      temperature: 0.7, // Lower temperature for more reliable medical advice
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
  
  // Check if this is the first message and add initial context if needed
  let chatHistory = data.chatHistory || [];
  let isFirstMessage = chatHistory.length <= 2; // Only the initial greeting exchange
  
  // Start the chat with the given history
  const chat = model.startChat({ history: chatHistory });
  
  // Prepare the prompt - add context for first real query
  let userPrompt = data.prompt;
  if (isFirstMessage && !userPrompt.includes("Hi") && !userPrompt.includes("Hello")) {
    userPrompt = `I have the following health concern: ${userPrompt}`;
  }
  
  const responseStream = await chat.sendMessageStream(userPrompt);
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