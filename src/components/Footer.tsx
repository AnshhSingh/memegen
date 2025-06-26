'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative px-8 py-12 bg-gradient-to-r from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-black backdrop-blur-lg border-t border-gray-200/20 dark:border-white/10"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 dark:from-purple-400/5 dark:via-cyan-400/5 dark:to-purple-400/5"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 text-transparent bg-clip-text">
              MemeGen
            </h3>
            <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transform news into viral memes with AI
            </p>
          </div>

          {/* Right side - GitHub button and copyright */}
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border-gray-200/50 dark:border-white/20 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
            >
              <a
                href="https://github.com/AnshhSingh/memegen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} MemeGen. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}