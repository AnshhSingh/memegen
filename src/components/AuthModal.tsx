'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase-client'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export default function AuthModal({ isOpen, onClose, redirectTo = '/' }: AuthModalProps) {
  const supabase = createClient()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <div className="bg-white/95 dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Get Started</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in or create an account to generate memes.</p>
            </div>
            
            <Auth
              supabaseClient={supabase}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${redirectTo}`}
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
                    space: {
                      inputPadding: '12px',
                      buttonPadding: '12px 20px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '0px',
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
              providers={['google', 'github']}
              theme="dark"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
