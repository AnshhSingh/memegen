export const SAFE_CATEGORIES = [
  "business",
  "education",
  "entertainment",
  "environment",
  "food",
  "lifestyle",
  "science",
  "sports",
  "technology",
  "tourism",
] as const;

export type NewsCategory = typeof SAFE_CATEGORIES[number];

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image_url?: string;
  category: string[];
  source_id: string;
}

interface NewsResponse {
  status: string;
  results: NewsArticle[];
  totalResults: number;
}

if (!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || !process.env.NEXT_PUBLIC_NEWSDATA_BASE_URL) {
  throw new Error('NewsData API environment variables are not configured');
}

export async function fetchLatestNews(category?: NewsCategory, language: string = 'en') {
  const url = new URL(process.env.NEXT_PUBLIC_NEWSDATA_BASE_URL);
  url.searchParams.append('apikey', process.env.NEXT_PUBLIC_NEWSDATA_API_KEY);
  url.searchParams.append('language', language);
  
  if (category && SAFE_CATEGORIES.includes(category)) {
    url.searchParams.append('category', category);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }
    const data: NewsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}
