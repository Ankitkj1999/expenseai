'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Brain,
  TrendingUp,
  PiggyBank,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  BarChart3,
  Wallet,
  Target,
} from 'lucide-react';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';

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
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations and spending analysis powered by advanced AI.',
    color: 'text-primary',
  },
  {
    icon: TrendingUp,
    title: 'Smart Analytics',
    description: 'Visualize your financial trends with beautiful, interactive charts and graphs.',
    color: 'text-accent',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Your data syncs instantly across all devices, always up-to-date.',
    color: 'text-chart-3',
  },
  {
    icon: PiggyBank,
    title: 'Budget Management',
    description: 'Set spending limits and track your budget progress with smart alerts and insights.',
    color: 'text-chart-4',
  },
  {
    icon: Shield,
    title: 'Bank-level Security',
    description: 'Your financial data is encrypted and protected with industry-standard security.',
    color: 'text-primary',
  },
  {
    icon: Sparkles,
    title: 'Automated Categorization',
    description: 'AI automatically categorizes your transactions, saving you time and effort.',
    color: 'text-accent',
  },
];

const stats = [
  { icon: Wallet, value: '10K+', label: 'Active Users' },
  { icon: BarChart3, value: '$5M+', label: 'Tracked Expenses' },
  { icon: Target, value: '95%', label: 'Budget Accuracy' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-border/40 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ExpenseAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              ✨ AI-Powered Expense Tracking
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent"
          >
            Smart Money Management
            <br />
            Made Simple
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Track expenses, set budgets, and gain insights with the power of AI.
            Your personal finance assistant that learns and adapts to your spending habits.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/10 hover:text-primary">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <stat.icon className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

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
              <Brain className="h-6 w-6 text-primary" />
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
