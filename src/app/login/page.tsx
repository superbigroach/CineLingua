'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginUserSync, getCurrentUser } from '@/lib/userStore';

// Sparkle Background Class (adapted from StellarStudio.SB)
class SparkleBackground {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  sparkles: any[] = [];
  glowOrbs: any[] = [];
  shootingStars: any[] = [];
  particles: any[] = [];
  animationId: number | null = null;
  time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.init();
    this.createSparkles();
    this.createGlowOrbs();
    this.createShootingStars();
    this.createParticles();
    this.animate();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createSparkles() {
    const colors = [
      { r: 168, g: 85, b: 247 },
      { r: 139, g: 92, b: 246 },
      { r: 59, g: 130, b: 246 },
      { r: 6, g: 182, b: 212 },
      { r: 34, g: 197, b: 94 },
      { r: 245, g: 158, b: 11 },
      { r: 236, g: 72, b: 153 },
    ];

    for (let i = 0; i < 25; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.sparkles.push({
        baseX: Math.random(),
        baseY: Math.random(),
        size: 1 + Math.random() * 2,
        color,
        phase: Math.random(),
        speed: 0.5 + Math.random() * 0.5,
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatRadius: 10 + Math.random() * 15
      });
    }
  }

  createGlowOrbs() {
    this.glowOrbs = [
      { x: 0.2, y: 0.3, radius: 100, color: { r: 168, g: 85, b: 247 }, phase: 0 },
      { x: 0.8, y: 0.7, radius: 80, color: { r: 6, g: 182, b: 212 }, phase: 0.33 },
      { x: 0.6, y: 0.1, radius: 90, color: { r: 59, g: 130, b: 246 }, phase: 0.66 },
    ];
  }

  createShootingStars() {
    for (let i = 0; i < 2; i++) {
      this.shootingStars.push(this.generateShootingStar(i === 0));
    }
  }

  generateShootingStar(fromLeft: boolean) {
    return {
      fromLeft,
      phase: Math.random(),
      duration: 0.18 + Math.random() * 0.12,
      baseHeight: fromLeft ? 0.15 + Math.random() * 0.25 : 0.55 + Math.random() * 0.3,
      amplitude: 0.02 + Math.random() * 0.05,
      waveFreq: 1 + Math.random() * 1.5,
      trailLength: 22 + Math.random() * 18,
      headRadius: 1.4 + Math.random() * 0.9,
      headColor: fromLeft ? { r: 255, g: 213, b: 79 } : { r: 34, g: 211, b: 238 },
      trailColor: fromLeft ? { r: 255, g: 87, b: 34 } : { r: 59, g: 130, b: 246 }
    };
  }

  createParticles() {
    for (let i = 0; i < 15; i++) {
      this.particles.push({ offset: i / 15, y: 0.2 + Math.random() * 0.6 });
    }
  }

  drawSparkle(sparkle: any) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const floatX = sparkle.baseX * w + sparkle.floatRadius * Math.sin((this.time * sparkle.floatSpeed + sparkle.phase) * Math.PI * 2);
    const floatY = sparkle.baseY * h + sparkle.floatRadius * Math.cos((this.time * sparkle.floatSpeed + sparkle.phase) * Math.PI * 2);

    const twinklePhase = (this.time * sparkle.speed + sparkle.phase) % 1;
    const twinkle = Math.sin(twinklePhase * Math.PI * 4) * 0.5 + 0.5;
    const size = sparkle.size * (0.5 + twinkle * 0.8);
    const opacity = 0.3 + twinkle * 0.5;

    const gradient = this.ctx.createRadialGradient(floatX, floatY, 0, floatX, floatY, size * 3);
    gradient.addColorStop(0, `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${opacity * 0.4})`);
    gradient.addColorStop(1, 'transparent');

    this.ctx.beginPath();
    this.ctx.fillStyle = gradient;
    this.ctx.arc(floatX, floatY, size * 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${opacity})`;
    this.ctx.arc(floatX, floatY, size, 0, Math.PI * 2);
    this.ctx.fill();

    if (twinkle > 0.7) {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * twinkle})`;
      this.ctx.arc(floatX, floatY, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawGlowOrbs() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.glowOrbs.forEach(orb => {
      const pulse = 0.8 + 0.4 * Math.sin((this.time * 0.5 + orb.phase) * Math.PI * 2);
      const radius = orb.radius * pulse;

      const gradient = this.ctx.createRadialGradient(orb.x * w, orb.y * h, 0, orb.x * w, orb.y * h, radius);
      gradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${0.15 * pulse})`);
      gradient.addColorStop(0.5, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${0.05 * pulse})`);
      gradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.arc(orb.x * w, orb.y * h, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawShootingStars() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.shootingStars.forEach(star => {
      const adjustedProgress = (this.time * 0.3 + star.phase) % 1;
      if (adjustedProgress > star.duration) return;

      const progress = adjustedProgress / star.duration;
      const startX = star.fromLeft ? -60 : w + 60;
      const endX = star.fromLeft ? w + 60 : -60;
      const currentX = startX + (endX - startX) * progress;

      const baseY = h * star.baseHeight;
      const wave = h * star.amplitude * Math.sin(progress * Math.PI * (1.2 + star.waveFreq));
      const currentY = baseY + wave;

      const trailDir = star.fromLeft ? 1 : -1;
      const trailLen = star.trailLength * (0.8 + 0.2 * Math.sin(progress * Math.PI));
      const trailStartX = currentX - trailDir * trailLen;
      const trailStartY = currentY + 2 * Math.sin(progress * Math.PI * 2);

      const trailGradient = this.ctx.createLinearGradient(trailStartX, trailStartY, currentX, currentY);
      trailGradient.addColorStop(0, 'transparent');
      trailGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
      trailGradient.addColorStop(1, `rgba(${star.trailColor.r}, ${star.trailColor.g}, ${star.trailColor.b}, 0.6)`);

      this.ctx.beginPath();
      this.ctx.strokeStyle = trailGradient;
      this.ctx.lineWidth = 1.8;
      this.ctx.moveTo(trailStartX, trailStartY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();

      const glowGradient = this.ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, star.headRadius * 4);
      glowGradient.addColorStop(0, `rgba(${star.headColor.r}, ${star.headColor.g}, ${star.headColor.b}, 0.4)`);
      glowGradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.fillStyle = glowGradient;
      this.ctx.arc(currentX, currentY, star.headRadius * 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${star.headColor.r}, ${star.headColor.g}, ${star.headColor.b}, 0.9)`;
      this.ctx.arc(currentX, currentY, star.headRadius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawParticles() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.particles.forEach(particle => {
      const progress = (this.time * 0.1 + particle.offset) % 1;
      const x = w * progress;
      const y = h * particle.y + 40 * Math.sin(progress * Math.PI * 4);
      const opacity = Math.sin(progress * Math.PI) * 0.3;

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGlowOrbs();
    this.sparkles.forEach(sparkle => this.drawSparkle(sparkle));
    this.drawParticles();
    this.drawShootingStars();
    this.time += 0.016;
    this.animationId = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkleRef = useRef<SparkleBackground | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = getCurrentUser();
    if (user) {
      router.push('/');
      return;
    }

    // Initialize sparkle background
    if (canvasRef.current && !sparkleRef.current) {
      sparkleRef.current = new SparkleBackground(canvasRef.current);
    }

    return () => {
      if (sparkleRef.current) {
        sparkleRef.current.stop();
      }
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!name.trim() || name.length < 2) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    loginUserSync(email, name);

    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#050508' }}>
      {/* Sparkle Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.5 }}
      />

      {/* Grid Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Animated Logo Container */}
        <div className="relative w-36 h-36 mb-8">
          {/* Glow Effect */}
          <div
            className="absolute -inset-12 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              animation: 'white-glow-pulse 2s ease-in-out infinite'
            }}
          />
          {/* Logo */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ animation: 'float 4s ease-in-out infinite' }}
          >
            <img
              src="/assets/logo.png"
              alt="CineLingua Logo"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">
          <span className="text-white">Cine</span>
          <span
            className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Lingua
          </span>
        </h1>
        <p className="text-white/50 text-lg mb-10 text-center">
          Learn languages through cinema
        </p>

        {/* Login Form Card */}
        <div className="w-full max-w-md">
          <div
            className="relative p-8 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(6, 182, 212, 0.15)'
            }}
          >
            {/* Card glow border */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)'
              }}
            />

            <form onSubmit={handleSubmit} className="relative space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 text-white text-base placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 text-white text-base placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>Get Started</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-white/30 text-xs">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
          {[
            { icon: '🎬', label: 'Learn Through Cinema' },
            { icon: '🤖', label: 'AI-Powered Tutoring' },
            { icon: '🏆', label: 'Weekly Contests' },
            { icon: '💰', label: 'Win USDC Prizes' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-white/50 text-xs">{feature.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-xs">
            Powered by <span className="text-cyan-400/60">Gemini AI</span> &bull; Built with Next.js
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes white-glow-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
