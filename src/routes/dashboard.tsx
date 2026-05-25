import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { PageShell, Card } from "../components/PageShell";
import { ScoreRing } from "../components/ScoreRing";
import { useInput, useResult } from "../lib/store";
import { MagneticButton } from "../components/ui/MagneticButton";
import { detectRisks } from "../lib/analysis";
import { ArrowRight, Flame, Droplet, Moon, Activity, Dumbbell, Heart, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const pillarIcons: Record<string, any> = {
  "Body Composition": Heart,
  "Activity": Activity,
  "Sleep": Moon,
  "Hydration": Droplet,
  "Recovery": Flame,
  "Training Base": Dumbbell,
};

function Dashboard() {
  const [input] = useInput();
  const [result] = useResult();
  const nav = useNavigate();
  const risks = input && result ? detectRisks(input, result) : [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    // First-time guard: if no input has been entered yet, force the analysis flow.
    const stored = window.localStorage.getItem("pulse.input");
    if (!stored) {
      nav({ to: "/analysis", replace: true });
    }
  }, [nav]);

  if (!result || !input) {
    return (
      <PageShell eyebrow="Dashboard" title="Let's get your baseline first" subtitle="The dashboard unlocks after a 2-minute assessment so every number is personalized to you.">
        <Link to="/analysis"><MagneticButton>Start analysis <ArrowRight className="h-4 w-4" /></MagneticButton></Link>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Dashboard" title={`Hey ${input.name || "athlete"}, here's your snapshot.`} subtitle="Updated from your latest analysis. Tap into a module to dive deeper.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Score */}
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <ScoreRing score={result.score} />
          <div className="mt-6 text-sm text-muted-foreground max-w-xs">
            Composite score from {result.pillars.length} physiological & lifestyle vectors.
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="BMI" value={result.bmi.toFixed(1)} sub={result.bmiCategory} />
          <Stat label="BMR" value={`${result.bmr}`} sub="kcal at rest" />
          <Stat label="TDEE" value={`${result.tdee}`} sub="kcal / day" />
          <Stat label="Target" value={`${result.calorieTarget}`} sub="kcal goal" highlight />
          <Stat label="Protein" value={`${result.proteinGrams}g`} sub="daily target" />
          <Stat label="Streak" value="0" sub="days · start today" />
        </div>
      </div>

      {/* Pillars */}
      <h2 className="mt-14 mb-5 font-display text-2xl font-semibold tracking-tight">Performance pillars</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {result.pillars.map((p, i) => {
          const Icon = pillarIcons[p.name] ?? Activity;
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="font-medium">{p.name}</div>
                </div>
                <div className="font-display text-xl font-semibold">{p.value}</div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.value}%` }}
                  transition={{ duration: 1.1, delay: 0.1 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--neon), var(--neon-2))" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Strengths</h3>
          <ul className="mt-4 space-y-2">
            {(result.strengths.length ? result.strengths : ["Consistent baseline — keep stacking habits"]).map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />{s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Areas to improve</h3>
          <ul className="mt-4 space-y-2">
            {(result.weaknesses.length ? result.weaknesses : ["Everything is on track — push intensity"]).map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--neon-2)]" />{s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Risk detection */}
      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--neon-2)]/10 ring-1 ring-[color:var(--neon-2)]/30">
            <AlertTriangle className="h-4 w-4 text-[color:var(--neon-2)]" />
          </div>
          <h3 className="font-display text-lg font-semibold">Risk detection</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Health-risk signals flagged from your inputs. Address high-severity items first.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {risks.map((risk) => {
            const tone = risk.severity === "high"
              ? { ring: "ring-red-500/40", bg: "bg-red-500/5", chip: "bg-red-500/15 text-red-500", Icon: ShieldAlert }
              : risk.severity === "moderate"
              ? { ring: "ring-amber-500/40", bg: "bg-amber-500/5", chip: "bg-amber-500/15 text-amber-500", Icon: AlertTriangle }
              : { ring: "ring-emerald-500/40", bg: "bg-emerald-500/5", chip: "bg-emerald-500/15 text-emerald-500", Icon: ShieldCheck };
            const Icon = tone.Icon;
            return (
              <div key={risk.label} className={`rounded-xl p-4 ring-1 ${tone.ring} ${tone.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4" />
                    <div className="font-medium">{risk.label}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone.chip}`}>{risk.severity}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{risk.detail}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="font-display text-lg font-semibold">Top recommendations</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.recommendations.map((r) => (
            <div key={r.title} className="rounded-xl bg-foreground/5 p-4 ring-1 ring-foreground/10">
              <div className="font-medium">{r.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{r.detail}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/workout"><MagneticButton>Open workout plan <ArrowRight className="h-4 w-4" /></MagneticButton></Link>
        <Link to="/nutrition"><MagneticButton variant="ghost">Open nutrition plan</MagneticButton></Link>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`glass rounded-2xl p-5 ${highlight ? "ring-1 ring-primary/40 neon-glow" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-semibold ${highlight ? "neon-text" : "text-foreground"}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </motion.div>
  );
}
