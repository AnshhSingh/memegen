import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { fetchLatestNews, type NewsCategory } from '@/lib/newsfetch';
import { generateMemePrompt } from '@/lib/gemini';
import { generateImage } from '@/lib/imageGen';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const customEncode = (data: any) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (progress: number, status: string, data?: any) => {
    await writer.write(customEncode({ progress, status, ...data }));
  };
  
  (async () => {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          }
        },
      }
    );

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        await send(100, 'Error', { error: 'You must be logged in to generate a meme.' });
        await writer.close();
        return;
      }
      
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category') as NewsCategory | undefined;
      const size = searchParams.get('size') as '1024x1024' | '1024x1792' | '1792x1024' | null;

      // Check rate limit for the authenticated user
      let rateLimit = await checkRateLimit(supabase, user.id);
      if (rateLimit.isBlocked) {
        await send(100, 'Error', { 
          error: `Rate limit exceeded. You can only generate ${rateLimit.limit} memes per day.`,
          rateLimit 
        });
        await writer.close();
        return;
      }

      // 1. Fetching news (0-25%)
      await send(0, 'Fetching latest news...');
      const newsData = await fetchLatestNews(category, 'en');
      
      if (!newsData.results || newsData.results.length === 0) {
        throw new Error('No news articles found');
      }
      const article = newsData.results[0];
      await send(25, 'News article found');

      // 2. Generate meme prompt (25-50%)
      await send(30, 'Analyzing article content...');
      let imagePrompt = await generateMemePrompt(article.title, article.description);
      
      if (!imagePrompt) {
        throw new Error('Failed to generate image prompt');
      }
      await send(50, 'Meme concept generated');

      // 3. Generate image (50-90%)
      await send(60, 'Creating meme image...');
      let dallEImages;
      let usedRevisedPrompt = false;
      let finalPrompt = imagePrompt;
      
      try {
        dallEImages = await generateImage({ prompt: finalPrompt, size: size || '1024x1024' });
      } catch (imageError) {
        if (imageError instanceof Error && imageError.message.includes('Content filter triggered')) {
          await send(70, 'Prompt was revised for safety...');
          finalPrompt = `A family-friendly, SFW, non-controversial meme about the following topic: ${imagePrompt}`;
          usedRevisedPrompt = true;
          dallEImages = await generateImage({ prompt: finalPrompt, size: size || '1024x1024' });
        } else {
          throw imageError;
        }
      }

      if (!dallEImages || dallEImages.length === 0) {
        throw new Error('Failed to generate images from DALL-E');
      }
      
      await send(80, 'Saving image to gallery...');
      const dallEImageUrl = dallEImages[0];
      
      // Upload to Supabase Storage
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

      await send(90, 'Image saved!');

      // 4. Increment rate limit and save record
      const { error: dbError } = await supabase.from('generations').insert({
        user_id: user.id,
        prompt: finalPrompt,
        image_url: publicUrl,
        used_revised_prompt: usedRevisedPrompt,
        article_title: article.title,
        article_link: article.link,
        article_description: article.description,
        article_category: article.category,
        article_pub_date: article.pubDate,
      });

      if (dbError) {
        // Log the error but don't block the user from seeing their meme
        console.error('Failed to save generation record:', dbError);
        throw new Error(`Failed to save generation record: ${dbError.message}`);
      }

      // Re-check rate limit after incrementing
      const updatedRateLimit = await checkRateLimit(supabase, user.id);

      await send(100, 'Complete!', {
        meme: {
          originalArticle: {
            title: article.title,
            link: article.link,
            description: article.description,
            category: article.category,
            pubDate: article.pubDate,
          },
          prompt: finalPrompt,
          imageUrls: [publicUrl], // now an array with the Supabase URL
          usedRevisedPrompt,
          rateLimit: updatedRateLimit
        }
      });

    } catch (error) {
      console.error('Meme generation error:', error);
      await send(100, 'Error', { 
        error: error instanceof Error ? error.message : 'An unknown error occurred during meme generation'
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
