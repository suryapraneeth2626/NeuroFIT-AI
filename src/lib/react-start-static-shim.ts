type StaticCoachReply = { reply: string; error: string | null };

export function useServerFn<T extends (...args: Array<unknown>) => unknown>(serverFn: T): T {
  return serverFn;
}

export function createServerFn(options?: { method?: string }) {
  const builder = {
    inputValidator() {
      return builder;
    },
    handler() {
      return async (input?: { data?: unknown }): Promise<StaticCoachReply> => {
        const apiUrl = import.meta.env.VITE_COACH_API_URL;
        if (!apiUrl) {
          return {
            reply: "",
            error: "The AI coach backend is not connected for this GitHub Pages build.",
          };
        }

        try {
          const response = await fetch(apiUrl, {
            method: options?.method ?? "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input?.data ?? input),
          });
          return (await response.json()) as StaticCoachReply;
        } catch (error) {
          console.error(error);
          return { reply: "", error: "Network error reaching the AI coach." };
        }
      };
    },
  };

  return builder;
}
