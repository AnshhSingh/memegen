if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || !process.env.NEXT_PUBLIC_GEMINI_API_URL) {
  throw new Error('Gemini API environment variables are not configured');
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function generateMemePrompt(newsHeadline: string, newsDescription: string): Promise<string> {
  const prompt = `Create a Gen-Z style(just make sure not to voilate DALLE content filters), creative funny meme prompt for DALL-E based on this news:

Headline: "${newsHeadline}"
Description: "${newsDescription}"

Guidelines:
- Do not trigger content filters
- Keep the amount of text for the image to a minimum as DALLE is bad in shwoing text inside images 
- dont give caption, just give the prompt
- Use a humorous and relatable tone for social media
Return only the image generation prompt, no additional text or formatting.
`;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GEMINI_API_URL}?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    // Extract the generated text from the response
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // Clean up the response - remove quotes if present and trim whitespace
    return generatedText.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('Error generating meme caption:', error);
    throw error;
  }
}
