"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Account, AccountType, ACCOUNT_TYPES } from "@/lib/types";

export default function AddAccountModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (account: Account) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Asset");
  const [currency, setCurrency] = useState("TSh");
  const [description, setDescription] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!code.trim() || !name.trim()) {
      setError("Code and account name are required.");
      return;
    }
    const balance = Number(openingBalance) || 0;
    const account: Account = {
      code: code.trim(),
      name: name.trim(),
      type,
      currency: currency.trim() || "TSh",
      description: description.trim(),
      transactions:
        balance === 0
          ? []
          : [
              {
                id: `t-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                by: "You",
                description: "Opening balance",
                debit: balance > 0 ? balance : 0,
                credit: balance < 0 ? Math.abs(balance) : 0,
              },
            ],
    };
    onCreate(account);
  }

  return (
    <Modal onClose={onCancel} narrow>
      <h3 className="text-xl font-bold">Add account</h3>
      <p className="mt-1 text-sm text-slate-500">
        Set the account&apos;s details and its opening balance.
      </p>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="1000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>
          <Field label="Account group">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Account name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cash at Bank"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency">
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="TSh"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>
          <Field label="Opening balance">
            <input
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              type="number"
              placeholder="0"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-slate-400">
          Positive posts as a debit, negative posts as a credit.
        </p>

        <Field label="Description">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this account is used for"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Add account
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-500">{label}</span>
      {children}
    </label>
  );
}