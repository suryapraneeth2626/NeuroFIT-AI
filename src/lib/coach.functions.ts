import { createServerFn } from "@tanstack/react-start";

import { CoachInputSchema, getCoachReply } from "./coach-api";

export const chatWithCoach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CoachInputSchema.parse(input))
  .handler(async ({ data }) => getCoachReply(data));
