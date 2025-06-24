'use client'

import { useState } from 'react'
import type { Generation } from '../../types'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, AnimationGeneratorType } from 'framer-motion'

export default function GalleryClient({ generations }: { generations: Generation[] | null }) {
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null)

  if (!generations || generations.length === 0) {
    return <p className="text-center text-gray-400 mt-10">No memes found in the gallery yet.</p>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 100
      }
    }
  };

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {generations.map((gen) => (
          <motion.div
            key={gen.id}
            className="bg-black/30 backdrop-blur-lg border border-gray-500/20 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedGen(gen)}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="aspect-video relative">
              <img
                src={gen.image_url}
                alt={gen.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                 <p className="text-white text-sm font-semibold drop-shadow-lg">{gen.prompt}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-900/50">
              <p className="text-sm font-medium text-gray-200 truncate">{gen.article_title}</p>
              <p className="text-xs text-gray-500">
                {new Date(gen.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedGen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedGen(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl relative max-h-[90vh] flex flex-col md:flex-row gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedGen(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-20 bg-gray-800/50 rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              <div className="md:w-3/5 flex-shrink-0 relative">
                <img src={selectedGen.image_url} alt={selectedGen.prompt} className="rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="md:w-2/5 p-6 space-y-4 overflow-y-auto">
                  <div>
                    <h3 className="text-sm font-medium text-purple-400 mb-1">AI-Generated Image Prompt:</h3>
                    <div className="relative">
                      <p className="text-base font-medium text-pink-400 bg-black/10 p-3 rounded-lg border border-white/5">"{selectedGen.prompt}"</p>
                      {selectedGen.used_revised_prompt && (
                        <span className="mt-2 inline-block text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20 animate-pulse">
                           Generated with safety adjustments
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-400 mb-1">Original Article:</h3>
                    <div className="bg-black/10 p-4 rounded-lg border border-white/5 space-y-3 text-sm">
                        <h4 className="font-bold text-gray-100">{selectedGen.article_title}</h4>
                        <p className="text-gray-400 max-h-24 overflow-y-auto">{selectedGen.article_description}</p>
                        <p className="text-xs text-gray-500">Published: {selectedGen.article_pub_date ? new Date(selectedGen.article_pub_date).toLocaleDateString() : 'N/A'}</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedGen.article_category?.map((c: string) => <span key={c} className="text-xs capitalize bg-gray-700/50 px-2 py-1 rounded">{c}</span>)}
                        </div>
                        <Button asChild size="sm" className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all hover:scale-105">
                          <a href={selectedGen.article_link} target="_blank" rel="noopener noreferrer">Read Full Article</a>
                        </Button>
                    </div>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 