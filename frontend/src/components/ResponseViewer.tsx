import type { ConsolidatedContact } from "../types/identify";

interface Props {
  contact: ConsolidatedContact | null;
  error: string | null;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-gray-800 border border-gray-700 px-2.5 py-1 text-xs text-gray-200 font-mono">
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ResponseViewer({ contact, error }: Props) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400 mb-1">Error</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-8 flex items-center justify-center">
        <p className="text-sm text-gray-600">Response will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-500">Result</span>
        <span className="text-xs text-violet-400 font-mono bg-violet-900/30 border border-violet-800 rounded px-2 py-0.5">
          primary #{contact.primaryContatctId}
        </span>
      </div>

      <Row label="Emails">
        {contact.emails.length > 0
          ? contact.emails.map((e, i) => (
              <Badge key={e}>
                {i === 0 ? "★ " : ""}{e}
              </Badge>
            ))
          : <span className="text-xs text-gray-600">none</span>}
      </Row>

      <Row label="Phone Numbers">
        {contact.phoneNumbers.length > 0
          ? contact.phoneNumbers.map((p, i) => (
              <Badge key={p}>
                {i === 0 ? "★ " : ""}{p}
              </Badge>
            ))
          : <span className="text-xs text-gray-600">none</span>}
      </Row>

      <Row label="Secondary IDs">
        {contact.secondaryContactIds.length > 0
          ? contact.secondaryContactIds.map((id) => (
              <Badge key={id}>#{id}</Badge>
            ))
          : <span className="text-xs text-gray-600">none</span>}
      </Row>
    </div>
  );
}
