'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  
  // Get the redirect URL from query params, default to home
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Redirect after successful sign in
        router.push(redirectTo)
      }
    })

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, redirectTo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-gray-200/20 dark:border-white/10 shadow-2xl">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 text-transparent bg-clip-text mb-2"
              >
                Welcome to MemeGen
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Sign in or create an account to start generating viral memes from the latest news.
              </motion.p>
            </div>

            {/* Auth Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Auth
                supabaseClient={supabase}
                redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(redirectTo)}`}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#6d28d9',
                        brandAccent: '#8b5cf6',
                        defaultButtonBackground: 'rgba(255, 255, 255, 0.1)',
                        defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.2)',
                        defaultButtonBorder: 'rgba(255, 255, 255, 0.2)',
                        inputBackground: 'rgba(255, 255, 255, 0.05)',
                        inputBorder: 'rgba(255, 255, 255, 0.2)',
                        inputBorderHover: 'rgba(255, 255, 255, 0.3)',
                        inputBorderFocus: '#8b5cf6',
                        inputText: '#ffffff',
                        inputLabelText: '#d1d5db',
                        inputPlaceholder: '#9ca3af',
                        anchorTextColor: '#a78bfa',
                        anchorTextHoverColor: '#c4b5fd',
                        messageText: '#f3f4f6',
                        messageTextDanger: '#fca5a5',
                      },
                      fonts: {
                        bodyFontFamily: 'inherit',
                        buttonFontFamily: 'inherit',
                        inputFontFamily: 'inherit',
                        labelFontFamily: 'inherit',
                      },
                      space: {
                        inputPadding: '12px 16px',
                        buttonPadding: '12px 20px',
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '8px',
                        buttonBorderRadius: '8px',
                        inputBorderRadius: '8px',
                      },
                    },
                  },
                }}
                providers={['github']}
                theme="dark"
                view="sign_in"
                showLinks={true}
              />
            </motion.div>

            {/* Footer Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
            >
              By signing in, you agree to our terms of service and privacy policy.
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function SignInLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default function SignInClient() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  )
}
