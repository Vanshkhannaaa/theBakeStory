"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { z } from "zod";
import { loginSchema } from "@/lib/validators";
import { loginAdmin } from "@/lib/firebase/auth-client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/banners";
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema) as never,
  });

  const onSubmit = async (data: LoginData) => {
    setError("");
    try {
      await loginAdmin(data.email, data.password);
      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <section className="login-brand-glow relative flex min-h-[32vh] items-center justify-center px-8 py-12 lg:min-h-screen lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
        <div className="login-logo-glow relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="The Bake Story"
            className="h-auto w-48 brightness-0 invert sm:w-56 lg:w-64"
          />
        </div>
      </section>

      <section className="login-panel relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
          <ThemeToggle variant="chip" />
        </div>

        <div className="w-full max-w-md">
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">The Bake Story</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin sign in</h1>
          <p className="mt-2 text-sm text-ui-muted">Use your admin email and password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
            <div>
              <label htmlFor="email" className="admin-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                {...register("email")}
                className="login-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="admin-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  {...register("password")}
                  className="login-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-ui-faint transition-colors hover:text-ui-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-accent-ring)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-submit-glow flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-medium text-white transition-all hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
