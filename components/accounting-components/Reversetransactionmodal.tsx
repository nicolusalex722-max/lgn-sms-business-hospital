"use client";

import Modal from "./Modal";
import { Transaction } from "@/lib/types";
import { money } from "@/lib/utils";

export default function ReverseTransactionModal({
  transaction,
  currency,
  onCancel,
  onConfirm,
}: {
  transaction: Transaction;
  currency: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const net = transaction.debit - transaction.credit;

  return (
    <Modal onClose={onCancel} narrow>
      <h3 className="text-xl font-bold">Reverse this transaction?</h3>
      <p className="mt-2 text-slate-500">
        This posts an offsetting entry of {money(-net, currency)} for &quot;{transaction.description}&quot;,
        reducing the account balance accordingly. The original entry stays on record.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Reverse transaction
        </button>
      </div>
    </Modal>
  );
}