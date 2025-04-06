'use client'
// import { Inter } from "next/font/google";
// import { useChat } from 'ai-sdk/google';
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

// export function SymptomChecker() {
// 	const { messages, input, handleInputChange, handleSubmit } = useChat({});
	
// 	return (
// 		<>
// 			<div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 m-2 flex flex-col items-center justify-center w-full h-5/8">
// 				<h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}>✨ Symptom Chat ✨</h3>
// 				<div className="w-full max-h-96 overflow-y-auto">
// 					{messages.map((message, index) => (
// 						<div key={index} className="mb-4">
// 							<span className="font-bold">
// 								{message.role === "user" ? "User: " : "AI: "}
// 							</span>
// 							{message.content}
// 						</div>
// 					))}
// 				</div>
// 				<form onSubmit={handleSubmit} className="w-full flex items-center mt-4">
// 					<input
// 						type="text"
// 						value={input}
// 						onChange={handleInputChange}
// 						placeholder="Type your symptoms..."
// 						className="flex-1 px-4 py-2 border rounded-md"
// 					/>
// 					<button
// 						type="submit"
// 						className="ml-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
// 					>
// 						Send
// 					</button>
// 				</form>
// 			</div>
// 		</>
// 	);
// }

// GeminiChat.jsx
import { useState } from 'react';

export default function GeminiChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setResponse(data.output || 'No response');
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          rows={4}
          className="border rounded p-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
