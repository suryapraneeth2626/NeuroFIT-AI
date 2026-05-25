import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { PageShell, Card } from "../components/PageShell";
import { MagneticButton } from "../components/ui/MagneticButton";
import { Star } from "lucide-react";

export const Route = createFileRoute("/feedback")({ component: FeedbackPage });

function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <PageShell eyebrow="Feedback" title="Help us tune the system" subtitle="Your input directly shapes the scoring engine and the next coach features.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="font-display text-3xl font-semibold neon-text">Thank you.</div>
              <p className="mt-2 text-muted-foreground">Logged. We read every word.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-6">
              <div>
                <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Overall experience</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className="transition"
                    >
                      <Star className={`h-7 w-7 ${(hover || rating) >= n ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">What should we improve?</div>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={6}
                  placeholder="Tell us anything…"
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 text-sm outline-none ring-1 ring-foreground/10 transition focus:ring-2 focus:ring-primary/60"
                />
              </div>
              <MagneticButton>Submit feedback</MagneticButton>
            </form>
          )}
        </Card>
        <Card className="p-8">
          <h3 className="font-display text-lg font-semibold">What we're working on</h3>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li>• Wearable sync (Apple Health, Whoop, Oura)</li>
            <li>• Photo-based body composition tracking</li>
            <li>• Voice-first coach conversations</li>
            <li>• Personalized supplement protocols</li>
            <li>• Recovery score with HRV inputs</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
