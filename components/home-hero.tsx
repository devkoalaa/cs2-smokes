'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowDown, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeHero({ backgroundImage }: { backgroundImage?: string }) {
  const title = "CS2 Hub"
  
  return (
    <div className="relative isolate mb-10 sm:mb-16 overflow-hidden rounded-2xl border border-border/50 px-4 py-14 sm:py-20 text-center select-none">
      {backgroundImage && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/70 to-background" />

      <div className="relative inline-block">
        <h1 
          className="font-display text-5xl md:text-7xl mb-6 relative z-10"
        >
          <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                  visible: { transition: { staggerChildren: 0.08 } }
              }}
              className="flex flex-wrap justify-center"
          >
              {title.split('').map((char, index) => (
                  <motion.span
                      key={index}
                      className="inline-block text-foreground"
                      variants={{
                          hidden: { 
                              opacity: 0,
                              filter: "blur(20px)",
                              scale: 2,
                              y: 20,
                              x: (index % 2 === 0 ? -10 : 10) // Subtle drift
                          },
                          visible: { 
                              opacity: 1,
                              filter: "blur(0px)",
                              scale: 1,
                              y: 0,
                              x: 0,
                              transition: {
                                  duration: 1.2,
                                  ease: [0.2, 0.65, 0.3, 0.9]
                              }
                          }
                      }}
                  >
                      {char === ' ' ? '\u00A0' : char}
                  </motion.span>
              ))}
          </motion.div>
        </h1>

        {/* Ambient Smoke Effect Behind Title */}
        <motion.div
            className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full -z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 1.1] }}
            transition={{ duration: 2.5, ease: "easeOut" }}
        />
      </div>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8"
      >
        Smokes por mapa e o seu histórico de partidas, com mapa de abates e ranking com os amigos.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <a href="#mapas">
            Ver mapas
            <ArrowDown className="w-4 h-4 ml-2" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/partidas">
            Minhas partidas
            <BarChart3 className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
