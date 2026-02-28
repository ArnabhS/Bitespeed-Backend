import { SupabaseClient } from "@supabase/supabase-js";
import { IContactRepository } from "../interfaces/contact.interface";
import { Contact, CreateContactPayload, UpdateContactPayload } from "../models/contact.model";
import { AppError } from "../middlewares/error-handler";

const TABLE = "contacts";

export class ContactRepository implements IContactRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByEmailOrPhone(
    email: string | null,
    phoneNumber: string | null
  ): Promise<Contact[]> {
    if (!email && !phoneNumber) return [];

    const seenIds = new Set<number>();
    const results: Contact[] = [];

    if (email) {
      const { data, error } = await this.db
        .from(TABLE)
        .select("*")
        .eq("email", email)
        .is("deleted_at", null);

      if (error) throw new AppError(500, `DB error: ${error.message}`);
      for (const row of data as Contact[]) {
        seenIds.add(row.id);
        results.push(row);
      }
    }

    if (phoneNumber) {
      const { data, error } = await this.db
        .from(TABLE)
        .select("*")
        .eq("phone_number", phoneNumber)
        .is("deleted_at", null);

      if (error) throw new AppError(500, `DB error: ${error.message}`);
      for (const row of data as Contact[]) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          results.push(row);
        }
      }
    }

    return results;
  }

  async findById(id: number): Promise<Contact | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(500, `DB error: ${error.message}`);
    return data as Contact | null;
  }

  async findClusterByPrimaryId(primaryId: number): Promise<Contact[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .or(`id.eq.${primaryId},linked_id.eq.${primaryId}`)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new AppError(500, `DB error: ${error.message}`);
    return data as Contact[];
  }

  async create(payload: CreateContactPayload): Promise<Contact> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return this.findDuplicate(payload);
      throw new AppError(500, `DB error: ${error.message}`);
    }
    return data as Contact;
  }

  private async findDuplicate(payload: CreateContactPayload): Promise<Contact> {
    let query = this.db.from(TABLE).select("*").is("deleted_at", null);

    if (payload.email) query = query.eq("email", payload.email);
    if (payload.phone_number) query = query.eq("phone_number", payload.phone_number);

    const { data, error } = await query.limit(1).single();

    if (error) throw new AppError(500, `DB error: ${error.message}`);
    return data as Contact;
  }

  async update(id: number, payload: UpdateContactPayload): Promise<Contact> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new AppError(500, `DB error: ${error.message}`);
    return data as Contact;
  }

  async updateMany(ids: number[], payload: UpdateContactPayload): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await this.db
      .from(TABLE)
      .update(payload)
      .in("id", ids);

    if (error) throw new AppError(500, `DB error: ${error.message}`);
  }
}
