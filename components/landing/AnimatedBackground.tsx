'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated gradient background with floating orbs
 * Creates a modern, dynamic background effect
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Orb class for floating circles
    class Orb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 150 + 50;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        
        // Vibrant colors matching our theme
        const colors = [
          'rgba(6, 182, 212, 0.1)', // Cyan
          'rgba(59, 130, 246, 0.1)', // Blue
          'rgba(16, 185, 129, 0.1)', // Green
          'rgba(245, 158, 11, 0.1)', // Orange
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Create orbs
    const orbs: Orb[] = [];
    for (let i = 0; i < 5; i++) {
      orbs.push(new Orb());
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        orb.update();
        orb.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-50"
      style={{ filter: 'blur(60px)' }}
    />
  );
}
