"use client";
import { useEffect, useState } from "react";

function ChatContainer({ messages, chatbotIsTyping }) {
  return (
    <div>
      {messages.map((message,index) => (
        <div key={index}>
          <strong>{message.role}:</strong> {message.parts.map(part => part.text).join(' ')}
        </div>
      ))}
      <div hidden={!chatbotIsTyping}>Chatbot is typing...</div>
    </div>
  );
}

export function SymptomChecker() {
  // Replace localStorage initialization with empty array
  const [chatHistory, setChatHistory] = useState([]);
  const [chatbotIsTyping, setChatbotIsTyping] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const getChatbotResponse = async (updatedChatHistory) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChatHistory),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setChatbotIsTyping(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let result = "";

      while(!done){
        const chunk = await reader.read();
        done = chunk.done;
        result += decoder.decode(chunk.value, { stream: !done });
      }
      console.log("Chatbot response:", result);
      return result;
    } catch (error) {
      console.error("Error reading response:", error);
    } finally {
      setChatbotIsTyping(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Format user message correctly
    const newMessage = { role: "user", parts: [{ text: userMessage }] };
    // Update chat history and ensure latest messages are sent to the server
    const updatedChatHistory = [...chatHistory, newMessage];
    setChatHistory(updatedChatHistory);
    getChatbotResponse(updatedChatHistory).then((chatbotResponse) => {
      const chatbotMessage = { role: "chatbot", parts: [{ text: chatbotResponse }]};
      setChatHistory([...updatedChatHistory, chatbotMessage]);
    });

    setUserMessage("");
    event.target.reset();
  };

  const handleTextChange = (event) => {
    setUserMessage(event.target.value);
  };

  return(
    <div>
      <ChatContainer messages={chatHistory} chatbotIsTyping={chatbotIsTyping} />
      <form onSubmit={handleSubmit}>
        <input type="text" name="message" placeholder="Type your message here" onChange={handleTextChange} value={userMessage} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}