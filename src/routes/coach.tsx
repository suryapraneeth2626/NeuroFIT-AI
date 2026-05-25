import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { PageShell } from "../components/PageShell";
import { MagneticButton } from "../components/ui/MagneticButton";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { useInput, useResult } from "../lib/store";
import { chatWithCoach } from "../lib/coach.functions";

export const Route = createFileRoute("/coach")({ component: CoachPage });

interface Msg { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "How do I improve my fitness score?",
  "Best protein sources for my diet?",
  "I missed a workout. What now?",
  "How to break a strength plateau?",
];

function CoachPage() {
  const [input] = useInput();
  const [result] = useResult();
  const nav = useNavigate();
  const chat = useServerFn(chatWithCoach);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Hey ${input?.name || "there"} — I'm your NeuroFIT AI coach. Ask me anything about your plan, your score, or how to push harder this week.` },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("pulse.input");
    if (!stored) nav({ to: "/analysis", replace: true });
  }, [nav]);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setDraft("");
    setTyping(true);
    setError(null);
    try {
      const context = {
        name: input?.name || undefined,
        age: input?.age,
        gender: input?.gender,
        heightCm: input?.heightCm,
        weightKg: input?.weightKg,
        goal: input?.goal,
        experience: input?.experience,
        equipment: input?.equipment,
        diet: input?.diet,
        injuries: input?.injuries,
        sleepHours: input?.sleepHours,
        activeDaysPerWeek: input?.activeDaysPerWeek,
        waterLiters: input?.waterLiters,
        score: result?.score,
        bmi: result?.bmi,
        bmr: result?.bmr,
        tdee: result?.tdee,
        proteinGrams: result?.proteinGrams,
      };
      const res = await chat({ data: { messages: next.map((m) => ({ role: m.role, content: m.content })), context } });
      if (res.error) {
        setError(res.error);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: res.reply || "Sorry, I couldn't generate a response." }]);
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong reaching the AI coach.");
    } finally {
      setTyping(false);
    }
  };

  if (!input) {
    return (
      <PageShell eyebrow="AI Coach" title="Enter your details first" subtitle="The AI coach personalises answers from your analysis. Run a 2-minute assessment to unlock it.">
        <Link to="/analysis"><MagneticButton>Start analysis <ArrowRight className="h-4 w-4" /></MagneticButton></Link>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="AI Coach" title="Talk to your trainer" subtitle="Contextual answers calibrated to your latest analysis. Available 24/7.">

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="glass-strong flex h-[min(70vh,520px)] flex-col rounded-3xl">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-hide">
            <AnimatePresence initial={false}>
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/5 ring-1 ring-foreground/10 text-foreground"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-strong:text-foreground">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="rounded-2xl bg-foreground/5 px-4 py-3 ring-1 ring-foreground/10">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {error && (
                <div className="rounded-xl bg-destructive/10 px-4 py-2 text-xs text-destructive ring-1 ring-destructive/30">{error}</div>
              )}
            </AnimatePresence>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
            className="flex items-center gap-2 border-t border-foreground/10 p-4"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 rounded-xl bg-foreground/5 px-4 py-3 text-sm outline-none ring-1 ring-foreground/10 transition focus:ring-2 focus:ring-primary/60"
            />
            <button type="submit" disabled={typing} className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground neon-glow disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Try asking
          </div>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="block w-full text-left glass rounded-xl p-4 text-sm text-muted-foreground transition hover:text-foreground hover:bg-foreground/5"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
