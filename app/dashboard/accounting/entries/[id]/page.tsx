"use client";

import { useParams, useRouter } from "next/navigation";
import JournalEntryFormPage from "@/components/accounting-components/Journalentryformpage";
import { getJournalEntryById, PENDING_ENTRY_KEY } from "@/components/accounting-components/Journalentrydata";
import type { JournalEntry } from "@/components/accounting-components/Journalentrymanager";

export default function EditJournalEntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const entry = getJournalEntryById(params.id);

  const handleSave = (data: Omit<JournalEntry, "id"> & { id?: string }) => {
    // TODO: replace with a real API call, e.g. PATCH /api/journal-entries/[id]
    const updated: JournalEntry = { ...data, id: data.id ?? params.id };
    sessionStorage.setItem(PENDING_ENTRY_KEY, JSON.stringify({ type: "update", entry: updated }));
    router.push("/dashboard/accounting/entries");
  };

  if (!entry) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Journal entry not found.</p>
        <button type="button" onClick={() => router.push("/dashboard/accounting/entries")} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to Entries
        </button>
      </div>
    );
  }

  return <JournalEntryFormPage initialValue={entry} onSave={handleSave} />;
}