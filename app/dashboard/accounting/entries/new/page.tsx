"use client";

import { useRouter } from "next/navigation";
import JournalEntryFormPage from "@/components/accounting-components/Journalentryformpage";
import { PENDING_ENTRY_KEY } from "@/components/accounting-components/Journalentrydata";
import type { JournalEntry } from "@/components/accounting-components/Journalentrymanager";

export default function NewJournalEntryPage() {
  const router = useRouter();

  const handleSave = (data: Omit<JournalEntry, "id"> & { id?: string }) => {
    // TODO: replace with a real API call, e.g. POST /api/journal-entries
    const entry: JournalEntry = { ...data, id: crypto.randomUUID() };
    sessionStorage.setItem(PENDING_ENTRY_KEY, JSON.stringify({ type: "create", entry }));
    router.push("/dashboard/accounting/entries");
  };

  return <JournalEntryFormPage onSave={handleSave} />;
}