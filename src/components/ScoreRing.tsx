import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";

export function ScoreRing({ score, size = 260 }: { score: number; size?: number }) {
  const r = (size - 28) / 2;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(0);
  const offset = useTransform(progress, (v) => c - (v / 100) * c);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(progress, score, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1] });
    const counter = animate(0, score, {
      duration: 1.6,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => { controls.stop(); counter.stop(); };
  }, [score, progress]);

  const grade = score >= 85 ? "Elite" : score >= 70 ? "Strong" : score >= 55 ? "Building" : score >= 40 ? "Developing" : "Starting";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--neon)" />
            <stop offset="60%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--neon-2)" />
          </linearGradient>
          <filter id="ringGlow"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#ringGrad)" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} style={{ strokeDashoffset: offset, filter: "url(#ringGlow)" }}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#ringGrad)" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Fitness Score</span>
        <span className="font-display text-6xl font-semibold neon-text leading-none mt-2">{display}</span>
        <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1">/ 100 · {grade}</span>
      </div>
    </div>
  );
}
