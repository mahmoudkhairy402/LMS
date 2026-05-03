"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/thunks/authThunks";

const GoogleAuthButton = dynamic(
  () => import("@/components/auth/GoogleAuthButton"),
  { ssr: false },
);

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });


  useEffect(() => {
    if (user && user.role === "student") {
      router.push("/");
    } else if (user && (user.role === "instructor" || user.role === "admin")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const result = await dispatch(loginUser(data)).unwrap();
      toast.success(result.message || "Logged in successfully.");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="grid overflow-hidden border-2 border-border bg-neutral-800/50 shadow-lg lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between border-r-2 border-border bg-surface p-10">
          <div>
            <h1 className="mb-3 text-4xl font-bold text-primary-500">EduPath</h1>
            <p className="text-neutral-300">Your journey to mastery starts here.</p>
          </div>
          <div className="border-2 border-primary-500/20 bg-primary-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary-300">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold">Secure Authentication</span>
            </div>
            <p className="text-sm text-neutral-300">
              Access your courses, track progress, and continue learning with confidence.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 lg:hidden">
            <h1 className="mb-1 text-3xl font-bold text-primary-500">EduPath</h1>
            <p className="text-sm text-neutral-400">Your journey to mastery starts here.</p>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-white">Welcome Back</h2>
          <p className="mb-8 text-sm text-neutral-400">Sign in to continue to your dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="w-full border-2 border-border bg-surface py-3 pl-10 pr-4 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none"
                />
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-200">Password</label>
                {/* <Link href="/forgot-password" className="text-xs text-primary-400 transition hover:text-primary-300">
                  Forgot Password?
                </Link> */}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full border-2 border-border bg-surface py-3 pl-10 pr-10 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none"
                />
                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 border-2 border-primary-500 bg-primary-500 py-3 font-semibold text-white transition duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-xs text-neutral-500">OR</span>
            <div className="h-px flex-1 bg-neutral-700" />
          </div>

          <GoogleAuthButton label="Continue with Google" />

          <p className="mt-6 text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary-400 transition hover:text-primary-300">
              Register
            </Link>
          </p>
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-neutral-500">
        © 2024 EduPath. All rights reserved |{" "}
        <a href="#" className="transition hover:text-neutral-400">
          Privacy Policy
        </a>{" "}
        |{" "}
        <a href="#" className="transition hover:text-neutral-400">
          Terms of Service
        </a>
      </p>
    </div>
  );
}
