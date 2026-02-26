import rateLimit from "express-rate-limit";
import { env } from "./env";

export const rateLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});
