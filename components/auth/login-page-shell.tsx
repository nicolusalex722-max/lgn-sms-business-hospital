"use client";

import LoginCard from "./login-card";

export default function LoginPageShell() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-white to-emerald-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/70 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/50 blur-3xl" />
      </div>

      {/* Login Content */}
      <div className="relative z-10 w-full">
        <LoginCard />
      </div>
    </main>
  );
}

