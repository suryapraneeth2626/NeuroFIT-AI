import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageShell, Card } from "../components/PageShell";
import { useInput, useResult } from "../lib/store";
import { buildMealPlan, preferredFoods } from "../lib/analysis";
import { Leaf, Drumstick } from "lucide-react";
import { MagneticButton } from "../components/ui/MagneticButton";

export const Route = createFileRoute("/nutrition")({ component: NutritionPage });

function NutritionPage() {
  const [input] = useInput();
  const [result] = useResult();

  if (!input || !result) {
    return (
      <PageShell eyebrow="Nutrition" title="Run analysis first">
        <Link to="/analysis"><MagneticButton>Start analysis</MagneticButton></Link>
      </PageShell>
    );
  }

  const meals = buildMealPlan(input, result);
  const macros = [
    { name: "Protein", grams: result.proteinGrams, color: "oklch(0.85 0.18 165)" },
    { name: "Carbs", grams: Math.round((result.calorieTarget * 0.45) / 4), color: "oklch(0.72 0.22 295)" },
    { name: "Fats", grams: Math.round((result.calorieTarget * 0.25) / 9), color: "oklch(0.78 0.18 220)" },
  ];

  return (
    <PageShell eyebrow="Diet & Nutrition" title="Fuel built for your goal" subtitle={`${result.calorieTarget} kcal target · ${input.diet} · evidence-based macro split`}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <h3 className="font-display text-lg font-semibold">Daily macros</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {macros.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-foreground/5 p-5 ring-1 ring-foreground/10"
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{m.name}</div>
                <div className="mt-2 font-display text-3xl font-semibold" style={{ color: m.color }}>{m.grams}g</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }} className="h-full rounded-full" style={{ background: m.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Hydration target</h3>
          <div className="mt-4 font-display text-5xl font-semibold neon-text">{(input.weightKg * 0.033).toFixed(1)}L</div>
          <p className="mt-2 text-sm text-muted-foreground">Based on 33ml per kg of body weight. Add 500ml per hour of training.</p>
        </Card>
      </div>

      <h2 className="mt-14 mb-5 font-display text-2xl font-semibold tracking-tight">Daily plan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {meals.map((m, i) => (
          <motion.div
            key={m.meal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-baseline justify-between">
              <div className="font-display text-lg font-semibold">{m.meal}</div>
              <div className="text-xs text-primary">{m.kcal} kcal</div>
            </div>
            <ul className="mt-3 space-y-2">
              {m.items.map((it) => (
                <li key={it} className="text-sm text-muted-foreground">{it}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-14 mb-2 font-display text-2xl font-semibold tracking-tight">Preferred foods</h2>
      <p className="mb-5 text-sm text-muted-foreground">Swap-friendly options for each meal — pick from the column that matches your diet.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {preferredFoods.map((group) => (
          <Card key={group.meal}>
            <div className="font-display text-lg font-semibold">{group.meal}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-emerald-500">
                  <Leaf className="h-3.5 w-3.5" /> Vegetarian
                </div>
                <ul className="space-y-1.5">
                  {group.veg.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--neon-2)]">
                  <Drumstick className="h-3.5 w-3.5" /> Non-vegetarian
                </div>
                <ul className="space-y-1.5">
                  {group.nonVeg.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--neon-2)]" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
