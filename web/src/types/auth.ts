import { z } from "zod";

export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
});

export const loginResponseSchema = z.object({
  success: z.literal(true),
  token: z.string().min(1),
  user: publicUserSchema,
});

export type PublicUser = z.infer<typeof publicUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
