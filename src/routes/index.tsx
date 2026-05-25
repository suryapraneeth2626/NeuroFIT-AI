import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Zap, LineChart, ShieldCheck } from "lucide-react";
import { BackgroundFX } from "../components/fx/BackgroundFX";
import { Navbar } from "../components/layout/Navbar";
import { MagneticButton } from "../components/ui/MagneticButton";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI Analysis", desc: "Get a precise fitness score from 12 health vectors." },
  { icon: LineChart, title: "Smart Roadmap", desc: "Weekly milestones engineered for compounding gains." },
  { icon: Zap, title: "Adaptive Plans", desc: "Workouts that flex with your equipment and recovery." },
  { icon: ShieldCheck, title: "Evidence-Based", desc: "Built on peer-reviewed strength & nutrition science." },
];

function Landing() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      {/* HERO */}
      <section className="relative mx-auto flex min-h-screen w-[min(1180px,calc(100%-2rem))] flex-col items-center justify-center pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-2.5 text-sm md:text-base uppercase tracking-[0.25em] text-muted-foreground"
        >
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          AI-Powered Fitness Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-8 max-w-5xl text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]"
        >
          Your body, <span className="neon-text">decoded</span>.
          <br /> Your potential, unlocked.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-6 max-w-2xl text-balance text-base md:text-lg text-muted-foreground"
        >
          NeuroFIT analyzes your physiology, lifestyle and goals to produce a real fitness score
          and an evidence-based roadmap to reach elite performance — fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/auth">
            <MagneticButton>
              Start Analysis <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </Link>
          <Link to="/analysis">
            <MagneticButton variant="ghost">Skip login</MagneticButton>
          </Link>
        </motion.div>

        {/* Floating stat badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="pointer-events-none absolute inset-0 hidden md:block"
        >
          <FloatingBadge className="left-[6%] top-[28%]" label="VO₂ Max" value="48.2" />
          <FloatingBadge className="right-[8%] top-[34%]" label="Recovery" value="92%" delay={0.4} />
          <FloatingBadge className="left-[10%] bottom-[16%]" label="Protein" value="168g" delay={0.8} />
          <FloatingBadge className="right-[6%] bottom-[20%]" label="Score" value="84" delay={1.2} accent />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
        >
          Scroll
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto w-[min(1180px,calc(100%-2rem))] py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-primary/80">The System</div>
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Six pillars. One score. <span className="neon-text">Zero guesswork.</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ y: -4 }}
              className="glass group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: "linear-gradient(120deg, transparent 30%, oklch(0.85 0.18 165 / 0.15), transparent 70%)" }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-[min(1180px,calc(100%-2rem))] pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-strong relative overflow-hidden rounded-3xl p-12 text-center md:p-20"
        >
          <div className="absolute inset-0 mesh-bg opacity-60" />
          <div className="relative">
            <h3 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
              Train like the <span className="neon-text">data</span> says.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Two minutes of input. A lifetime operating system for your fitness.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/analysis">
                <MagneticButton>Run my analysis <ArrowRight className="h-4 w-4" /></MagneticButton>
              </Link>
            </div>
          </div>
        </motion.div>
        <div className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NeuroFIT · Evidence-based fitness intelligence
        </div>
      </section>
    </div>
  );
}

function FloatingBadge({ className = "", label, value, delay = 0, accent = false }: { className?: string; label: string; value: string; delay?: number; accent?: boolean }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
      className={`absolute ${className}`}
    >
      <div className={`glass-strong rounded-2xl px-4 py-3 ${accent ? "neon-glow" : ""}`}>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
        <div className={`font-display text-2xl font-semibold ${accent ? "neon-text" : "text-foreground"}`}>{value}</div>
      </div>
    </motion.div>
  );
}
