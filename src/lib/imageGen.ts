if (!process.env.AZURE_API_KEY || !process.env.AZURE_ENDPOINT || !process.env.AZURE_API_VERSION) {
  throw new Error('Azure OpenAI environment variables are not configured');
}

interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
}

export async function generateImage(options: ImageGenerationOptions): Promise<string[]> {
  try {    const response = await fetch(
      `${process.env.AZURE_ENDPOINT}?api-version=${process.env.AZURE_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AZURE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: options.prompt,
          n: 1,
          size: options.size || '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }),
      }
    );    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error('Azure OpenAI Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });

      if (response.status === 400) {
        throw new Error('Content filter triggered: The prompt may contain inappropriate or offensive content. Try modifying your prompt to be more family-friendly.');
      }

      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.data || !result.data.length) {
      throw new Error('No image was generated');
    }

    // Return the image URLs
    return result.data.map((item: { url: string }) => item.url);
  } catch (error) {
    console.error('Image generation error:', error);
    throw error instanceof Error
      ? error
      : new Error('Unknown error during image generation');
  }
}
