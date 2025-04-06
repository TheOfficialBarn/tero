"use client"

import { useState, useRef, useEffect } from "react";

import { Inter } from "next/font/google";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export function SymptomChecker() {
  
  const [prompt, setPrompt] = useState('');
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const scrollToEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    {
      "role": "user",
      "parts": [{ "text": "Hello! " }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Great to meet you. I am Tero M.D. Your AI Physician! How may I assist you?" }]
    },
  ]);

  async function handleSendMessage(e) {
    e.preventDefault();
    
    if(prompt.trim() === '')
      return; //Empty Prompt
    if(isResponseLoading)
      return; //First wait for the Response

    const historyWithUserPrompt = [...chatHistory, {role:'user', parts:[{text:prompt}]} ];
    const modelMessage = {role:'model', parts:[{ text:'' }]};
    setChatHistory([...historyWithUserPrompt, modelMessage]); 
    setPrompt('');
    
    try {
      setIsResponseLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({prompt:prompt, chatHistory:chatHistory}),
      })
      
      if(!response.ok)
        throw new Error('The Response was not OK!');

      await readAndRenderStream(response);
    }
    catch (error) {
      console.error('Fetch Response Error:', error);

      modelMessage.parts[0].text = "I'm sorry, but I encountered an error. Please try again later.";
      setChatHistory([...historyWithUserPrompt, modelMessage]);
    }
    
    setIsResponseLoading(false);
  }

  async function readAndRenderStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const charBatchSize = 4;
    let charQueue = [];
    let isRendering = false;
    
    const historyWithUserPrompt = [...chatHistory, {role:'user', parts:[{text:prompt}]} ];
    const modelMessage = {role:'model', parts:[{ text:'' }]};
    
    while(true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      
      const chunk = decoder.decode(value, { stream: true });
      const characters = chunk.split('');
      charQueue.push(...characters);

      if(!isRendering)
        renderCharacters();
    }

    function renderCharacters() {
      if (charQueue.length === 0) {
        isRendering = false;
        return;
      }
      
      isRendering = true;
      modelMessage.parts[0].text += charQueue.splice(0,charBatchSize).join('');
      setChatHistory([...historyWithUserPrompt, modelMessage]);
      
      scrollToEndRef.current.scrollTop = scrollToEndRef.current?.scrollHeight;
      requestAnimationFrame(renderCharacters);
    };
  }

  useEffect(() => {
    scrollToEndRef.current.scrollTop = scrollToEndRef.current?.scrollHeight;
  }, [chatHistory]);
  
  return (
    <section className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 flex flex-col items-center justify-center h-5/8 w-full">
      <h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}>✨ Symptom Checker ✨</h3>

      <div className="flex flex-col flex-grow max-w-2xl w-full mx-auto bg-gradient-to-b from-neutral-800/30 to-neutral-600/30 dark:from-neutral-800/90 dark:to-neutral-700/90 rounded-xl shadow-lg">
        
        <div ref={scrollToEndRef} className="flex-grow h-0 overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div key={index} className={`m-4 ${message.role==='user' ? 'text-right' : 'text-left'}`}>
              
              <p className="mb-1 mx-1 text-neutral-300">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              {message.parts.map((part, index) => (
                <div key={index} className={`rounded-xl py-3 px-4 inline-block transition-colors ${
                  message.role==='user' 
                    ? 'bg-blue-500 text-white text-left ml-8 sm:ml-20 rounded-tr-none' 
                    : 'bg-white/30 dark:bg-white/30 backdrop-blur-md text-foreground mr-8 sm:mr-20 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line">{part.text}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <form className="flex p-4 border-t-2 border-neutral-300/30 dark:border-neutral-600 items-end" onSubmit={handleSendMessage}>
          <textarea 
            className="w-full bg-white/30 dark:bg-white/10 text-foreground rounded-xl px-4 py-3 mr-2 resize-none transition-all focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={prompt}
            placeholder="Type your message..."
            onChange={(e)=>setPrompt(e.target.value)}
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              if(e.target.scrollHeight < 150) {
                e.target.style.height = `${e.target.scrollHeight + 2}px`;
                e.target.style.overflowY = 'hidden';
              }
              else {
                e.target.style.height = '150px';
                e.target.style.overflowY = 'auto';
              }
            }}
            onKeyDown={(e) => {
              if (e.key==='Enter' && !e.shiftKey) 
                handleSendMessage(e);
            }}
          />
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
            type="submit"
          >
            Send
          </button>
        </form>
      </div>

    </section>
  );
}