"use client";

import { useState } from "react";
import Modal from "./Modal";
import { CATEGORIES } from "@/lib/data";
import type { Book } from "@/lib/types";

type Draft = Omit<Book, "id" | "availableCopies">;

export default function BookFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Book;
  onClose: () => void;
  onSave: (book: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    isbn: initial?.isbn ?? "",
    category: initial?.category ?? CATEGORIES[0],
    publisher: initial?.publisher ?? "",
    year: initial?.year ?? new Date().getFullYear(),
    totalCopies: initial?.totalCopies ?? 1,
  });

  const canSave = draft.title.trim().length > 0 && draft.author.trim().length > 0;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <Modal
      title={initial ? "Edit book" : "Add book"}
      subtitle={initial ? "Update this catalog entry" : "Add a new title to the catalog"}
      onClose={onClose}
      wide
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Title</label>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Things Fall Apart"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Author</label>
          <input
            value={draft.author}
            onChange={(e) => update("author", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">ISBN</label>
          <input
            value={draft.isbn}
            onChange={(e) => update("isbn", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Category</label>
          <select
            value={draft.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Publisher</label>
          <input
            value={draft.publisher}
            onChange={(e) => update("publisher", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Year</label>
          <input
            type="number"
            value={draft.year}
            onChange={(e) => update("year", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Total copies</label>
          <input
            type="number"
            min={1}
            value={draft.totalCopies}
            onChange={(e) => update("totalCopies", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => canSave && onSave(draft)}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {initial ? "Save changes" : "Add book"}
        </button>
      </div>
    </Modal>
  );
}