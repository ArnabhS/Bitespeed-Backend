import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate";
import { ContactController } from "../controllers/contact.controller";
import { ContactService } from "../services/contact.service";
import { ContactRepository } from "../repositories/contact.repository";
import { getSupabaseClient } from "../config/database";

const router = Router();

const identifySchema = z
  .object({
    email: z.string().email().nullable().optional(),
    phoneNumber: z.string().min(1).nullable().optional(),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "At least one of email or phoneNumber must be provided.",
  });

const repository = new ContactRepository(getSupabaseClient());
const service = new ContactService(repository);
const controller = new ContactController(service);

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

router.post("/identify", validate(identifySchema), controller.identify);

export default router;
