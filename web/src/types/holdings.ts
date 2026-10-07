import { z } from "zod";

export const METALS = ["gold", "silver", "platinum"] as const;
export type Metal = (typeof METALS)[number];

export const holdingsResponseSchema = z.object({
  success: z.literal(true),
  unit: z.literal("g"),
  holdings: z.object({
    gold: z.number().nonnegative(),
    silver: z.number().nonnegative(),
    platinum: z.number().nonnegative(),
  }),
  updatedAt: z.string().nullable(),
});

export type HoldingsResponse = z.infer<typeof holdingsResponseSchema>;
