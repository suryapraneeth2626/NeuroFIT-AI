import { motion } from "motion/react";
import { Navbar } from "./layout/Navbar";
import { BackgroundFX } from "./fx/BackgroundFX";
import type { ReactNode } from "react";

export function PageShell({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow?: string; title?: string; subtitle?: string }) {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />
      <main className="mx-auto w-[min(1180px,calc(100%-2rem))] pt-28 pb-20">
        {(eyebrow || title) && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="mb-10"
          >
            {eyebrow && (
              <div className="text-[11px] uppercase tracking-[0.3em] text-primary/80 mb-3">{eyebrow}</div>
            )}
            {title && <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">{title}</h1>}
            {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground text-balance">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </main>
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-6 ${className}`}>{children}</div>;
}
