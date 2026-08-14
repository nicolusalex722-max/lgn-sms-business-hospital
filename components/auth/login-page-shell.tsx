"use client";

import LoginCard from "./login-card";

export default function LoginPageShell() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
      <div className="min-h-screen">
        {/* Right Side */}

        <div className="flex flex-col items-center justify-center px-6 py-10 sm:px-10 lg:col-span-2">
          {/* Background Decoration */}

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-60" />

            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-yellow-100 blur-3xl opacity-60" />
          </div>

          <div className="w-full">
            <LoginCard />
          </div>
        </div>
      </div>
    </main>
  );
}
