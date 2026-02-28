import { IContactRepository } from "../interfaces/contact.interface";
import { IdentifyRequest, IdentifyResponse } from "../interfaces/identify.interface";
import { Contact } from "../models/contact.model";
import { AppError } from "../middlewares/error-handler";

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = this.normalizeRequest(request);

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

    const primaries = [...primaryMap.values()].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const winner = primaries[0];

    if (primaries.length > 1) {
      await this.mergeClusters(winner, primaries.slice(1));
    }

    const cluster = await this.repository.findClusterByPrimaryId(winner.id);
    const existingEmails = new Set(cluster.map((c) => c.email).filter(Boolean));
    const existingPhones = new Set(cluster.map((c) => c.phone_number).filter(Boolean));

    const hasNewEmail = email !== null && !existingEmails.has(email);
    const hasNewPhone = phoneNumber !== null && !existingPhones.has(phoneNumber);

    if (hasNewEmail || hasNewPhone) {
      await this.repository.create({
        email,
        phone_number: phoneNumber,
        linked_id: winner.id,
        link_precedence: "secondary",
      });
    }

    return this.buildResponse(winner.id);
  }

  private normalizeRequest(request: IdentifyRequest): {
    email: string | null;
    phoneNumber: string | null;
  } {
    let email = request.email?.trim().toLowerCase() ?? null;
    if (email === "") email = null;

    let phoneNumber = request.phoneNumber
      ? request.phoneNumber.replace(/\D/g, "")
      : null;
    if (phoneNumber === "") phoneNumber = null;

    return { email, phoneNumber };
  }

  private async resolvePrimaries(matches: Contact[]): Promise<Map<number, Contact>> {
    const primaryMap = new Map<number, Contact>();

    for (const contact of matches) {
      let current = contact;
      const visited = new Set<number>();

      while (current.link_precedence === "secondary" && current.linked_id !== null) {
        if (primaryMap.has(current.linked_id)) break;
        if (visited.has(current.id)) break;
        visited.add(current.id);

        const parent = await this.repository.findById(current.linked_id);
        if (!parent) break;
        current = parent;
      }

      if (current.link_precedence === "primary") {
        primaryMap.set(current.id, current);
      }
    }

    return primaryMap;
  }

  private async mergeClusters(winner: Contact, losers: Contact[]): Promise<void> {
    for (const loser of losers) {
      const loserCluster = await this.repository.findClusterByPrimaryId(loser.id);

      const loserChildIds = loserCluster
        .filter((c) => c.id !== loser.id)
        .map((c) => c.id);

      await this.repository.update(loser.id, {
        link_precedence: "secondary",
        linked_id: winner.id,
      });

      if (loserChildIds.length > 0) {
        await this.repository.updateMany(loserChildIds, { linked_id: winner.id });
      }
    }
  }

  private async buildResponse(primaryId: number): Promise<IdentifyResponse> {
    const cluster = await this.repository.findClusterByPrimaryId(primaryId);

    const primary = cluster.find((c) => c.id === primaryId);
    if (!primary) {
      throw new AppError(500, "Primary contact could not be resolved.");
    }

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
