import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = "AIzaSyCmr1pVHCsiJrl2hq9RkNEiTHwIle8wPTo";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function POST(request) {
  try {
    const chatHistory = await request.json();
    if (!Array.isArray(chatHistory)) {
      return NextResponse.json({error:" Invalid chat history format"});
    }

    const systemInstruction = "You're an autistic";
    console.log(" Sending request to Gemini API");

    // Calling Gemini API
    const response = await model.generateContentStream({
      contents: chatHistory,
      systemInstruction: systemInstruction
    });

    console.log("RAW", response);

    if(!response || typeof response !=="object") {
      console.error("API returned invalid response", response);
      return NextResponse.json({error: "Gemini API returned an invalid response"});
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const chunk of response.stream) {
          console.log(" Chunk received:", chunk);
          if(chunk.text){
            await writer.write(encoder.encode(chunk.text() + "\n"));
          }
        }
      } catch (error) {
        console.log("Could not process Gemini API response stream:", error);
      } finally {
        writer.close();
      }
    })();
  
  return new Response(readable, {
    headers: { "Content-Type": "text/plain" }
  });
  
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.error();
  }
}