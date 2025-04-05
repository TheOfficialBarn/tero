'use client'
import { Inter } from "next/font/google";
import { useChat } from '@ai-sdk/google';

// For the AI ChatBot Ofc 😍


const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export function SymptomChecker() {
	const { messages, input, handleInputChange, handleSubmit } = useChat({});
	
	return (
		<>
			<div className="bg-[rgba(130,130,130,0.5)] rounded-3xl p-6 m-2 flex flex-col items-center justify-center w-full h-5/8">
				<h3 className={`text-white text-3xl font-bold mb-4 ${inter.variable}`}>✨ Symptom Chat ✨</h3>
				<div className="w-full max-h-96 overflow-y-auto">
					{messages.map((message, index) => (
						<div key={index} className="mb-4">
							<span className="font-bold">
								{message.role === "user" ? "User: " : "AI: "}
							</span>
							{message.content}
						</div>
					))}
				</div>
				<form onSubmit={handleSubmit} className="w-full flex items-center mt-4">
					<input
						type="text"
						value={input}
						onChange={handleInputChange}
						placeholder="Type your symptoms..."
						className="flex-1 px-4 py-2 border rounded-md"
					/>
					<button
						type="submit"
						className="ml-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
					>
						Send
					</button>
				</form>
			</div>
		</>
	);
}