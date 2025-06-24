import type { NextConfig } from "next";

// Define the shape of your environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Azure OpenAI (DALL-E) Configuration
      AZURE_API_KEY: string;
      AZURE_ENDPOINT: string;
      AZURE_API_VERSION: string;

      // Gemini API Configuration
      NEXT_PUBLIC_GEMINI_API_KEY: string;
      NEXT_PUBLIC_GEMINI_API_URL: string;

      // NewsData API Configuration
      NEXT_PUBLIC_NEWSDATA_API_KEY: string;
      NEXT_PUBLIC_NEWSDATA_BASE_URL: string;
    }
  }
}

const nextConfig: NextConfig = {
  // Runtime config validation
  env: {
    AZURE_API_KEY: process.env.AZURE_API_KEY!,
    AZURE_ENDPOINT: process.env.AZURE_ENDPOINT!,
    AZURE_API_VERSION: process.env.AZURE_API_VERSION!,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    NEXT_PUBLIC_GEMINI_API_URL: process.env.NEXT_PUBLIC_GEMINI_API_URL!,
    NEXT_PUBLIC_NEWSDATA_API_KEY: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY!,
    NEXT_PUBLIC_NEWSDATA_BASE_URL: process.env.NEXT_PUBLIC_NEWSDATA_BASE_URL!,
  },
};

export default nextConfig;
