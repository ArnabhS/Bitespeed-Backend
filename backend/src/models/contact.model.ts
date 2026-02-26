export type LinkPrecedence = "primary" | "secondary";

export interface Contact {
  id: number;
  phone_number: string | null;
  email: string | null;
  linked_id: number | null;
  link_precedence: LinkPrecedence;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateContactPayload {
  phone_number?: string | null;
  email?: string | null;
  linked_id?: number | null;
  link_precedence: LinkPrecedence;
}

export interface UpdateContactPayload {
  linked_id?: number | null;
  link_precedence?: LinkPrecedence;
  updated_at?: string;
}
