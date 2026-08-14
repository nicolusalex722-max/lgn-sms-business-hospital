"use client";

import { useState, useTransition } from "react";

import { Eye, EyeOff, LogIn } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginInput } from "@/lib/validations/auth-schema";

import { userLogin } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: LoginInput) {
    try {
      const result = await userLogin(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          startTransition(() => onSubmit(values)),
        )}
        className="space-y-5"
      >
        {/* Email */}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  disabled={isPending}
                  className="h-12 border-slate-300 focus-visible:ring-[#006b3c]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>

              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="h-12 border-slate-300 pr-11 focus-visible:ring-[#006b3c]"
                    {...field}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    aria-label={
                      showPassword ? "Ficha nenosiri" : "Onyesha nenosiri"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-12 w-full bg-[#006b3c] hover:bg-[#005631]"
          disabled={isPending}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isPending ? "Inaingia..." : "Ingia"}
        </Button>
      </form>
    </Form>
  );
}
