import { IContactRepository } from "../interfaces/contact.interface";
import { IdentifyRequest, IdentifyResponse } from "../interfaces/identify.interface";
import { Contact } from "../models/contact.model";

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const email = request.email ?? null;
    const phoneNumber = request.phoneNumber ?? null;
    const matches = await this.repository.findByEmailOrPhone(email, phoneNumber);

    const primaryMap = await this.resolvePrimaries(matches);

    if (primaryMap.size === 0) {
      const newContact = await this.repository.create({
        email,
        phone_number: phoneNumber,
        linked_id: null,
        link_precedence: "primary",
      });
      return this.buildResponse(newContact.id);
    }

    // Sort primaries oldest first — the oldest one always wins
    const primaries = [...primaryMap.values()].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const winner = primaries[0];

    // Scenario 4: Two or more separate primary clusters → merge them
    if (primaries.length > 1) {
      await this.mergeClusters(winner, primaries.slice(1));
    }

    // Scenarios 2 & 3: Check whether the request carries info new to the cluster.
    // Re-fetch the cluster after a potential merge so the set is fully up to date.
    const cluster = await this.repository.findClusterByPrimaryId(winner.id);
    const existingEmails = new Set(cluster.map((c) => c.email).filter(Boolean));
    const existingPhones = new Set(cluster.map((c) => c.phone_number).filter(Boolean));

    const hasNewEmail = email !== null && !existingEmails.has(email);
    const hasNewPhone = phoneNumber !== null && !existingPhones.has(phoneNumber);

    // Scenario 3: New information present → create a secondary contact
    if (hasNewEmail || hasNewPhone) {
      await this.repository.create({
        email,
        phone_number: phoneNumber,
        linked_id: winner.id,
        link_precedence: "secondary",
      });
    }

    // ─── POST: Build the consolidated response ────────────────────────────────
    return this.buildResponse(winner.id);
  }

  // Resolve the root primary for each match. Secondaries point to their primary
  // via linked_id; we fetch that primary once and cache it in the map.
  private async resolvePrimaries(matches: Contact[]): Promise<Map<number, Contact>> {
    const primaryMap = new Map<number, Contact>();

    for (const contact of matches) {
      if (contact.link_precedence === "primary") {
        primaryMap.set(contact.id, contact);
      } else if (contact.linked_id !== null && !primaryMap.has(contact.linked_id)) {
        const primary = await this.repository.findById(contact.linked_id);
        if (primary) primaryMap.set(primary.id, primary);
      }
    }

    return primaryMap;
  }

  // Demote each losing primary to secondary and re-link all of its children
  // directly to the winner so the cluster stays flat.
  private async mergeClusters(winner: Contact, losers: Contact[]): Promise<void> {
    for (const loser of losers) {
      const loserCluster = await this.repository.findClusterByPrimaryId(loser.id);

      const loserChildIds = loserCluster
        .filter((c) => c.id !== loser.id)
        .map((c) => c.id);

      // Demote the losing primary
      await this.repository.update(loser.id, {
        link_precedence: "secondary",
        linked_id: winner.id,
      });

      // Re-point all former children straight to the winner
      if (loserChildIds.length > 0) {
        await this.repository.updateMany(loserChildIds, { linked_id: winner.id });
      }
    }
  }

  private async buildResponse(primaryId: number): Promise<IdentifyResponse> {
    const cluster = await this.repository.findClusterByPrimaryId(primaryId);

    const primary = cluster.find((c) => c.id === primaryId)!;
    const secondaries = cluster.filter((c) => c.id !== primaryId);

    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    if (primary.email) emails.push(primary.email);
    if (primary.phone_number) phoneNumbers.push(primary.phone_number);

    for (const contact of secondaries) {
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
      if (contact.phone_number && !phoneNumbers.includes(contact.phone_number)) {
        phoneNumbers.push(contact.phone_number);
      }
      secondaryContactIds.push(contact.id);
    }

    return {
      contact: {
        primaryContatctId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}
