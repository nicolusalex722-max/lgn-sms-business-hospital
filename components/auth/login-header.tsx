"use client";

import Image from "next/image";

import { ShieldCheck } from "lucide-react";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Tanzania Emblem */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
        <Image
          src="/lgn1-logo.png"
          alt="lgn"
          width={72}
          height={72}
          sizes="20"
          priority
          className="object-contain"
        />
      </div>
      {/* System Name */}
      <div className="mt-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          LGN
        </h1>

        <p className="text-sm font-medium text-emerald-700">
          Provide Email & Password
        </p>
      </div>

      {/* Security Badge */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />

        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Sign-in
        </span>
      </div>
    </div>
  );
}
