import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

export const CoachInputSchema = z.object({
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

export type CoachInput = z.infer<typeof CoachInputSchema>;
export type CoachReply = { reply: string; error: string | null };
export type CoachEnv = Record<string, unknown> | undefined;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
  };
};

function readEnv(env: CoachEnv, key: string): string | undefined {
  const boundValue = env?.[key];
  if (typeof boundValue === "string" && boundValue.trim()) {
    return boundValue;
  }

  const processEnv =
    typeof process !== "undefined" && typeof process.env === "object" ? process.env : undefined;
  const processValue = processEnv?.[key];
  return processValue?.trim() || undefined;
}

function buildGeminiUrl(env: CoachEnv): string {
  const apiBase =
    readEnv(env, "GEMINI_API_BASE_URL") ?? "https://generativelanguage.googleapis.com";
  const model = (readEnv(env, "GEMINI_MODEL") ?? "gemini-2.5-flash").replace(/^models\//, "");
  return `${apiBase.replace(/\/$/, "")}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

function toGeminiContents(messages: CoachInput["messages"]) {
  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  const conversation = firstUserIndex === -1 ? messages : messages.slice(firstUserIndex);

  return conversation
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
}

export async function getCoachReply(input: CoachInput, env?: CoachEnv): Promise<CoachReply> {
  const data = CoachInputSchema.parse(input);
  const apiKey = readEnv(env, "GEMINI_API_KEY");

  if (!apiKey) {
    return { reply: "", error: "Gemini is not configured. Please contact support." };
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
    const res = await fetch(buildGeminiUrl(env), {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: toGeminiContents(data.messages),
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429)
        return { reply: "", error: "Rate limit reached. Please try again in a moment." };
      if (res.status === 402)
        return { reply: "", error: "AI credits exhausted. Please add credits to continue." };
      const text = await res.text();
      console.error("Gemini API error:", res.status, text);
      return { reply: "", error: "The AI coach is temporarily unavailable." };
    }

    const json = (await res.json()) as GeminiResponse;
    const reply =
      json.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n")
        .trim() ?? "";

    if (!reply) {
      console.error("Gemini API returned no text:", JSON.stringify(json));
      return { reply: "", error: "The AI coach could not generate a response." };
    }

    return { reply, error: null };
  } catch (error) {
    console.error("getCoachReply failed:", error);
    return { reply: "", error: "Network error reaching the AI coach." };
  }
}

export async function handleCoachApiRequest(request: Request, env?: CoachEnv): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: coachCorsHeaders(env) });
  }

  if (request.method !== "POST") {
    return Response.json(
      { reply: "", error: "Method not allowed." },
      { status: 405, headers: coachCorsHeaders(env) },
    );
  }

  try {
    const payload = await request.json();
    const result = await getCoachReply(payload, env);
    return Response.json(result, { headers: coachCorsHeaders(env) });
  } catch (error) {
    console.error("Invalid coach request:", error);
    return Response.json(
      { reply: "", error: "Invalid coach request." },
      { status: 400, headers: coachCorsHeaders(env) },
    );
  }
}

function coachCorsHeaders(env: CoachEnv): HeadersInit {
  return {
    "Access-Control-Allow-Origin": readEnv(env, "COACH_ALLOWED_ORIGIN") ?? "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
