'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  PiggyBank,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  BarChart3,
  Wallet,
  Target,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { ParallaxHero } from '@/components/landing/ParallaxHero';
import { useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations and spending analysis powered by advanced AI.',
    color: 'text-primary',
  },
  {
    icon: TrendingUp,
    title: 'Smart Analytics',
    description: 'Visualize your financial trends with beautiful, interactive charts and graphs.',
    color: 'text-primary',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Your data syncs instantly across all devices, always up-to-date.',
    color: 'text-primary',
  },
  {
    icon: PiggyBank,
    title: 'Budget Management',
    description: 'Set spending limits and track your budget progress with smart alerts and insights.',
    color: 'text-primary',
  },
  {
    icon: Shield,
    title: 'Bank-level Security',
    description: 'Your financial data is encrypted and protected with industry-standard security.',
    color: 'text-primary',
  },
  {
    icon: Layers,
    title: 'Automated Categorization',
    description: 'AI automatically categorizes your transactions, saving you time and effort.',
    color: 'text-primary',
  },
];

const stats = [
  { icon: Wallet, value: '10K+', label: 'Active Users' },
  { icon: BarChart3, value: '$5M+', label: 'Tracked Expenses' },
  { icon: Target, value: '95%', label: 'Budget Accuracy' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation - Pill Shape */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-50 pt-6 px-4"
      >
        <div className="container mx-auto max-w-5xl">
          {/* Pill-shaped container */}
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between px-6 py-3 md:px-8 md:py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Logo className="h-7 w-7 md:h-8 md:w-8 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 blur-xl bg-primary/30 group-hover:bg-primary/50 transition-all" />
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  ExpenseAI
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link href="#features">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full transition-all"
                  >
                    Features
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full transition-all"
                  >
                    Pricing
                  </Button>
                </Link>
                <Link href="#about">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full transition-all"
                  >
                    About
                  </Button>
                </Link>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-primary/10 rounded-full transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-2">
                <Link href="#features" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-2xl"
                  >
                    Features
                  </Button>
                </Link>
                <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-2xl"
                  >
                    Pricing
                  </Button>
                </Link>
                <Link href="#about" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-2xl"
                  >
                    About
                  </Button>
                </Link>
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full hover:bg-primary/10 hover:text-primary rounded-2xl"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/25"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Parallax Hero Section */}
      <ParallaxHero />

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {' '}
                Master Your Finances
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your money
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 h-full hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 via-accent/10 to-chart-3/10 border-primary/20 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their finances smarter with ExpenseAI
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo className="h-6 w-6" />
              <span className="text-lg font-semibold">ExpenseAI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 ExpenseAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
