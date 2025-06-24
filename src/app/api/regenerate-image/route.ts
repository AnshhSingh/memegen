import { NextRequest } from 'next/server';
import { generateImage } from '@/lib/imageGen';
import { checkRateLimit, incrementRateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const customEncode = (data: any) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (progress: number, status: string, data?: any) => {
    await writer.write(
      customEncode({
        progress,
        status,
        ...data
      })
    );
  };

  (async () => {    try {
      const { prompt, size = '1024x1024' } = await request.json();
      
      // Get client IP address
      const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
      
      // Check rate limit before proceeding
      const rateLimit = checkRateLimit(ip);
      if (rateLimit.isBlocked) {
        await send(100, 'Error', {
          error: `Rate limit exceeded. You can generate ${rateLimit.limit} memes per day.`,
          rateLimit
        });
        await writer.close();
        return;
      }
      
      if (!prompt) {
        await send(100, 'Error', { error: 'No prompt provided' });
        await writer.close();
        return;
      }

      await send(0, 'Starting image generation...');

      let images;
      let usedRevisedPrompt = false;
      
      try {
        await send(30, 'Creating meme image...');
        images = await generateImage({      prompt,
      size
        });      } catch (imageError) {
        if (imageError instanceof Error && (
          imageError.message.includes('content_policy_violation') || 
          imageError.message.includes('Content filter triggered')
        )) {
          await send(50, 'Revising prompt for safety...');
          const revisedPrompt = `Create a family-friendly, non-controversial meme image: ${prompt}`;
          usedRevisedPrompt = true;
          
          images = await generateImage({
            prompt: revisedPrompt,
            size: '1024x1024'
          });
        } else {
          throw imageError;
        }
      }

      if (!images || images.length === 0) {
        await send(100, 'Error', { error: 'Failed to generate images' });
        await writer.close();
        return;
      }      const updatedRateLimit = incrementRateLimit(ip);
      await send(100, 'Complete!', {
        prompt,
        imageUrls: images,
        usedRevisedPrompt,
        rateLimit: updatedRateLimit
      });

    } catch (error) {
      console.error('Image regeneration error:', error);
      await send(100, 'Error', { 
        error: error instanceof Error ? error.message : 'Failed to generate image'
      });
    }
    await writer.close();
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
