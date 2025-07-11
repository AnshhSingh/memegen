'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Generation } from '../../types'

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="bg-white/5 dark:bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-gray-200/20 dark:border-white/10 shadow-lg text-center"
  >
    <div className="text-purple-500 dark:text-purple-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

export default function LandingPageClient({ generations }: { generations: Generation[] | null }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/50 to-gray-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      <main className="relative z-10 p-8">
        {/* Hero Section */}
        <section className="text-center my-16 md:my-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-green-600 via-blue-700 to-purple-800 dark:from-green-300 dark:via-blue-500 dark:to-purple-600 text-transparent bg-clip-text"
          >
            Create Viral Memes from News
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Instantly transform the latest headlines into hilarious, shareable memes with the power of AI. Your next viral sensation is just a click away.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 via-blue-700 to-purple-800 hover:from-green-700 hover:via-blue-800 hover:to-purple-900 dark:from-green-300 dark:via-blue-500 dark:to-purple-600 dark:hover:from-green-400 dark:hover:via-blue-600 dark:hover:to-purple-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all">
              <Link href="/generate">Generate Your First Meme</Link>
            </Button>
          </motion.div>
        </section>

        {/* Meme Showcase Section */}
        {generations && generations.length > 0 && (
          <section className=" max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-center mb-12"
            >
              Latest Creations
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {generations.slice(0, 8).map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  viewport={{ once: true }}
                  className="aspect-square bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-white/10 shadow-lg overflow-hidden group relative"
                >
                  <img src={gen.image_url} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-semibold">{gen.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

       
        
    
      </main>
    </div>
  )
} 