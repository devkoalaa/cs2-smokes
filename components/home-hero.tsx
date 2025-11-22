'use client'

import { motion } from 'framer-motion'

export function HomeHero() {
  const title = "CS2 Smokes Hub"
  
  return (
    <div className="text-center mb-16 relative select-none">
      <div className="relative inline-block">
        <h1 
          className="text-4xl md:text-6xl font-bold mb-6 relative z-10" 
          style={{ fontFamily: 'var(--font-new-amsterdam)' }}
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
        transition={{ duration: 0.5, delay: 1.2 }}
        className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8"
      >
        O arsenal de smokes definitivo, alimentado e validado pela comunidade.
      </motion.p>
    </div>
  )
}
