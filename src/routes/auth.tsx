import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { BackgroundFX } from "../components/fx/BackgroundFX";
import { MagneticButton } from "../components/ui/MagneticButton";
import { useUser } from "../lib/store";
import { Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setUser] = useUser();
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !name.trim()) { toast.error("Please enter your name."); return; }
    if (!email.trim()) { toast.error("Please enter your email."); return; }
    if (!password.trim()) { toast.error("Please enter your password."); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    // Demo-only auth: we never persist passwords or send them anywhere.
    // Only a display name + email are stored locally so the dashboard can greet the user.
    setUser({ name: name || email.split("@")[0], email });
    setPassword("");
    nav({ to: "/analysis" });
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <div className="mx-auto flex min-h-screen w-[min(440px,calc(100%-2rem))] flex-col justify-center py-20">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">Neuro<span className="text-primary">FIT</span></span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-8"
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Resume your analysis" : "Start your fitness intelligence journey"}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" autoComplete="off">
            {/* Hidden honeypot inputs to suppress browser autofill of the real fields */}
            <input type="text" name="fakeusernameremembered" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden />
            <input type="password" name="fakepasswordremembered" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden />
            {mode === "signup" && (
              <Field label="Name" value={name} onChange={setName} autoComplete="off" />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@neurofit.app" autoComplete="off" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" />

            <MagneticButton className="w-full mt-2">
              {mode === "login" ? "Sign in" : "Create account"}
            </MagneticButton>
            <p className="text-center text-[10px] text-muted-foreground">Demo only — credentials are never sent or stored on a server.</p>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground transition"
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Link to="/analysis" className="block text-center text-sm text-primary hover:underline">
            Skip login → run analysis
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, autoComplete = "off" }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        className="w-full rounded-xl bg-foreground/5 px-4 py-3 text-sm outline-none ring-1 ring-foreground/10 transition focus:ring-2 focus:ring-primary/60"
      />
    </label>
  );
}
