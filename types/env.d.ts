declare namespace NodeJS {
  interface ProcessEnv {
    // Azure OpenAI (DALL-E) Configuration
    AZURE_API_KEY: string;
    AZURE_ENDPOINT: string;
    AZURE_API_VERSION: string;    // Gemini API Configuration
    NEXT_PUBLIC_GEMINI_API_KEY: string;
    NEXT_PUBLIC_GEMINI_API_URL: string;

    // NewsData API Configuration
    NEXT_PUBLIC_NEWSDATA_API_KEY: string;
    NEXT_PUBLIC_NEWSDATA_BASE_URL: string;
  }
}
