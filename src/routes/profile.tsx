import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Card } from "../components/PageShell";
import { useInput, useResult, useUser } from "../lib/store";
import { MagneticButton } from "../components/ui/MagneticButton";
import { useTheme, type Accent, type Mode } from "../lib/theme";
import { LogOut, RotateCcw, Download, Info, Sun, Moon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const [user, setUser] = useUser();
  const [input, setInput] = useInput();
  const [result, setResult] = useResult();
  const { mode, accent, setMode, setAccent } = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  const nav = useNavigate();

  const exportData = () => {
    if (!input && !result) { toast.error("No data to export yet."); return; }
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      input,
      result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neurofit-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Dashboard data exported");
  };

  return (
    <PageShell eyebrow="Profile" title="Account & preferences" subtitle="Manage your data, customize appearance, and learn how NeuroFIT works.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Account</h3>
          <div className="mt-5 space-y-3">
            <Row label="Name" value={user?.name ?? "Guest"} />
            <Row label="Email" value={user?.email ?? "Not signed in"} />
            <Row label="Plan" value="Free · Beta" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <button onClick={() => { setUser(null); nav({ to: "/" }); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link to="/auth"><MagneticButton>Sign in</MagneticButton></Link>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Analysis data</h3>
          <div className="mt-5 space-y-3">
            <Row label="Last score" value={result ? `${result.score} / 100` : "—"} />
            <Row label="Goal" value={input?.goal?.replace("-", " ") ?? "—"} />
            <Row label="Equipment" value={input?.equipment?.replace("-", " ") ?? "—"} />
            <Row label="Experience" value={input?.experience ?? "—"} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/analysis"><MagneticButton><RotateCcw className="h-4 w-4" /> Re-run analysis</MagneticButton></Link>
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm ring-1 ring-foreground/10 hover:bg-foreground/10 transition"
            >
              <Download className="h-4 w-4" /> Export dashboard data
            </button>
            <button
              onClick={() => { setInput(null); setResult(null); toast.success("Data cleared"); }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive transition"
            >
              Clear data
            </button>
          </div>
        </Card>

        {/* Theme */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Appearance</h3>
            <button
              onClick={() => setAboutOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2 text-xs ring-1 ring-foreground/10 hover:bg-foreground/10 transition"
            >
              <Info className="h-3.5 w-3.5" /> About NeuroFIT
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Mode</div>
              <div className="inline-flex rounded-xl bg-foreground/5 p-1 ring-1 ring-foreground/10">
                <ModeBtn current={mode} value="light" onClick={setMode} icon={<Sun className="h-3.5 w-3.5" />}>Light</ModeBtn>
                <ModeBtn current={mode} value="dark" onClick={setMode} icon={<Moon className="h-3.5 w-3.5" />}>Dark</ModeBtn>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Color theme</div>
              <div className="flex flex-wrap gap-3">
                <Swatch current={accent} value="default" onClick={setAccent} label="Mint (default)" gradient="linear-gradient(135deg, oklch(0.62 0.2 165), oklch(0.6 0.22 295))" />
                <Swatch current={accent} value="ember" onClick={setAccent} label="Ember" gradient="linear-gradient(135deg, oklch(0.68 0.22 35), oklch(0.72 0.2 55))" />
                <Swatch current={accent} value="azure" onClick={setAccent} label="Azure" gradient="linear-gradient(135deg, oklch(0.62 0.2 240), oklch(0.65 0.22 210))" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-foreground/5 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-sm capitalize">{value}</span>
    </div>
  );
}

function ModeBtn({ current, value, onClick, icon, children }: { current: Mode; value: Mode; onClick: (v: Mode) => void; icon: React.ReactNode; children: React.ReactNode }) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}{children}
    </button>
  );
}

function Swatch({ current, value, onClick, label, gradient }: { current: Accent; value: Accent; onClick: (v: Accent) => void; label: string; gradient: string }) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 ring-1 transition ${active ? "ring-primary/60 bg-primary/5" : "ring-foreground/10 hover:bg-foreground/5"}`}
    >
      <span className="h-7 w-7 rounded-full ring-2 ring-background" style={{ background: gradient }} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-strong relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition">
          <X className="h-4 w-4" />
        </button>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary/80">About</div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">How NeuroFIT works</h2>

        <Section title="1. Using the app">
          Start by signing in (or skip login) and complete the 2-minute analysis. Enter your body
          metrics, activity level, sleep, nutrition, goals, equipment, and any injuries. The
          dashboard, workout, nutrition, roadmap, and AI coach modules then become personalized
          to your profile. Re-run the analysis any time your circumstances change.
        </Section>

        <Section title="2. How your data is analyzed">
          NeuroFIT converts your inputs into six performance pillars: Body Composition, Activity,
          Sleep, Hydration, Recovery, and Training Base. Each pillar is scored 0–100 using
          peer-reviewed formulas — BMI categories (WHO), BMR via Mifflin-St Jeor, TDEE from
          activity multipliers, protein targets (1.6–2.2 g/kg per ISSN guidelines), and sleep
          thresholds (NSF). The composite is a weighted average producing your fitness score.
        </Section>

        <Section title="3. How recommendations work">
          Risk detection flags sedentary lifestyle, sleep deficiency, poor hydration, low protein
          intake, and body-composition outliers based on threshold rules. The roadmap engine
          builds a 12-week phased plan tailored to your goal (fat loss, muscle gain, strength,
          endurance, or weight gain) using evidence-based progression principles (Helms 2014 for
          hypertrophy volume, Seiler 2010 for 80/20 endurance polarization). Workout
          recommendations adapt to your equipment, experience level, and injuries.
        </Section>

        <Section title="4. AI coach">
          The chat coach uses Google Gemini and is grounded with your analysis snapshot so
          replies reference your actual numbers. It is informational only — not medical advice.
        </Section>

        <Section title="5. Your data">
          All inputs and results are stored locally in your browser (localStorage). Nothing is
          uploaded except the prompts you send to the AI coach. Use "Export dashboard data" to
          download a JSON backup, or "Clear data" to wipe it.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
