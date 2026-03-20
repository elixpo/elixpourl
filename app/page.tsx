'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-page overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a3e635, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #86efac, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full"
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="ElixpoURL" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-display font-bold text-text-primary">
            <span className="text-lime-main">Elixpo</span>URL
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline"
          >
            Sign In
          </Link>
          <Link href="/login" className="btn-lime no-underline text-sm">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-8 pt-16 pb-32 text-center">
        {/* Banner image space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 w-full max-w-3xl"
        >
          {/* Replace with <Image src="/banner.png" ... /> when ready */}
        </motion.div>

        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(163, 230, 53, 0.08)',
            border: '1px solid rgba(163, 230, 53, 0.2)',
            color: '#a3e635',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-lime-main animate-pulse" />
          Built on Cloudflare&apos;s Edge Network
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-6xl md:text-7xl font-display font-bold leading-[1.08] mb-6 max-w-4xl"
        >
          Shorten URLs at the{' '}
          <span className="text-gradient">speed of light</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed"
        >
          The URL shortener built for the Elixpo ecosystem. Lightning-fast redirects,
          powerful analytics, and a developer-first API — all running on the edge.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="btn-lime no-underline px-8 py-3 text-base rounded-2xl glow-lime-sm"
          >
            Start Shortening
          </Link>
          <Link href="/pricing" className="btn-glass no-underline px-8 py-3 text-base rounded-2xl">
            View Pricing
          </Link>
        </motion.div>

        {/* Demo URL bar */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-16 w-full max-w-2xl glass-card p-1.5 flex items-center gap-2"
        >
          <div className="flex-1 px-4 py-3 text-sm text-text-muted truncate text-left font-mono">
            https://example.com/very/long/url/that/needs/shortening
          </div>
          <div
            className="px-6 py-3 rounded-xl text-sm font-semibold font-mono shrink-0"
            style={{ background: 'rgba(163, 230, 53, 0.15)', color: '#a3e635' }}
          >
            url.elixpo.com/abc123
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-light py-8 px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={20} height={20} className="rounded" />
            <span className="text-sm text-text-muted">
              <span className="text-lime-main">Elixpo</span>URL
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs text-text-disabled hover:text-text-secondary transition-colors no-underline">
              Pricing
            </Link>
            <Link href="/docs" className="text-xs text-text-disabled hover:text-text-secondary transition-colors no-underline">
              Docs
            </Link>
          </div>
          <p className="text-xs text-text-disabled">
            &copy; {new Date().getFullYear()} Elixpo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
