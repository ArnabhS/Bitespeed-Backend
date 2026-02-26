import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_MAX: z.string().default("100"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
