import { NextRequest } from 'next/server';
import { fetchLatestNews, type NewsCategory } from '@/lib/newsfetch';
import { generateMemePrompt } from '@/lib/gemini';
import { generateImage } from '@/lib/imageGen';
import { checkRateLimit, incrementRateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const customEncode = (data: any) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as NewsCategory | undefined;
  const size = searchParams.get('size') as '1024x1024' | '1024x1792' | '1792x1024' | null;

  // Get client IP address
  const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
  
  // Check rate limit before proceeding
  const rateLimit = checkRateLimit(ip);
  if (rateLimit.isBlocked) {
    await writer.write(
      customEncode({
        error: `Rate limit exceeded. You can only generate ${rateLimit.limit} memes per day.`,
        rateLimit
      })
    );
    await writer.close();
    return;
  }

  const send = async (progress: number, status: string, data?: any) => {
    await writer.write(
      customEncode({
        progress,
        status,
        ...data
      })
    );
  };

  (async () => {
    try {
      // 1. Start fetching news (0-25%)
      await send(0, 'Fetching latest news...');
      const newsData = await fetchLatestNews(category, 'en');
      
      if (!newsData.results || newsData.results.length === 0) {
        await send(100, 'Error', { error: 'No news articles found' });
        await writer.close();
        return;
      }
      await send(25, 'News article found');

      // 2. Generate meme prompt (25-50%)
      const article = newsData.results[0];
      await send(30, 'Analyzing article content...');
      const imagePrompt = await generateMemePrompt(article.title, article.description);
      
      if (!imagePrompt) {
        await send(100, 'Error', { error: 'Failed to generate image prompt' });
        await writer.close();
        return;
      }
      await send(50, 'Meme concept generated');      // 3. Generate image (50-100%)
      await send(60, 'Creating meme image...');
      let images;
      let usedRevisedPrompt = false;
      
      try {
        images = await generateImage({      prompt: imagePrompt,
      size: size || '1024x1024'
        });
      } catch (imageError) {
        if (imageError instanceof Error && imageError.message.includes('content_policy_violation')) {
          await send(70, 'The generated Prompt was revised due to content policy violation of DALL-E ');
          const revisedPrompt = `Create a family-friendly, non-controversial meme image: ${imagePrompt}`;
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
      }
      
      if (usedRevisedPrompt) {
        await send(90, 'Generated with revised prompt');
      }      // 4. Increment rate limit and return final result
      const updatedRateLimit = incrementRateLimit(ip);
      await send(100, 'Complete!', {
        meme: {
          originalArticle: {
            title: article.title,
            link: article.link,
            description: article.description,
            category: article.category,
            pubDate: article.pubDate,
          },
          prompt: imagePrompt,
          imageUrls: images,
          usedRevisedPrompt,
          rateLimit: updatedRateLimit
        }
      });

    } catch (error) {
      console.error('Meme generation error:', error);
      await send(100, 'Error', { 
        error: error instanceof Error ? error.message : 'Failed to generate meme'
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
