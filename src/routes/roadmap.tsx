import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageShell, Card } from "../components/PageShell";
import { useInput, useResult } from "../lib/store";
import { MagneticButton } from "../components/ui/MagneticButton";
import { buildRoadmap } from "../lib/analysis";
import { Target, CalendarDays, FlaskConical, Utensils, Dumbbell, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/roadmap")({ component: RoadmapPage });

function RoadmapPage() {
  const [input] = useInput();
  const [result] = useResult();

  if (!input || !result) {
    return (
      <PageShell eyebrow="Roadmap" title="Run analysis first">
        <Link to="/analysis"><MagneticButton>Start analysis</MagneticButton></Link>
      </PageShell>
    );
  }

  const roadmap = buildRoadmap(input, result);
  const targetScore = Math.min(100, result.score + 12);

  return (
    <PageShell
      eyebrow="Goal Progress & Roadmap"
      title={`Your 12-week ${roadmap.goalLabel.toLowerCase()} plan`}
      subtitle={roadmap.summary}
    >
      {/* Targets summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <Target className="h-3.5 w-3.5" /> Weekly target
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">{roadmap.weeklyTarget}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <CalendarDays className="h-3.5 w-3.5" /> Monthly target
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">{roadmap.monthlyTarget}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <FlaskConical className="h-3.5 w-3.5" /> Score trajectory
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            <span className="text-muted-foreground">{result.score}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="neon-text">{targetScore}</span>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Trajectory</div>
        <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(result.score / targetScore) * 100}%` }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--neon), var(--neon-2))" }}
          />
        </div>
      </Card>

      {/* Phases */}
      <h2 className="mt-12 mb-5 font-display text-2xl font-semibold tracking-tight">Phased roadmap</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-white/10 to-transparent md:left-1/2" />
        <div className="space-y-8">
          {roadmap.phases.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`relative grid gap-4 md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="md:text-right">
                <div className="text-[10px] uppercase tracking-[0.25em] text-primary">{p.range}</div>
                <div className="mt-1 font-display text-3xl font-semibold tracking-tight">{p.title}</div>
                <p className="mt-2 text-sm text-muted-foreground md:ml-auto md:max-w-xs">{p.focus}</p>
              </div>
              <div className="glass rounded-2xl p-5 space-y-4">
                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Targets</div>
                  <ul className="space-y-1.5">
                    {p.targets.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-foreground/5 p-3 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-500">
                      <Utensils className="h-3 w-3" /> Nutrition
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.nutrition}</div>
                  </div>
                  <div className="rounded-xl bg-foreground/5 p-3 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[color:var(--neon-2)]">
                      <Dumbbell className="h-3 w-3" /> Training
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.training}</div>
                  </div>
                </div>
              </div>
              <div className="absolute left-4 top-2 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full bg-primary ring-4 ring-primary/20 md:left-1/2" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <Card className="mt-12">
        <h3 className="font-display text-lg font-semibold">Evidence base</h3>
        <p className="mt-2 text-sm text-muted-foreground">These targets are built from peer-reviewed sport-science literature, not generic templates.</p>
        <ul className="mt-4 space-y-2">
          {roadmap.evidence.map((e) => (
            <li key={e} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{e}
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}
