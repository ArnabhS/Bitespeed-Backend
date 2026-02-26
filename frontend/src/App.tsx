import { useState, useEffect } from "react";
import { IdentifyForm } from "./components/IdentifyForm";
import { ResponseViewer } from "./components/ResponseViewer";
import { HistoryPanel } from "./components/HistoryPanel";
import { identify } from "./services/api";
import type { ConsolidatedContact, HistoryEntry, IdentifyRequest } from "./types/identify";

const HISTORY_KEY = "bitespeed_history";

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<ConsolidatedContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleSubmit = async (payload: IdentifyRequest) => {
    setLoading(true);
    setError(null);
    setSelectedId(null);

    try {
      const result = await identify(payload);
      setContact(result.contact);

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        request: payload,
        response: result,
      };

      setHistory((prev) => [...prev, entry]);
      setSelectedId(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setContact(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (entry: HistoryEntry) => {
    setContact(entry.response.contact);
    setError(null);
    setSelectedId(entry.id);
  };

  const handleClear = () => {
    setHistory([]);
    setSelectedId(null);
    setContact(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-baseline gap-3">
          <h1 className="text-lg font-bold tracking-tight text-white">Bitespeed</h1>
          <span className="text-xs text-gray-500">Identity Reconciliation</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <section className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col gap-5">
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Identify Contact
            </h2>
            <IdentifyForm onSubmit={handleSubmit} loading={loading} />
          </section>

          <ResponseViewer contact={contact} error={error} />
        </div>

        <aside>
          <HistoryPanel
            history={history}
            onSelect={handleSelect}
            onClear={handleClear}
            selectedId={selectedId}
          />
        </aside>
      </main>
    </div>
  );
}
