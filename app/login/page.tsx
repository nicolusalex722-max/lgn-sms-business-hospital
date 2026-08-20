
import type { Metadata } from "next";

import LoginPageShell from "@/components/auth/login-page-shell";

export const metadata: Metadata = {
  title: "Ingia",
  description:
    "Ingia kwenye dashibodi ya usimamizi wa mfumo ",
};

export default function LoginPage() {
  return <LoginPageShell />;
}

