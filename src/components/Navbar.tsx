'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Home, Sparkles, Images, LogOut, User, LogIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    requiresAuth: false,
  },
  {
    name: 'Generate',
    href: '/generate',
    icon: Sparkles,
    requiresAuth: true,
  },
  {
    name: 'Gallery',
    href: '/gallery',
    icon: Images,
    requiresAuth: true,
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.requiresAuth && !user) {
      e.preventDefault()
      // Redirect to sign-in page with intended destination
      router.push(`/signin?redirect=${encodeURIComponent(item.href)}`)
      return
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Redirect to home if user was on a protected page
    if (pathname === '/generate') {
      router.push('/')
    }
  }

  const handleAuthClick = () => {
    // Redirect to sign-in page with current page as redirect
    const redirectPath = pathname === '/' ? '/generate' : pathname
    router.push(`/signin?redirect=${encodeURIComponent(redirectPath)}`)
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Hidden on mobile */}
          <Link href="/" className="hidden md:flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 text-transparent bg-clip-text">
                MemeGen
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const canAccess = !item.requiresAuth || user
              
              return (
                <div key={item.href} className="relative">
                  <Link 
                    href={canAccess ? item.href : '#'}
                    onClick={(e) => handleNavClick(item, e)}
                  >
                    <Button
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      disabled={loading || (item.requiresAuth && !user)}
                      className={`
                        flex items-center gap-2 transition-all duration-300 relative
                        ${active 
                          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg' 
                          : canAccess 
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            : 'opacity-60 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {item.requiresAuth && !user && (
                        <LogIn className="w-3 h-3 ml-1 opacity-60" />
                      )}
                    </Button>
                  </Link>
                  {item.requiresAuth && !user && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Sign in required
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* User Authentication Section */}
            {user ? (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 max-w-32 truncate">
                    {user.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthClick}
                  className="flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation - Horizontal Icons */}
          <div className="flex md:hidden items-center justify-center flex-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const canAccess = !item.requiresAuth || user
              
              return (
                <Link 
                  key={item.href} 
                  href={canAccess ? item.href : '#'}
                  onClick={(e) => handleNavClick(item, e)}
                  className="flex-1"
                >
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    disabled={loading || (item.requiresAuth && !user)}
                    className={`
                      w-full flex flex-col items-center gap-1 py-2 px-1 h-auto transition-all duration-300 relative
                      ${active 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg' 
                        : canAccess 
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {item.requiresAuth && !user && (
                        <LogIn className="w-2 h-2 absolute -top-1 -right-1 opacity-60" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
            
            {/* Mobile Auth Button */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex flex-col items-center gap-1 py-2 px-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs font-medium">Out</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthClick}
                className="flex flex-col items-center gap-1 py-2 px-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-xs font-medium">In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
