import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageShell, Card } from "../components/PageShell";
import { useInput } from "../lib/store";
import { buildWorkoutPlan, smartWorkoutRecs, exerciseLibrary } from "../lib/analysis";
import { Lightbulb, BookOpen } from "lucide-react";
import { MagneticButton } from "../components/ui/MagneticButton";

export const Route = createFileRoute("/workout")({ component: WorkoutPage });

function WorkoutPage() {
  const [input] = useInput();

  if (!input) {
    return (
      <PageShell eyebrow="Workout Plan" title="Run analysis first" subtitle="Your workout plan is generated from your equipment, experience and recovery profile.">
        <Link to="/analysis"><MagneticButton>Start analysis</MagneticButton></Link>
      </PageShell>
    );
  }

  const plan = buildWorkoutPlan(input);
  const smartRecs = smartWorkoutRecs(input);

  return (
    <PageShell eyebrow="Workout Plan" title="Your 7-day operating system" subtitle={`Calibrated for ${input.equipment.replace("-", " ")} · ${input.experience} · goal: ${input.goal.replace("-", " ")}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plan.map((d, i) => (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{d.day}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{d.focus}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{d.focus}</h3>
            <ul className="mt-4 space-y-2">
              {d.exercises.map((ex) => (
                <li key={ex} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{ex}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <Card className="mt-10">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Smart recommendations</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Personalised based on your goal, recovery and experience.</p>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {smartRecs.map((rec) => (
            <li key={rec} className="rounded-xl bg-foreground/5 p-3 text-sm ring-1 ring-foreground/10">
              <span className="mr-2 text-primary">→</span>{rec}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6">
        <h3 className="font-display text-lg font-semibold">Training principles</h3>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>• Progressive overload — add reps or load every 1–2 weeks.</li>
          <li>• Train each muscle 2x / week for hypertrophy (Schoenfeld 2016).</li>
          <li>• Leave 1–3 reps in reserve for most working sets.</li>
          <li>• Deload every 4–6 weeks for joint and CNS recovery.</li>
        </ul>
      </Card>

      <div className="mt-12 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Exercise library</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Reference cues for the staples — keep technique honest as load climbs.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exerciseLibrary.map((group) => (
          <div key={group.category} className="glass rounded-2xl p-5">
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">{group.category}</div>
            <ul className="mt-3 space-y-3">
              {group.items.map((ex) => (
                <li key={ex.name} className="border-t border-foreground/5 pt-3 first:border-0 first:pt-0">
                  <div className="font-medium">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">{ex.muscles}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{ex.cue}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
