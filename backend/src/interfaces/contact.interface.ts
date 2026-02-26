import { Contact, CreateContactPayload, UpdateContactPayload } from "../models/contact.model";

export interface IContactRepository {
  findByEmailOrPhone(email: string | null, phoneNumber: string | null): Promise<Contact[]>;
  findById(id: number): Promise<Contact | null>;
  findClusterByPrimaryId(primaryId: number): Promise<Contact[]>;
  create(payload: CreateContactPayload): Promise<Contact>;
  update(id: number, payload: UpdateContactPayload): Promise<Contact>;
  updateMany(ids: number[], payload: UpdateContactPayload): Promise<void>;
}
