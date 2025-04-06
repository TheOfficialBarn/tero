export { maxDuration, POST };const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Load the API key from environment variables
const MODEL_ID = 'gemini-2.5-pro-preview-03-25'; // Model ID
const GENERATE_CONTENT_API = 'streamGenerateContent'; // API endpoint

async function POST(req) {
  try {
    const body = await req.json();
    const userInput = body.input || 'Default input text'; // Get user input from the request body

    // Construct the request payload
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userInput,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'text/plain',
      },
    };

    // Make the POST request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    // Handle the response
    if (!response.ok) {
      const error = await response.json();
      console.error('Error from Gemini API:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch response from Gemini API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { POST };