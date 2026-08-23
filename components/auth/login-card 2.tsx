"use client";

import LoginForm from "./login-form";
import LoginHeader from "./login-header";

export default function LoginCard() {
  return (
    <div className="relative w-full max-w-md">

      {/* Decorative Glow */}
      <div className="absolute -inset-1 rounded-[2rem] bg-linear-to-br from-emerald-200/40 via-transparent to-yellow-200/30 blur-xl" />

      <div className="relative rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-10">

        <LoginHeader />

        <div className="my-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />



        <div className="mt-8">

          <LoginForm />

        </div>

      </div>
    </div>
  );
}