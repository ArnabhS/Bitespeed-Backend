import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { rateLimiter } from "./config/rate-limiter";
import { jsonOnly } from "./middlewares/json-only";
import { errorHandler } from "./middlewares/error-handler";
import router from "./routes/index";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST","PUT","DELETE"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json());
  app.use(jsonOnly);
  app.use(rateLimiter);

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
