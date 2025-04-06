'use client';

import { useState } from 'react';

export default function SymptomChecker() {
  const [input, setInput] = useState(''); // User input
  const [response, setResponse] = useState(''); // API response
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    setLoading(true); // Set loading state
    setResponse(''); // Clear previous response

    try {
      // Send user input to the /api/gemini endpoint
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }), // Send user input in the request body
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error from API:', errorData.error);
        setResponse('Failed to fetch response from the API.');
      } else {
        const data = await res.json();
        setResponse(data.contents?.[0]?.parts?.[0]?.text || 'No response'); // Extract response text
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setResponse('An error occurred while fetching the response.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">✨ Symptom Checker ✨</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          rows={4}
          className="border rounded p-2"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)} // Update input state
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={loading} // Disable button while loading
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
