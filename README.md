

## Getting Started

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your API keys:
   - `AZURE_API_KEY`: Your Azure OpenAI API key for DALL-E 3 a
   - `AZURE_ENDPOINT`: Your Azure OpenAI endpoint URL 
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key 
   - `NEXT_PUBLIC_NEWSDATA_API_KEY`: Your NewsData.io API key 

### Running the Application

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


