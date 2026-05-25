import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Activity } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workout", label: "Workout" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/coach", label: "AI Coach" },
  { to: "/feedback", label: "Feedback" },
  { to: "/profile", label: "Profile" },
];

export function Navbar() {
  const { location } = useRouterState();
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-4 left-1/2 z-50 w-[min(1180px,calc(100%-2rem))] -translate-x-1/2"
    >
      <div className="glass-strong flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 pr-2">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">Neuro<span className="text-primary">FIT</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-foreground/5 ring-1 ring-foreground/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          to="/analysis"
          className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110 neon-glow"
        >
          New Analysis
        </Link>
      </div>
    </motion.header>
  );
}
