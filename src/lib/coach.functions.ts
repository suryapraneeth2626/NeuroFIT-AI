import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  context: z
    .object({
      name: z.string().max(80).optional(),
      age: z.number().optional(),
      gender: z.string().max(20).optional(),
      heightCm: z.number().optional(),
      weightKg: z.number().optional(),
      goal: z.string().max(40).optional(),
      experience: z.string().max(40).optional(),
      equipment: z.string().max(40).optional(),
      diet: z.string().max(40).optional(),
      injuries: z.array(z.string().max(80)).optional(),
      sleepHours: z.number().optional(),
      activeDaysPerWeek: z.number().optional(),
      waterLiters: z.number().optional(),
      score: z.number().optional(),
      bmi: z.number().optional(),
      bmr: z.number().optional(),
      tdee: z.number().optional(),
      proteinGrams: z.number().optional(),
    })
    .partial()
    .optional(),
});

export const chatWithCoach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "AI is not configured. Please contact support." };
    }

    const ctx = data.context ?? {};
    const ctxLines = Object.entries(ctx)
      .filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");

    const system = `You are NeuroFIT's AI fitness coach. Give evidence-based, concise, friendly answers about training, nutrition, recovery, and habit-building. Use the user's profile below to personalize advice. Avoid medical diagnoses; suggest consulting a professional for medical concerns. Format answers in clear markdown with short paragraphs and bullet points where useful.

User profile:
${ctxLines || "(no profile data yet)"}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: system }, ...data.messages],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { reply: "", error: "Rate limit reached. Please try again in a moment." };
        if (res.status === 402) return { reply: "", error: "AI credits exhausted. Please add credits to continue." };
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        return { reply: "", error: "The AI coach is temporarily unavailable." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const reply = json.choices?.[0]?.message?.content ?? "";
      return { reply, error: null as string | null };
    } catch (e) {
      console.error("chatWithCoach failed:", e);
      return { reply: "", error: "Network error reaching the AI coach." };
    }
  });
