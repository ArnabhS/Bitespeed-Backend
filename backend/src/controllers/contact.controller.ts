import { Request, Response, NextFunction } from "express";
import { ContactService } from "../services/contact.service";
import { IdentifyRequest } from "../interfaces/identify.interface";

export class ContactController {
  constructor(private readonly service: ContactService) {}

  identify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as IdentifyRequest;
      const result = await this.service.identify(body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
