import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { generateImage } from '@/lib/imageGen';
import { checkRateLimit, incrementRateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const customEncode = (data: any) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (progress: number, status: string, data?: any) => {
    await writer.write(customEncode({ progress, status, ...data }));
  };

  (async () => {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        await send(100, 'Error', { error: 'You must be logged in to regenerate a meme.' });
        await writer.close();
        return;
      }

      const { prompt, size = '1024x1024' } = await request.json();

      const rateLimit = checkRateLimit(user.id);
      if (rateLimit.isBlocked) {
        await send(100, 'Error', {
          error: `Rate limit exceeded. You can generate ${rateLimit.limit} memes per day.`,
          rateLimit,
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

      let dallEImages;
      let usedRevisedPrompt = false;
      let finalPrompt = prompt;

      try {
        await send(30, 'Creating meme image...');
        dallEImages = await generateImage({ prompt: finalPrompt, size });
      } catch (imageError) {
        if (imageError instanceof Error && imageError.message.includes('Content filter triggered')) {
          await send(50, 'Revising prompt for safety...');
          finalPrompt = `Create a family-friendly, non-controversial meme image: ${prompt}`;
          usedRevisedPrompt = true;

          dallEImages = await generateImage({
            prompt: finalPrompt,
            size: '1024x1024',
          });
        } else {
          throw imageError;
        }
      }

      if (!dallEImages || dallEImages.length === 0) {
        await send(100, 'Error', { error: 'Failed to generate images' });
        await writer.close();
        return;
      }

      await send(80, 'Saving image to gallery...');
      const dallEImageUrl = dallEImages[0];

      const imageResponse = await fetch(dallEImageUrl);
      const imageBlob = await imageResponse.blob();
      const imagePath = `${user.id}/${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('meme_images')
        .upload(imagePath, imageBlob);

      if (uploadError) {
        throw new Error(`Failed to save image: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage.from('meme_images').getPublicUrl(imagePath);
      
      const updatedRateLimit = incrementRateLimit(user.id);
      
      const { error: dbError } = await supabase.from('generations').insert({
        user_id: user.id,
        prompt: finalPrompt,
        image_url: publicUrl,
        used_revised_prompt: usedRevisedPrompt,
      });

      if (dbError) {
        console.error('Failed to save regeneration record:', dbError);
      }
      
      await send(100, 'Complete!', {
        prompt: finalPrompt,
        imageUrls: [publicUrl],
        usedRevisedPrompt,
        rateLimit: updatedRateLimit,
      });

    } catch (error) {
      console.error('Image regeneration error:', error);
      await send(100, 'Error', {
        error: error instanceof Error ? error.message : 'Failed to generate image',
      });
    } finally {
        await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
