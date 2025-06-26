'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { User } from '@supabase/supabase-js'
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
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [session, setSession] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const reloaded = sessionStorage.getItem('reloaded_for_signin');
        if (!reloaded) {
          sessionStorage.setItem('reloaded_for_signin', 'true');
          window.location.reload();
          return;
        }
      } else if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('reloaded_for_signin');
      }
      setSession(session?.user ?? null)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>()
  const [imageSize, setImageSize] = useState<'1024x1024' | '1024x1792' | '1792x1024'>('1024x1024')
  const [memeData, setMemeData] = useState<MemeData | null>(null)
  const [error, setError] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState('')
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handleGenerateClick = () => {
    if (!session) {
      setShowAuthModal(true);
    } else {
      generateMeme();
    }
  }

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

        // Parse the SSE data??
        const text = new TextDecoder().decode(value)
        const messages = text.split('\n\n').filter(Boolean)

        for (const message of messages) {
          if (message.startsWith('data: ')) {
            const data = JSON.parse(message.slice(6))
            
     
            setProgress(data.progress)
            setProgressStatus(data.status)

            // If  having meme data, update it
            if (data.meme) {
              setMemeData({ meme: data.meme })
            }

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-black text-gray-900 dark:text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(139,92,246,.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(219,39,119,.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </motion.div>
      
      <AnimatePresence>
      {showAuthModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white/95 dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Get Started</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in or create an account to generate memes.</p>
              </div>
              <Auth
                supabaseClient={supabase}
                redirectTo={`${location.origin}/auth/callback?next=/generate`}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#6d28d9',
                        brandAccent: '#8b5cf6',
                        defaultButtonBackground: 'rgba(31, 41, 55, 0.5)',
                        defaultButtonBackgroundHover: 'rgba(55, 65, 81, 0.7)',
                        inputBackground: 'rgba(17, 24, 39, 0.5)',
                        inputBorder: 'rgba(55, 65, 81, 0.8)',
                        inputText: '#ffffff',
                        inputLabelText: '#9ca3af',
                        anchorTextColor: '#a78bfa',
                        anchorTextHoverColor: '#c4b5fd',
                      },
                      fonts: {
                        bodyFontFamily: 'inherit',
                        buttonFontFamily: 'inherit',
                        inputFontFamily: 'inherit',
                        labelFontFamily: 'inherit',
                      },
                      radii: {
                        borderRadiusButton: '0.5rem',
                        inputBorderRadius: '0.5rem',
                      }
                    },
                  },
                }}
                providers={['github']}
                socialLayout="horizontal"
                theme="dark"
              />
            </div>
          </motion.div>
      )}
      </AnimatePresence>
      <div className="w-full max-w-3xl mx-auto space-y-10 z-10">
      {session && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center mb-4"
        >
          <span className="text-gray-600 dark:text-gray-300 text-center">Welcome, {session.email}</span>
        </motion.div>
      )}
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-700 via-blue-700 to-purple-800 dark:from-green-600 dark:via-blue-600 dark:to-purple-700 text-transparent bg-clip-text drop-shadow-lg">
            MemeGen: News to Meme
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Instantly turn the latest news into viral memes with AI ✨
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-white/20 dark:bg-black/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-300/30 dark:border-gray-500/20">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px] bg-white/80 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" className="bg-white/95 dark:bg-black/30 backdrop-blur-lg border border-gray-300 dark:border-gray-500/20 text-gray-900 dark:text-white">
                {SAFE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={imageSize} onValueChange={(value: typeof imageSize) => setImageSize(value)}>
              <SelectTrigger className="w-[150px] bg-white/80 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors">
                <SelectValue placeholder="Image size" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" className="bg-white/95 dark:bg-black/30 backdrop-blur-lg border border-gray-300 dark:border-gray-500/20 text-gray-900 dark:text-white">
                <SelectItem value="1024x1024">Square (1:1)</SelectItem>
                <SelectItem value="1024x1792">Portrait (9:16)</SelectItem>
                <SelectItem value="1792x1024">Landscape (16:9)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={handleGenerateClick}
                disabled={loading || (!!session && memeData?.meme.rateLimit.remaining === 0)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-md transition-all duration-300 hover:shadow-purple-500/50 transform hover:scale-105"
                size="lg"
              >
                {loading ? "Generating..." : (session ? "Generate Meme" : "Sign In to Generate")}
              </Button>
              {memeData?.meme.rateLimit && (
                <p className={`text-sm ${memeData.meme.rateLimit.remaining === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {memeData.meme.rateLimit.remaining} / {memeData.meme.rateLimit.limit} generations remaining today
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{progressStatus}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
          </motion.div>
        )}
        </AnimatePresence>

        {/* Error msg */}
        <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
              <p className="font-semibold mb-1">{error}</p>
              {error.includes('Content filter triggered') && (
                <p className="text-sm text-red-500/80 dark:text-red-400/80">
                  This usually happens when the prompt contains potentially inappropriate content according to OpenAI . 
                  Try some other category for now sorry!
                </p>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
        {memeData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-300/30 dark:border-gray-500/20"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {memeData.meme.originalArticle.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {memeData.meme.originalArticle.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">AI-Generated Image Prompt:</p>
                  {memeData.meme.usedRevisedPrompt && (
                    <span className="text-xs text-yellow-700 dark:text-yellow-500 bg-yellow-500/20 dark:bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/40 dark:border-yellow-500/20 animate-pulse">
                       Generated with safety adjustments
                    </span>
                  )}
                </div>
                {editingPrompt ? (
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full min-h-[100px] text-lg font-medium text-gray-900 dark:text-pink-400 bg-white/80 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                      placeholder="Edit your meme prompt..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setEditingPrompt(false)}
                        variant="outline"
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 backdrop-blur-sm bg-white/20 dark:bg-black/20"
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
                              body: JSON.stringify({ 
                                prompt: customPrompt, 
                                size: imageSize,
                                originalArticle: memeData?.meme.originalArticle, 
                              })
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
                                        usedRevisedPrompt: data.usedRevisedPrompt,
                                        rateLimit: data.rateLimit,
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
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105 transition-transform"
                      >
                        Regenerate Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative text-lg font-medium text-gray-900 dark:text-pink-400 bg-white/80 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700/50">
                    "{memeData.meme.prompt}"
                    <button
                      onClick={() => {
                        setCustomPrompt(memeData.meme.prompt);
                        setEditingPrompt(true);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/60 shadow-md group"
                >
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
                      className="bg-gray-900/80 hover:bg-gray-800 text-white shadow-lg border border-gray-700/50 backdrop-blur transition-all transform hover:scale-105"
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
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 text-right">
              Generated on: {new Date().toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-600 text-center mt-2">
              Powered by <span className="font-semibold text-purple-600 dark:text-purple-400">newsdata.io</span>, <span className="font-semibold text-pink-600 dark:text-pink-400">Gemini</span> & <span className="font-semibold text-blue-600 dark:text-blue-400">DALLE</span>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </main>
  )
}
