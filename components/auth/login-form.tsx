
"use client";

import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

import {
  loginSchema,
  type LoginInput,
} from "@/lib/validations/auth-schema";

import { userLogin } from "@/lib/actions/auth-actions";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginInput) {
    try {
      const result = await userLogin(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
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
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  disabled={isSubmitting}
                  className="h-12 border-slate-300 bg-white/80 transition-colors focus-visible:border-[#006b3c] focus-visible:ring-[#006b3c]"
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
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="h-12 border-slate-300 bg-white/80 pr-11 transition-colors focus-visible:border-[#006b3c] focus-visible:ring-[#006b3c]"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-[#006b3c] font-medium text-white transition-colors hover:bg-[#005631] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="mr-2 h-4 w-4" />

          {isSubmitting ? "Inaingia..." : "Ingia"}
        </Button>
      </form>
    </Form>
  );
}

