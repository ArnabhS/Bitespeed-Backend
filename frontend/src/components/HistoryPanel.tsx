import type { HistoryEntry } from "../types/identify";

interface Props {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  selectedId: string | null;
}

export function HistoryPanel({ history, onSelect, onClear, selectedId }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">History</h2>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-8 flex items-center justify-center">
          <p className="text-sm text-gray-600">No requests yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">History</h2>
        <button
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-red-400 transition"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
        {[...history].reverse().map((entry) => {
          const isSelected = entry.id === selectedId;
          return (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition ${
                isSelected
                  ? "border-violet-600 bg-violet-900/20"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-violet-400">
                  #{entry.response.contact.primaryContatctId}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate">
                {entry.request.email ?? "—"} · {entry.request.phoneNumber ?? "—"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
