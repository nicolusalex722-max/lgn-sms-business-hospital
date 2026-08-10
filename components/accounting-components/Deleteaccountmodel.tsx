"use client";

import Modal from "./Modal";
import { Account } from "@/lib/types";

export default function DeleteAccountModal({
  account,
  onCancel,
  onConfirm,
}: {
  account: Account;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal onClose={onCancel} narrow>
      <h3 className="text-xl font-bold">
        Delete {account.code} — {account.name}?
      </h3>
      <p className="mt-2 text-slate-500">
        This removes the account and its {account.transactions.length} transaction(s) from the ledger.
        This can&apos;t be undone.
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
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete account
        </button>
      </div>
    </Modal>
  );
}