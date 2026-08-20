import LoginForm from "./login-form";
import LoginHeader from "./login-header";

export default function LoginCard() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-[2rem] bg-linear-to-br from-emerald-200/40 via-transparent to-yellow-200/30 blur-xl"
        />

        {/* Card */}
        <div className="relative rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-8">
          <LoginHeader />

          {/* Divider */}
          <div className="my-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
