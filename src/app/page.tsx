'use client'

import { useState } from 'react'
import { SAFE_CATEGORIES } from '@/lib/newsfetch'
import { downloadImage } from '@/lib/downloadUtils'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface RateLimit {
  remaining: number;
  limit: number;
  isBlocked: boolean;
}

interface MemeData {
  meme: {
    originalArticle: {
      title: string
      link: string
      description: string
      category: string[]
      pubDate: string
    }
    prompt: string
    imageUrls: string[]
    usedRevisedPrompt?: boolean
    rateLimit: RateLimit
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>()
  const [imageSize, setImageSize] = useState<'1024x1024' | '1024x1792' | '1792x1024'>('1024x1024')
  const [memeData, setMemeData] = useState<MemeData | null>(null)
  const [error, setError] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState('')
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const generateMeme = async () => {
    try {
      setLoading(true)
      setError(undefined)
      setMemeData(null)
      setProgress(0)
      setProgressStatus('Starting...')

      const response = await fetch(`/api/meme-generator-stream?${new URLSearchParams({
        ...(category ? { category } : {}),
        size: imageSize
      })}`)
      const reader = response.body?.getReader()
      
      if (!reader) {
        throw new Error('Failed to initialize stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Parse the SSE data
        const text = new TextDecoder().decode(value)
        const messages = text.split('\n\n').filter(Boolean)

        for (const message of messages) {
          if (message.startsWith('data: ')) {
            const data = JSON.parse(message.slice(6))
            
            // Update progress and status
            setProgress(data.progress)
            setProgressStatus(data.status)

            // If we have meme data, update it
            if (data.meme) {
              setMemeData({ meme: data.meme })
            }

            // Handle errors
            if (data.error) {
              throw new Error(data.error)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-800 via-pink-600 to-red-800 text-transparent bg-clip-text drop-shadow-lg">
            MemeGen: News to Meme
            </h1>
          <p className="text-gray-400 text-lg font-medium">
            Instantly turn the latest news into viral memes with AI ✨
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-6 rounded-xl shadow-lg border border-gray-700/40">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] bg-gray-800/70 border-gray-700 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {SAFE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={imageSize} onValueChange={(value: typeof imageSize) => setImageSize(value)}>
            <SelectTrigger className="w-[150px] bg-gray-800/70 border-gray-700 text-white">
              <SelectValue placeholder="Image size" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="1024x1024">Square (1:1)</SelectItem>
              <SelectItem value="1024x1792">Portrait (9:16)</SelectItem>
              <SelectItem value="1792x1024">Landscape (16:9)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={generateMeme}
              disabled={loading || (memeData?.meme.rateLimit.remaining === 0)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-md"
              size="lg"
            >
              {loading ? "Generating..." : "Generate Meme"}
            </Button>
            {memeData?.meme.rateLimit && (
              <p className={`text-sm ${memeData.meme.rateLimit.remaining === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {memeData.meme.rateLimit.remaining} / {memeData.meme.rateLimit.limit} generations remaining today
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{progressStatus}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="space-y-2">
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg text-center">
              <p className="font-semibold mb-1">{error}</p>
              {error.includes('Content filter triggered') && (
                <p className="text-sm text-red-400/80">
                  This usually happens when the prompt contains potentially inappropriate content. 
                  Try editing the prompt to be more family-friendly or choose a different news article.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {memeData && (
          <div className="space-y-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 rounded-xl shadow-lg border border-gray-700/40">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-100">
                {memeData.meme.originalArticle.title}
              </h2>
              <p className="text-gray-400 text-base">
                {memeData.meme.originalArticle.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-400">AI-Generated Image Prompt:</p>
                  {memeData.meme.usedRevisedPrompt && (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                       Generated with safety adjustments
                    </span>
                  )}
                </div>
                {editingPrompt ? (
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full min-h-[100px] text-lg font-medium text-pink-400 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      placeholder="Edit your meme prompt..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setEditingPrompt(false)}
                        variant="outline"
                        className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!customPrompt.trim()) return;
                          try {
                            setLoading(true);
                            setError(undefined);
                            setProgress(0);
                            setProgressStatus('Starting...');
                            
                            const response = await fetch('/api/regenerate-image', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ prompt: customPrompt, size: imageSize })
                            });
                            
                            const reader = response.body?.getReader();
                            if (!reader) throw new Error('Failed to initialize stream');

                            while (true) {
                              const { done, value } = await reader.read();
                              if (done) break;

                              const text = new TextDecoder().decode(value);
                              const messages = text.split('\n\n').filter(Boolean);

                              for (const message of messages) {
                                if (message.startsWith('data: ')) {
                                  const data = JSON.parse(message.slice(6));
                                  setProgress(data.progress);
                                  setProgressStatus(data.status);

                                  if (data.imageUrls) {
                                    setMemeData(prev => prev ? {
                                      meme: {
                                        ...prev.meme,
                                        prompt: customPrompt,
                                        imageUrls: data.imageUrls,
                                        usedRevisedPrompt: data.usedRevisedPrompt
                                      }
                                    } : null);
                                  }

                                  if (data.error) throw new Error(data.error);
                                }
                              }
                            }
                            setEditingPrompt(false);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to regenerate image');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={!customPrompt.trim() || loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        Regenerate Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative text-lg font-medium text-pink-400 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                    "{memeData.meme.prompt}"
                    <button
                      onClick={() => {
                        setCustomPrompt(memeData.meme.prompt);
                        setEditingPrompt(true);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4">
              {memeData.meme.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/60 shadow-md group">
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      onClick={async () => {
                        try {
                          const filename = `meme-${Date.now()}.png`;
                          await downloadImage(url, filename);
                        } catch (err) {
                          setError('Failed to download image');
                        }
                      }}
                      size="sm"
                      className="bg-gray-900/80 hover:bg-gray-800 text-white shadow-lg border border-gray-700/50 backdrop-blur"
                    >
                      <svg 
                        className="w-4 h-4 mr-1.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </Button>
                  </div>
                  
                  <img
                    src={url}
                    alt="Generated meme"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 text-right">
              Generated on: {new Date().toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 text-center mt-2">
              Powered by <span className="font-semibold text-purple-400">newsdata.io</span>, <span className="font-semibold text-pink-400">Gemini</span> & <span className="font-semibold text-blue-400">DALLE</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
