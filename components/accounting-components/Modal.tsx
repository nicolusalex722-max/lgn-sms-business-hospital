"use client";

import { ReactNode } from "react";

export default function Modal({
  children,
  onClose,
  narrow,
}: {
  children: ReactNode;
  onClose: () => void;
  narrow?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-20 flex items-start justify-center bg-slate-900/40 px-4 py-16"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full rounded-2xl border border-slate-200 bg-white p-7 font-serif ${
          narrow ? "max-w-md" : "max-w-2xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}