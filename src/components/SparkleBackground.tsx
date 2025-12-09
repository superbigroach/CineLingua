'use client';

import { useEffect, useRef } from 'react';

export default function SparkleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Sparkles
    const colors = [
      { r: 168, g: 85, b: 247 },
      { r: 139, g: 92, b: 246 },
      { r: 59, g: 130, b: 246 },
      { r: 6, g: 182, b: 212 },
      { r: 34, g: 197, b: 94 },
      { r: 245, g: 158, b: 11 },
      { r: 236, g: 72, b: 153 },
    ];

    const sparkles = Array.from({ length: 25 }, () => ({
      baseX: Math.random(),
      baseY: Math.random(),
      size: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random(),
      speed: 0.5 + Math.random() * 0.5,
      floatSpeed: 0.2 + Math.random() * 0.3,
      floatRadius: 10 + Math.random() * 15
    }));

    const glowOrbs = [
      { x: 0.2, y: 0.3, radius: 100, color: { r: 168, g: 85, b: 247 }, phase: 0 },
      { x: 0.8, y: 0.7, radius: 80, color: { r: 6, g: 182, b: 212 }, phase: 0.33 },
      { x: 0.6, y: 0.1, radius: 90, color: { r: 59, g: 130, b: 246 }, phase: 0.66 },
    ];

    function animate() {
      time += 0.005;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw glow orbs
      glowOrbs.forEach(orb => {
        const pulse = 0.8 + 0.4 * Math.sin((time * 0.5 + orb.phase) * Math.PI * 2);
        const radius = orb.radius * pulse;
        const gradient = ctx!.createRadialGradient(
          orb.x * canvas!.width, orb.y * canvas!.height, 0,
          orb.x * canvas!.width, orb.y * canvas!.height, radius
        );
        gradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${0.12 * pulse})`);
        gradient.addColorStop(0.5, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${0.04 * pulse})`);
        gradient.addColorStop(1, 'transparent');
        ctx!.beginPath();
        ctx!.fillStyle = gradient;
        ctx!.arc(orb.x * canvas!.width, orb.y * canvas!.height, radius, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Draw sparkles
      sparkles.forEach(sparkle => {
        const floatX = sparkle.baseX * canvas!.width + sparkle.floatRadius * Math.sin((time * sparkle.floatSpeed + sparkle.phase) * Math.PI * 2);
        const floatY = sparkle.baseY * canvas!.height + sparkle.floatRadius * Math.cos((time * sparkle.floatSpeed + sparkle.phase) * Math.PI * 2);
        const twinklePhase = (time * sparkle.speed + sparkle.phase) % 1;
        const twinkle = Math.sin(twinklePhase * Math.PI * 4) * 0.5 + 0.5;
        const size = sparkle.size * (0.5 + twinkle * 0.8);
        const opacity = 0.3 + twinkle * 0.5;

        const gradient = ctx!.createRadialGradient(floatX, floatY, 0, floatX, floatY, size * 3);
        gradient.addColorStop(0, `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${opacity * 0.4})`);
        gradient.addColorStop(1, 'transparent');
        ctx!.beginPath();
        ctx!.fillStyle = gradient;
        ctx!.arc(floatX, floatY, size * 3, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${opacity})`;
        ctx!.arc(floatX, floatY, size, 0, Math.PI * 2);
        ctx!.fill();

        if (twinkle > 0.7) {
          ctx!.beginPath();
          ctx!.fillStyle = `rgba(255, 255, 255, ${0.6 * twinkle})`;
          ctx!.arc(floatX, floatY, size * 0.3, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #08080c 0%, #0a0a14 50%, #08080c 100%)' }}
    />
  );
}
