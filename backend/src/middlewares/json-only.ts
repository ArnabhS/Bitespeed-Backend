import { Request, Response, NextFunction } from "express";

export function jsonOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== "GET" && !req.is("application/json")) {
    res.status(415).json({ error: "Content-Type must be application/json." });
    return;
  }
  next();
}
