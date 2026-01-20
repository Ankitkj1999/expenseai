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

  // Very fast parallax for phone - moves out quickly in 2-3 scrolls
  const phoneY = useTransform(scrollYProgress, [0, 0.4], [0, -1200]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <div ref={containerRef} className="relative min-h-[120vh] bg-black">
      {/* Hero Content */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background Text Layer - Behind Phone */}
        <motion.div
          style={{ y: textY, scale: textScale }}
          className="absolute inset-0 flex items-center justify-center z-0 px-4"
        >
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
            {/* "Meet" Text */}
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] font-bold leading-none tracking-tight"
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] font-bold leading-none tracking-tight"
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
            delay: 0.8,
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
