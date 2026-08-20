
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function LoginHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      {/* Logo */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
        <Image
          src="/lgn1-logo.png"
          alt="LGN logo"
          width={77}
          height={77}
          sizes="70px"
          priority
          className="h-auto w-auto object-contain"
        />
      </div>

      {/* System Information */}
      <div className="mt-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          LGN
        </h1>

        <p className="text-sm font-medium text-emerald-700">
          Provide your email and password
        </p>
      </div>

      {/* Security Badge */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2">
        <ShieldCheck
          aria-hidden="true"
          className="h-4 w-4 text-emerald-700"
        />

        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Secure Sign-in
        </span>
      </div>
    </header>
  );
}

