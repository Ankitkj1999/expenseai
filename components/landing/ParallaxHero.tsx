'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms - phone moves faster than text
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-[150vh] bg-black">
      {/* Hero Content */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background Text Layer - Behind Phone */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="absolute inset-0 flex items-center justify-center z-0 px-4"
        >
          <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 whitespace-nowrap">
            {/* "Meet" Text */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[10vw] xl:text-[9vw] font-bold leading-none tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #e0e0e0 0%, #06b6d4 50%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Meet
            </motion.h1>

            {/* "Expense AI" Text */}
            <motion.h1
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[10vw] xl:text-[9vw] font-bold leading-none tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Expense AI
            </motion.h1>
          </div>
        </motion.div>

        {/* Phone Mockup - Front Layer */}
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ y: phoneY }}
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        >
          <div className="relative w-[260px] h-[530px] md:w-[300px] md:h-[610px] lg:w-[340px] lg:h-[690px]">
            <Image
              src="/phone.png"
              alt="ExpenseAI App Preview"
              fill
              sizes="(max-width: 768px) 260px, (max-width: 1024px) 300px, 340px"
              className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)]"
              priority
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
