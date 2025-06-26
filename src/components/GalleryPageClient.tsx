'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import GalleryClient from '@/components/GalleryClient'
import type { Generation } from '../../types'
import { motion } from 'framer-motion'

export default function GalleryPageClient({ generations }: { generations: Generation[] | null }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-black text-gray-900 dark:text-white p-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </motion.div>
      <div className="max-w-7xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-600 dark:to-pink-600 text-transparent bg-clip-text">
            Meme Gallery
          </h1>
        </motion.div>

        <GalleryClient generations={generations as Generation[] | null} />

      </div>
    </main>
  )
} 