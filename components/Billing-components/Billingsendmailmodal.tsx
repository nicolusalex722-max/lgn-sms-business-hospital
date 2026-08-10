"use client";

import { useState } from "react";
import Modal from "./Billingmodal";
import type { BillingDocument } from "@/lib/types";
import { COMPANY } from "@/lib/data";

export default function SendEmailModal({
  doc,
  onClose,
}: {
  doc: BillingDocument;
  onClose: () => void;
}) {
  const docLabel = doc.type === "invoice" ? "Invoice" : "Bill";

  const [to, setTo] = useState(doc.partyEmail ?? "");
  const [subject, setSubject] = useState(`${docLabel} ${doc.number} from ${COMPANY.name}`);
  const [message, setMessage] = useState(
    `Hi ${doc.partyName},\n\nPlease find attached ${docLabel.toLowerCase()} ${doc.number}.\n\nThank you,\n${COMPANY.name}`
  );
  const [sent, setSent] = useState(false);

  const canSend = to.trim().length > 3 && to.includes("@");

  if (sent) {
    return (
      <Modal title="Email sent" onClose={onClose}>
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="none">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L3.3 10a1 1 0 111.4-1.4l3.7 3.7 6.9-6.9a1 1 0 011.4 0z" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            {docLabel} {doc.number} was sent to <span className="font-medium text-slate-800">{to}</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Email ${docLabel.toLowerCase()}`} subtitle={doc.number} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">To</label>
          <input
            autoFocus
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="none">
            <path d="M10 6v5M10 14v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          The {docLabel.toLowerCase()} PDF will be attached automatically.
        </p>
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
          disabled={!canSend}
          onClick={() => canSend && setSent(true)}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Send email
        </button>
      </div>
    </Modal>
  );
}