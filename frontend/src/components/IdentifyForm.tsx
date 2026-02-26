import { useState } from "react";
import type { IdentifyRequest } from "../types/identify";

interface Props {
  onSubmit: (payload: IdentifyRequest) => Promise<void>;
  loading: boolean;
}

export function IdentifyForm({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() && !phoneNumber.trim()) {
      setError("Please provide at least an email or a phone number.");
      return;
    }

    await onSubmit({
      email: email.trim() || null,
      phoneNumber: phoneNumber.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition"
      >
        {loading ? "Identifying…" : "Identify"}
      </button>
    </form>
  );
}
