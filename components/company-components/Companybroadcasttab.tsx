"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function CompanyBroadcastTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Users");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to your notifications/email API
    console.log("Broadcasting:", { subject, message, audience });
    setSubject("");
    setMessage("");
  };

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Message Broadcast</h3>
      <form onSubmit={handleSend} className="flex flex-col gap-4 max-w-xl">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option>All Users</option>
            <option>Admins Only</option>
            <option>Staff Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Scheduled maintenance notice"
            required
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your announcement..."
            required
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors w-fit"
        >
          <Send className="w-4 h-4" />
          Send Broadcast
        </button>
      </form>
    </div>
  );
}