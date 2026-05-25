import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { BackgroundFX } from "../components/fx/BackgroundFX";
import { Navbar } from "../components/layout/Navbar";
import { MagneticButton } from "../components/ui/MagneticButton";
import { analyze, type AnalysisInput, type Equipment, type Experience, type Gender, type Goal } from "../lib/analysis";
import { useInput, useResult } from "../lib/store";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/analysis")({ component: AnalysisPage });

const STEPS = ["You", "Body", "Health", "Lifestyle", "Goal", "Equipment"] as const;

function AnalysisPage() {
  const [step, setStep] = useState(0);
  const [, setInput] = useInput();
  const [, setResult] = useResult();
  const nav = useNavigate();

  const [form, setForm] = useState<AnalysisInput>({
    name: "",
    age: 28,
    gender: "male",
    heightCm: 178,
    weightKg: 76,
    waistCm: 82,
    injuries: [],
    diet: "omnivore",
    goal: "build-muscle",
    experience: "intermediate",
    equipment: "gym",
    sleepHours: 7,
    activeDaysPerWeek: 3,
    waterLiters: 2.2,
  });

  const update = <K extends keyof AnalysisInput>(k: K, v: AnalysisInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.name || !form.name.trim()) return "Please enter your name.";
      if (!form.age || form.age < 10 || form.age > 100) return "Please enter a valid age (10–100).";
      if (!form.gender) return "Please select a gender.";
    }
    if (s === 1) {
      if (!form.heightCm || form.heightCm < 100 || form.heightCm > 250) return "Please enter a valid height (100–250 cm).";
      if (!form.weightKg || form.weightKg < 30 || form.weightKg > 300) return "Please enter a valid weight (30–300 kg).";
    }
    if (s === 2) {
      if (!form.diet) return "Please select a diet preference.";
    }
    if (s === 3) {
      if (form.sleepHours == null || form.activeDaysPerWeek == null || form.waterLiters == null) return "Please fill in all lifestyle fields.";
    }
    if (s === 4) {
      if (!form.goal) return "Please choose a goal.";
      if (!form.experience) return "Please select your experience level.";
    }
    if (s === 5) {
      if (!form.equipment) return "Please select available equipment.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    for (let i = 0; i <= STEPS.length - 1; i++) {
      const err = validateStep(i);
      if (err) { setStep(i); toast.error(err); return; }
    }
    const result = analyze(form);
    setInput(form);
    setResult(result);
    nav({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />
      <main className="mx-auto w-[min(820px,calc(100%-2rem))] pt-28 pb-20">
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary/80">Fitness Analysis</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Tell us about you
          </h1>
        </div>

        {/* Stepper */}
        <div className="mb-10 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition ${
                i === step ? "bg-primary/15 text-primary ring-1 ring-primary/40" :
                i < step ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : <span className="opacity-60">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-8 md:p-10 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="space-y-6"
            >
              {step === 0 && <StepYou form={form} update={update} />}
              {step === 1 && <StepBody form={form} update={update} />}
              {step === 2 && <StepHealth form={form} update={update} />}
              {step === 3 && <StepLifestyle form={form} update={update} />}
              {step === 4 && <StepGoal form={form} update={update} />}
              {step === 5 && <StepEquipment form={form} update={update} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <MagneticButton onClick={next}>Continue <ArrowRight className="h-4 w-4" /></MagneticButton>
          ) : (
            <MagneticButton onClick={finish}>Generate score <ArrowRight className="h-4 w-4" /></MagneticButton>
          )}
        </div>
      </main>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{children}</span>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-foreground/5 px-4 py-3 text-sm outline-none ring-1 ring-foreground/10 transition focus:ring-2 focus:ring-primary/60"
    />
  );
}
function Pill<T extends string>({ value, current, onClick, children }: { value: T; current: T; onClick: (v: T) => void; children: React.ReactNode }) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-xl px-4 py-2.5 text-sm transition ring-1 ${
        active ? "bg-primary/15 text-primary ring-primary/40 neon-glow" : "bg-foreground/5 text-muted-foreground ring-foreground/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function StepYou({ form, update }: any) {
  return (
  <div className="grid gap-5 sm:grid-cols-2">
      <label><Label>Name</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
      <label><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => update("age", +e.target.value)} /></label>
      <div className="sm:col-span-2">
        <Label>Gender</Label>
        <div className="flex flex-wrap gap-2">
          {(["male", "female", "other"] as Gender[]).map((g) => (
            <Pill key={g} value={g} current={form.gender} onClick={(v) => update("gender", v)}>{g[0].toUpperCase() + g.slice(1)}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBody({ form, update }: any) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label><Label>Height (cm)</Label><Input type="number" value={form.heightCm} onChange={(e) => update("heightCm", +e.target.value)} /></label>
      <label><Label>Weight (kg)</Label><Input type="number" value={form.weightKg} onChange={(e) => update("weightKg", +e.target.value)} /></label>
      <label><Label>Waist (cm, optional)</Label><Input type="number" value={form.waistCm} onChange={(e) => update("waistCm", +e.target.value)} /></label>
      <div className="rounded-xl bg-foreground/5 px-4 py-3 ring-1 ring-foreground/10">
        <Label>BMI preview</Label>
        <div className="font-display text-2xl font-semibold neon-text">
          {(form.weightKg / Math.pow(form.heightCm / 100, 2)).toFixed(1)}
        </div>
      </div>
    </div>
  );
}

function StepHealth({ form, update }: any) {
  const toggle = (v: string) => {
    const has = form.injuries.includes(v);
    update("injuries", has ? form.injuries.filter((x: string) => x !== v) : [...form.injuries, v]);
  };
  const options = ["Lower back", "Knee", "Shoulder", "Wrist", "Hip", "Neck"];
  const presetSet = new Set(options);
  const customInjuries: string[] = form.injuries.filter((x: string) => !presetSet.has(x));
  const [customDraft, setCustomDraft] = useState("");
  const addCustom = () => {
    const v = customDraft.trim();
    if (!v) { toast.error("Please enter the injury or issue."); return; }
    if (form.injuries.includes(v)) { toast.error("Already added."); return; }
    update("injuries", [...form.injuries, v]);
    setCustomDraft("");
  };
  return (
    <div className="space-y-6">
      <div>
        <Label>Injuries or pain points</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={`rounded-xl px-4 py-2.5 text-sm ring-1 transition ${
                form.injuries.includes(o) ? "bg-primary/15 text-primary ring-primary/40" : "bg-foreground/5 text-muted-foreground ring-foreground/10 hover:text-foreground"
              }`}
            >
              {o}
            </button>
          ))}
          {customInjuries.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className="rounded-xl px-4 py-2.5 text-sm ring-1 transition bg-primary/15 text-primary ring-primary/40"
              title="Click to remove"
            >
              {o} ×
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Other — type an injury or issue and press Enter"
            className="flex-1 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 transition focus:ring-2 focus:ring-primary/60"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-xl bg-primary/15 px-4 py-2.5 text-sm text-primary ring-1 ring-primary/40 transition hover:bg-primary/20"
          >
            Add
          </button>
        </div>
      </div>
      <div>
        <Label>Diet preference</Label>
        <div className="flex flex-wrap gap-2">
          {(["omnivore", "vegetarian", "vegan", "pescatarian"] as const).map((d) => (
            <Pill key={d} value={d} current={form.diet} onClick={(v) => update("diet", v)}>{d[0].toUpperCase() + d.slice(1)}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepLifestyle({ form, update }: any) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label><Label>Sleep (hrs / night): {form.sleepHours}</Label>
        <input type="range" min={4} max={10} step={0.5} value={form.sleepHours} onChange={(e) => update("sleepHours", +e.target.value)} className="w-full accent-[color:var(--neon)]" />
      </label>
      <label><Label>Active days / week: {form.activeDaysPerWeek}</Label>
        <input type="range" min={0} max={7} value={form.activeDaysPerWeek} onChange={(e) => update("activeDaysPerWeek", +e.target.value)} className="w-full accent-[color:var(--neon)]" />
      </label>
      <label className="sm:col-span-2"><Label>Water (L / day): {form.waterLiters.toFixed(1)}</Label>
        <input type="range" min={0.5} max={5} step={0.1} value={form.waterLiters} onChange={(e) => update("waterLiters", +e.target.value)} className="w-full accent-[color:var(--neon)]" />
      </label>
    </div>
  );
}

function StepGoal({ form, update }: any) {
  const goals: { v: Goal; label: string; desc: string }[] = [
    { v: "lose-fat", label: "Lose fat", desc: "Cut body fat, keep muscle." },
    { v: "build-muscle", label: "Build muscle", desc: "Hypertrophy & visible gains." },
    { v: "strength", label: "Get stronger", desc: "Heavy compound progression." },
    { v: "endurance", label: "Endurance", desc: "Aerobic capacity, longer runs." },
    { v: "general-health", label: "Stay healthy", desc: "Longevity & feeling great." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {goals.map((g) => {
        const active = form.goal === g.v;
        return (
          <button
            key={g.v}
            type="button"
            onClick={() => update("goal", g.v)}
            className={`text-left rounded-2xl p-5 ring-1 transition ${
              active ? "bg-primary/10 ring-primary/50 neon-glow" : "bg-foreground/5 ring-foreground/10 hover:bg-foreground/10"
            }`}
          >
            <div className="font-display text-lg font-semibold">{g.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{g.desc}</div>
          </button>
        );
      })}
      <div className="sm:col-span-2">
        <Label>Experience</Label>
        <div className="flex flex-wrap gap-2">
          {(["beginner", "intermediate", "advanced"] as Experience[]).map((e) => (
            <Pill key={e} value={e} current={form.experience} onClick={(v) => update("experience", v)}>{e[0].toUpperCase() + e.slice(1)}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepEquipment({ form, update }: any) {
  const items: { v: Equipment; label: string; desc: string }[] = [
    { v: "gym", label: "Full Gym", desc: "Barbells, machines, cables." },
    { v: "home-gym", label: "Home Gym", desc: "Rack + bench + dumbbells." },
    { v: "dumbbells", label: "Dumbbells Only", desc: "One adjustable pair." },
    { v: "none", label: "No Equipment", desc: "Bodyweight everywhere." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((it) => {
        const active = form.equipment === it.v;
        return (
          <button
            key={it.v}
            type="button"
            onClick={() => update("equipment", it.v)}
            className={`text-left rounded-2xl p-5 ring-1 transition ${
              active ? "bg-primary/10 ring-primary/50 neon-glow" : "bg-foreground/5 ring-foreground/10 hover:bg-foreground/10"
            }`}
          >
            <div className="font-display text-lg font-semibold">{it.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{it.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
