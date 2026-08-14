import LoginPageShell from "@/components/auth/login-page-shell";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <main className="flex-1">
        <LoginPageShell />
      </main>
    </div>
  );
}
