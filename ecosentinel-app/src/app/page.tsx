'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Shield, Activity, Brain, Cpu, Radio, FileText,
  Droplets, Flame, Wind, ChevronRight, ArrowRight,
  Zap, Globe, BarChart3, Layers,
  AlertTriangle, CheckCircle2, Check, X,
  Workflow, MapPin, Sparkles, Heart, Play,
  TreePine, TrendingUp, Target, Eye, XCircle,
  Menu, ShieldCheck, Server
} from 'lucide-react';
import Link from 'next/link';

/* ─── Shared Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasStarted.current) return;
    hasStarted.current = true;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration, startOnView]);

  return { count, ref };
}

/* ═══════════════════════════════════════════
   PARTICLE CANVAS BACKGROUND
   ═══════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const PARTICLE_COUNT = 45;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.35 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.06 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════
   STICKY ACTIVE NAVIGATION BAR
   ═══════════════════════════════════════════ */
function LandingNav({ onOpenDemo }: { onOpenDemo: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const navLinks = [
    { label: 'Home', href: '#hero', id: 'hero' },
    { label: 'Problem', href: '#problem', id: 'problem' },
    { label: 'Solution', href: '#solution', id: 'solution' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'Impact', href: '#impact', id: 'impact' },
    { label: 'Roadmap', href: '#roadmap', id: 'roadmap' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    const sectionIds = navLinks.map((l) => l.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="#hero" className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-primary-400 rounded-xl p-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success-400 rounded-full border-2 border-surface-950 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-bold text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
              EcoSentinel <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-primary-400 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase mt-0.5">Environmental Defense</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-400 ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-secondary-600/80 rounded-full border border-white/20 shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDemo}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/80 border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary-400"
            aria-label="Watch live demo video"
          >
            <Play className="w-3.5 h-3.5 text-secondary-400 fill-secondary-400" />
            Watch Demo
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <Zap className="w-3.5 h-3.5" />
            Launch Dashboard
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary-400"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface-950/98 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === link.id
                    ? 'bg-primary-600/20 text-white border border-primary-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white/90 border border-white/15 bg-white/5"
              >
                <Play className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                Watch Demo Video
              </button>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Launch Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════
   HERO SECTION — BALANCED TWO-COLUMN LAYOUT
   ═══════════════════════════════════════════ */
function HeroSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-24 lg:pt-40 lg:pb-36 flex items-center overflow-hidden bg-gradient-to-b from-[#020617] via-[#0b1329] to-[#0f172a]">
      
      {/* Ambient Radial Background Glows */}
      <ParticleField />
      <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-gradient-radial from-primary-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[600px] h-[400px] bg-gradient-radial from-secondary-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Subtitle, CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-400" />
              </span>
              <span className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                AI Environmental Defense & Early Warning Grid
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-4xl sm:text-6xl lg:text-[4rem] font-extrabold text-white tracking-tight leading-[1.08]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Predict. Protect.{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-success-400 animate-gradient bg-[length:200%_auto]">
                Save Lives.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-xl text-white/65 leading-relaxed font-normal max-w-2xl">
              EcoSentinel AI unifies solar IoT telemetry and edge AI models to detect floods, wildfires, and toxic air pollution{' '}
              <strong className="text-white font-semibold">hours before disasters strike</strong>.
            </p>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-stretch sm:items-center">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Launch Command Center
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <button
                onClick={onOpenDemo}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold text-white/90 border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/25 hover:text-white transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <Play className="w-4 h-4 text-secondary-400 fill-secondary-400 group-hover:scale-110 transition-transform" />
                Watch Live Demo
              </button>
            </div>

            {/* Quick Telemetry Highlights */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg">
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black text-white font-mono" style={{ fontFamily: 'var(--font-heading)' }}>&lt; 1.8s</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium font-mono mt-1">Alert Latency</div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black text-secondary-400 font-mono" style={{ fontFamily: 'var(--font-heading)' }}>142</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium font-mono mt-1">Solar Nodes</div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black text-success-400 font-mono" style={{ fontFamily: 'var(--font-heading)' }}>98.4%</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium font-mono mt-1">XAI Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive AI Command Radar Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Glow Ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-success-500/20 blur-xl opacity-75 animate-pulse" />

              {/* Main Card Container */}
              <div className="relative p-6 sm:p-7 rounded-3xl border border-white/15 bg-surface-950/85 backdrop-blur-2xl shadow-2xl overflow-hidden">
                
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-critical-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">Live Threat Radar</span>
                  </div>
                  <span className="text-[11px] font-mono text-secondary-400 bg-secondary-500/10 px-2.5 py-1 rounded-full border border-secondary-500/30">
                    GRID ONLINE
                  </span>
                </div>

                {/* Radar Graphic Container */}
                <div className="relative h-64 sm:h-72 rounded-2xl bg-[#030a1a] border border-white/10 overflow-hidden flex items-center justify-center">
                  
                  <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                  
                  {/* Radar Circles */}
                  {[60, 120, 180, 240].map((r) => (
                    <div
                      key={r}
                      className="absolute rounded-full border border-primary-500/20"
                      style={{ width: r, height: r }}
                    />
                  ))}

                  {/* Rotating Sweeper Line */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-full h-full pointer-events-none"
                  >
                    <div className="w-1/2 h-1/2 bg-gradient-to-br from-secondary-400/25 to-transparent rounded-tl-full origin-bottom-right" />
                  </motion.div>

                  {/* Pulsing Hazard Pins */}
                  <div className="absolute top-10 left-12 flex items-center gap-2 bg-critical-500/20 border border-critical-500/40 px-2.5 py-1 rounded-lg backdrop-blur-md animate-pulse">
                    <Droplets className="w-3.5 h-3.5 text-critical-400" />
                    <span className="text-[10px] font-mono text-critical-300 font-bold">Assam River Node (+3.8m)</span>
                  </div>

                  <div className="absolute bottom-12 right-8 flex items-center gap-2 bg-warning-500/20 border border-warning-500/40 px-2.5 py-1 rounded-lg backdrop-blur-md">
                    <Flame className="w-3.5 h-3.5 text-warning-400" />
                    <span className="text-[10px] font-mono text-warning-300 font-bold">Bandipur Fire Spike</span>
                  </div>

                  <div className="absolute bottom-20 left-10 flex items-center gap-2 bg-primary-500/20 border border-primary-500/40 px-2.5 py-1 rounded-lg backdrop-blur-md">
                    <Wind className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-[10px] font-mono text-primary-300 font-bold">Delhi AQI 240 Alarm</span>
                  </div>
                </div>

                {/* Telemetry Progress Bar */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">Real-Time Risk Index</span>
                    <span className="text-critical-400 font-bold font-mono">HIGH RISK (84/100)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success-500 via-warning-500 to-critical-500 w-[84%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/40 font-mono pt-1">
                    <span>LoRa Mesh Protocol v4.2</span>
                    <span>Confidence: 98.4%</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CRISIS & STANDALONE STATISTICS SECTION
   ═══════════════════════════════════════════ */
function CrisisSection() {
  const stat1 = useCountUp(380, 2000);
  const stat2 = useCountUp(190, 2000);
  const stat3 = useCountUp(4, 2000);

  const crises = [
    {
      title: 'River Floods',
      stat: '40%',
      statLabel: 'of all global disasters',
      desc: 'Sudden cloudbursts and river bank breaches submerge entire habitats before traditional weather stations issue warnings.',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-400',
      bgAccent: 'bg-blue-500/10',
      borderAccent: 'border-blue-500/20 hover:border-blue-400/40',
    },
    {
      title: 'Wildfires',
      stat: '12M+',
      statLabel: 'acres burned annually',
      desc: 'Fires rage undetected for hours in remote dry forests, consuming vegetation and releasing megatons of carbon.',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      bgAccent: 'bg-orange-500/10',
      borderAccent: 'border-orange-500/20 hover:border-orange-400/40',
    },
    {
      title: 'Air Pollution',
      stat: '4.2M',
      statLabel: 'deaths per year globally',
      desc: 'Toxic gaseous emissions and particulate surges cause severe respiratory emergencies before local alerts sound.',
      icon: Wind,
      color: 'from-amber-500 to-yellow-400',
      bgAccent: 'bg-amber-500/10',
      borderAccent: 'border-amber-500/20 hover:border-amber-400/40',
    },
  ];

  return (
    <section id="problem" className="relative py-24 sm:py-32 lg:py-36 bg-surface-50 border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-critical-50 border border-critical-200 text-critical-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            The Climate Reality
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Environmental disasters are{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-critical-600 to-orange-500">
              detected too late
            </span>
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="mt-4 text-base sm:text-lg text-surface-600 leading-relaxed max-w-2xl mx-auto"
          >
            Legacy monitoring relies on manual inspections, fragmented networks, and reactive protocols — leaving vulnerable regions unprotected.
          </motion.p>
        </div>

        {/* Disaster Cards Grid (Equal Heights, Aligned Padding) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20 items-stretch">
          {crises.map((c, i) => (
            <motion.div
              key={c.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`group flex flex-col justify-between p-8 sm:p-9 rounded-3xl border ${c.borderAccent} bg-white shadow-sm hover:shadow-xl transition-all duration-300 h-full`}
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-105 transition-transform`}>
                  <c.icon className="w-7 h-7" />
                </div>
                <div className="mb-4">
                  <span className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${c.color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {c.stat}
                  </span>
                  <span className="block text-xs text-surface-500 font-semibold uppercase tracking-wider mt-1">{c.statLabel}</span>
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {c.title}
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Redesigned Standalone Statistics Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="p-8 sm:p-12 rounded-3xl bg-surface-950 text-white shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-white/10 text-center items-center">
            
            <div ref={stat1.ref} className="md:px-8 py-4 md:py-0">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-critical-400 to-orange-400" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat1.count}M+
              </div>
              <div className="mt-2 text-sm text-white/70 font-medium max-w-xs mx-auto leading-normal">
                People impacted by severe environmental hazards each year
              </div>
            </div>

            <div ref={stat2.ref} className="md:px-8 py-4 md:py-0">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400" style={{ fontFamily: 'var(--font-heading)' }}>
                ${stat2.count}B
              </div>
              <div className="mt-2 text-sm text-white/70 font-medium max-w-xs mx-auto leading-normal">
                Global economic losses incurred from unmitigated climate events
              </div>
            </div>

            <div ref={stat3.ref} className="md:px-8 py-4 md:py-0">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat3.count}.2M
              </div>
              <div className="mt-2 text-sm text-white/70 font-medium max-w-xs mx-auto leading-normal">
                Lives affected by toxic air episodes and severe pollution surges
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SOLUTION ARCHITECTURE PIPELINE
   ═══════════════════════════════════════════ */
function SolutionSection() {
  const steps = [
    { num: '01', title: 'Sense', desc: 'Solar IoT nodes capture hydrological level, gas, PM2.5, and thermal readings continuously.', icon: Cpu, color: 'from-blue-500 to-cyan-500' },
    { num: '02', title: 'Process', desc: 'Edge micro-models validate readings on-device, filtering noise before packet transmission.', icon: Zap, color: 'from-violet-500 to-purple-500' },
    { num: '03', title: 'Transmit', desc: 'LoRa mesh network relays telemetry across 10+ km with zero reliance on local cellular grids.', icon: Radio, color: 'from-emerald-500 to-teal-500' },
    { num: '04', title: 'Analyze', desc: 'Central AI engine synthesizes multi-node spatial trends to model danger perimeters.', icon: Brain, color: 'from-amber-500 to-orange-500' },
    { num: '05', title: 'Explain', desc: 'Explainable AI engine outputs transparent risk factor weights for auditable decision making.', icon: FileText, color: 'from-pink-500 to-rose-500' },
    { num: '06', title: 'Protect', desc: 'Sub-2-second automated notifications dispatch actionable emergency alerts to response teams.', icon: Shield, color: 'from-primary-500 to-secondary-500' },
  ];

  return (
    <section id="solution" className="relative py-24 sm:py-32 lg:py-36 bg-white border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Workflow className="w-3.5 h-3.5" />
            End-to-End Pipeline
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            From raw sensor telemetry to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
              instant defense
            </span>
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="mt-4 text-base sm:text-lg text-surface-600 leading-relaxed max-w-2xl mx-auto"
          >
            A resilient six-stage architecture engineered for real-time risk assessment and automated dispatch.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group relative p-8 sm:p-9 rounded-3xl border border-surface-200 bg-white hover:bg-surface-50/50 hover:border-surface-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div className="absolute top-6 right-6 text-5xl font-black text-surface-100 group-hover:text-surface-200/80 transition-colors select-none pointer-events-none font-mono">
                {s.num}
              </div>

              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-105 transition-transform`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {s.title}
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   LEGACY VS ECOSENTINEL COMPARISON TABLE
   ═══════════════════════════════════════════ */
function ComparisonSection() {
  const rows = [
    { feature: 'Detection Method', old: 'Manual & Periodic Surveys', new: 'Autonomous Edge AI Stream', percent: 95 },
    { feature: 'Alert Broadcast Speed', old: 'Hours to Days', new: 'Real-Time (< 1.8 Seconds)', percent: 99 },
    { feature: 'Hazard Spectrum', old: 'Single Siloed Sensors', new: 'Unified Multi-Hazard Model', percent: 100 },
    { feature: 'Grid Connectivity', old: 'Requires Cellular & Power', new: 'Offline Solar LoRa Mesh', percent: 92 },
    { feature: 'Auditability', old: 'Black-box Raw Values', new: 'Full XAI Factor Explanations', percent: 100 },
  ];

  return (
    <section className="relative py-24 sm:py-32 lg:py-36 bg-surface-50 border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-50 border border-secondary-200 text-secondary-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparison Matrix
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Modernizing legacy disaster response
          </motion.h2>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.feature}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-surface-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                <div className="md:w-52 flex-shrink-0">
                  <div className="text-sm font-bold text-surface-900">{row.feature}</div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-critical-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-critical-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-surface-500 line-through">{row.old}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-surface-900 font-bold">{row.new}</span>
                  </div>
                </div>

                <div className="md:w-36 flex-shrink-0 flex items-center gap-3 justify-end">
                  <div className="w-20 sm:w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-primary-600 w-8 text-right">{row.percent}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PLATFORM FEATURES GRID
   ═══════════════════════════════════════════ */
function FeaturesSection() {
  const features = [
    { title: 'AI Risk Engine', desc: 'Predictive machine learning models scoring multi-sensor telemetry for hazard probability.', icon: Brain, gradient: 'from-violet-500 to-purple-600' },
    { title: 'Live Command Map', desc: 'Geospatial visualization of deployed nodes, hazard circles, and active threat perimeters.', icon: MapPin, gradient: 'from-primary-500 to-blue-600' },
    { title: 'Multi-Hazard Grid', desc: 'Unified early warning across floods, forest fires, and hazardous atmospheric emissions.', icon: Layers, gradient: 'from-orange-500 to-red-500' },
    { title: 'Sub-2s Smart Alerts', desc: 'Automated high-priority emergency broadcasts dispatched straight to field commanders.', icon: Zap, gradient: 'from-amber-500 to-yellow-500' },
    { title: 'Explainable AI', desc: 'Auditable mathematical breakdown of contributing risk factors for every generated alert.', icon: Shield, gradient: 'from-pink-500 to-rose-500' },
    { title: 'Offline LoRa Mesh', desc: 'Long-range mesh radio network maintaining communication when cell towers fail.', icon: Radio, gradient: 'from-emerald-500 to-teal-500' },
    { title: 'Historical Analytics', desc: 'Interactive charts comparing seasonal trend anomalies and environmental baselines.', icon: BarChart3, gradient: 'from-cyan-500 to-blue-500' },
    { title: 'Modular Hardware', desc: 'Plug-and-play solar sensor nodes engineered for rapid field deployment in hours.', icon: Server, gradient: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 lg:py-36 bg-white border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Platform Capabilities
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Enterprise capabilities for mission-critical defense
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="group p-7 rounded-2xl border border-surface-200 bg-white hover:border-primary-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {f.title}
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SPECIALIZED AI INTELLIGENCE MODELS
   ═══════════════════════════════════════════ */
function IntelligenceSection() {
  const [activeTab, setActiveTab] = useState(0);

  const cards = [
    {
      type: 'Flood Intelligence',
      tagline: 'Hydrological River Forecasting',
      desc: 'Correlates ultrasonic river gauge levels, rainfall velocity, and upstream runoff models to predict river overflow events up to 6 hours ahead.',
      features: ['Ultrasonic depth anomaly detection', 'Upstream-downstream velocity mapping', 'Inundation risk zone modeling', 'Automated evacuation alerts'],
      icon: Droplets,
      gradient: 'from-blue-600 to-cyan-500',
      activeBg: 'bg-blue-50/80',
      activeBorder: 'border-blue-300',
    },
    {
      type: 'Fire Intelligence',
      tagline: 'Thermal Outbreak Detection',
      desc: 'Evaluates rapid ambient thermal spikes, combustion gas build-ups (CO, VOC), and humidity drops to identify forest fires before smoke becomes visible.',
      features: ['Infrared thermal cluster tracking', 'Wind vector propagation projection', 'Combustion gas signature analysis', 'Vegetation dryness risk index'],
      icon: Flame,
      gradient: 'from-orange-600 to-red-500',
      activeBg: 'bg-orange-50/80',
      activeBorder: 'border-orange-300',
    },
    {
      type: 'Air Quality Intelligence',
      tagline: 'Toxic Dispersion Modeling',
      desc: 'Continuously measures PM2.5, PM10, CO2, NO2, and VOC concentrations to pinpoint industrial leaks and toxic smog surges in real-time.',
      features: ['Multi-pollutant AQI score indexing', 'Atmospheric dispersion mapping', 'Industrial emission tracking', 'Community warning broadcasts'],
      icon: Wind,
      gradient: 'from-amber-500 to-yellow-500',
      activeBg: 'bg-amber-50/80',
      activeBorder: 'border-amber-300',
    },
  ];

  const active = cards[activeTab];

  return (
    <section className="relative py-24 sm:py-32 lg:py-36 bg-surface-50 border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Brain className="w-3.5 h-3.5" />
            Decision-Assist AI
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Specialized AI models for every hazard type
          </motion.h2>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {cards.map((c, i) => (
            <button
              key={c.type}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-400 ${
                activeTab === i
                  ? `${c.activeBg} ${c.activeBorder} border-2 shadow-md text-surface-900`
                  : 'bg-white border border-surface-200 text-surface-600 hover:text-surface-900 hover:border-surface-300'
              }`}
            >
              <c.icon className="w-4.5 h-4.5" />
              {c.type}
            </button>
          ))}
        </div>

        {/* Selected Card View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <div className={`p-8 sm:p-12 rounded-3xl border-2 ${active.activeBorder} ${active.activeBg} shadow-xl`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${active.gradient} flex items-center justify-center text-white mb-5 shadow-lg`}>
                    <active.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    {active.type}
                  </h3>
                  <div className="text-xs font-bold text-primary-600 font-mono uppercase tracking-wider mb-4">{active.tagline}</div>
                  <p className="text-sm sm:text-base text-surface-600 leading-relaxed">{active.desc}</p>
                </div>

                <div className="space-y-3.5">
                  {active.features.map((f) => (
                    <div key={f} className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-surface-200/80 shadow-sm">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${active.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-surface-800">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MEASURABLE IMPACT PILLARS
   ═══════════════════════════════════════════ */
function ImpactSection() {
  const pillars = [
    { title: 'Technical', icon: Cpu, gradient: 'from-primary-500 to-blue-600', items: ['Autonomous telemetry processing', 'Predictive AI risk classification', 'Auditable decision explanations', 'Sub-2s alert broadcast speed'] },
    { title: 'Social', icon: Heart, gradient: 'from-pink-500 to-rose-500', items: ['Faster emergency response dispatch', 'Protected community infrastructure', 'Proactive early warning coverage', 'Reduced loss of human lives'] },
    { title: 'Environmental', icon: TreePine, gradient: 'from-emerald-500 to-green-600', items: ['Wildfire outbreak containment', 'Air pollution surge tracking', 'Flood zone early warning', 'Ecosystem habitat preservation'] },
    { title: 'Economic', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', items: ['Affordable sensor hardware cost', 'Minimized post-disaster recovery OPEX', 'Self-sustaining solar power nodes', 'Reduced insurance losses'] },
  ];

  return (
    <section id="impact" className="relative py-24 sm:py-32 lg:py-36 bg-surface-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-secondary-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Target className="w-3.5 h-3.5" />
            Measurable Impact
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Impact across every dimension
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="p-7 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between h-full"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {p.title} Impact
                </h3>
                <ul className="space-y-3">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/70">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${p.gradient} flex-shrink-0`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   STRATEGIC ROADMAP TIMELINE
   ═══════════════════════════════════════════ */
function RoadmapSection() {
  const stages = [
    { level: 'Phase 1', title: 'Village Pilot Network', desc: 'Deploy solar IoT sensor nodes in high-vulnerability pilot villages with live dashboard tracking.', status: 'Active', statusColor: 'bg-success-500', active: true },
    { level: 'Phase 2', title: 'District-Wide Mesh Grid', desc: 'Interconnect village sensor clusters into unified district monitoring grids.', status: 'Scaling', statusColor: 'bg-primary-500', active: false },
    { level: 'Phase 3', title: 'State Disaster Integration', desc: 'Integrate state disaster management authority command centers and emergency dispatch feeds.', status: 'Planned', statusColor: 'bg-amber-500', active: false },
    { level: 'Phase 4', title: 'National Scale Early Warning', desc: 'Deploy nationwide multi-hazard early warning grid with satellite fallback integration.', status: 'Vision', statusColor: 'bg-violet-500', active: false },
  ];

  return (
    <section id="roadmap" className="relative py-24 sm:py-32 lg:py-36 bg-white border-t border-surface-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Globe className="w-3.5 h-3.5" />
            Strategic Roadmap
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Scaling from villages to national defense
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {stages.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                s.active
                  ? 'bg-primary-50/60 border-primary-300 shadow-md'
                  : 'bg-white border-surface-200 hover:border-surface-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
                    {s.level}
                  </span>
                  <h3 className="text-xl font-bold text-surface-900" style={{ fontFamily: 'var(--font-heading)' }}>
                    {s.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.statusColor}`} />
                  <span className="text-xs font-mono font-bold text-surface-600 uppercase tracking-wider">{s.status}</span>
                </div>
              </div>
              <p className="text-sm text-surface-600 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FINAL CALL TO ACTION
   ═══════════════════════════════════════════ */
function CTASection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section className="relative py-24 sm:py-32 lg:py-36 bg-gradient-to-b from-[#020617] via-[#091126] to-[#030712] overflow-hidden text-center text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Build environmental resilience{' '}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-success-400">
              for your community today
            </span>
          </h2>
          <p className="mt-6 text-base sm:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed">
            Empower emergency management teams with real-time AI environmental intelligence and automated early warnings.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-5 h-5" />
              Launch Command Center
            </Link>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
            >
              <Play className="w-4 h-4 text-secondary-400 fill-secondary-400" />
              Watch Interactive Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[#020617] text-white/50 py-12 border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">EcoSentinel AI</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="#hero" className="hover:text-white transition-colors">Home</a>
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">Solution</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        </div>

        <div>
          © {new Date().getFullYear()} EcoSentinel AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   INTERACTIVE DEMO MODAL COMPONENT
   ═══════════════════════════════════════════ */
function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-surface-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-success-400 animate-pulse" />
            <span className="text-sm font-bold font-mono text-white">EcoSentinel AI — Simulation Tour</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Video simulation preview */}
        <div className="p-6">
          <div className="relative aspect-video rounded-2xl bg-[#020714] border border-white/10 overflow-hidden flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full">
                SIMULATED LIVE TELEMETRY STREAM
              </span>
              <span className="text-xs font-mono text-white/60">Node #84 — Assam Flood Sensor</span>
            </div>

            <div className="text-center py-8">
              <Play className="w-16 h-16 text-secondary-400 mx-auto fill-secondary-400/20 animate-pulse" />
              <h4 className="mt-4 text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                AI Flood & Fire Early Warning Walkthrough
              </h4>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto leading-relaxed">
                Demonstrating real-time edge micro-model anomaly scoring, LoRa mesh fallback relay, and sub-2s alert dispatch.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success-400" />
                <span>System Status: 100% Operational</span>
              </div>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 font-bold text-white text-xs hover:opacity-90 transition-opacity"
              >
                Open Live Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT EXPORT
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-surface-50">
      <LandingNav onOpenDemo={() => setDemoOpen(true)} />
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />
      <CrisisSection />
      <SolutionSection />
      <ComparisonSection />
      <FeaturesSection />
      <IntelligenceSection />
      <ImpactSection />
      <RoadmapSection />
      <CTASection onOpenDemo={() => setDemoOpen(true)} />
      <Footer />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
}
