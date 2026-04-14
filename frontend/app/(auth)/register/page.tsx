"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  GraduationCap,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/store/thunks/authThunks";

const GoogleAuthButton = dynamic(
  () => import("@/components/auth/GoogleAuthButton"),
  { ssr: false },
);

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(["student", "instructor"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  if (strength === 0) return { level: "weak", color: "text-danger" };
  if (strength <= 2) return { level: "fair", color: "text-warning" };
  if (strength <= 3) return { level: "good", color: "text-warning" };
  return { level: "strong", color: "text-success" };
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");
  const strength = getPasswordStrength(password || "");
  const strengthValue =
    strength.level === "weak" ? 1 : strength.level === "fair" ? 2 : strength.level === "good" ? 3 : 4;

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success("Registration successful. Check your email to verify your account.");
      router.push(`/login?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="grid overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-800/50 backdrop-blur-sm shadow-(--shadow-soft) lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between border-r border-neutral-700/70 bg-linear-to-b from-neutral-900 to-neutral-800 p-10">
          <div>
            <h1 className="mb-3 text-4xl font-bold text-primary-500">EduPath</h1>
            <p className="text-neutral-300">Build your account and start learning today.</p>
          </div>
          <div className="space-y-3 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-sm text-neutral-300">
            <div className="flex items-center gap-2 text-primary-300">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold">Trusted and Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Student-focused learning paths</span>
            </div>
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4" />
              <span>Instructor tools and course management</span>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 lg:hidden">
            <h1 className="mb-1 text-3xl font-bold text-primary-500">EduPath</h1>
            <p className="text-sm text-neutral-400">Build your account and start learning today.</p>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-white">Create Account</h2>
          <p className="mb-8 text-sm text-neutral-400">Complete the form to join EduPath.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-700/50 py-3 pl-10 pr-4 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                />
                <User className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              </div>
              {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-700/50 py-3 pl-10 pr-4 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                />
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-700/50 py-3 pl-10 pr-10 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
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

              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition ${
                          i < strengthValue
                            ? strength.level === "strong"
                              ? "bg-success"
                              : "bg-warning"
                            : "bg-neutral-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.color}`}>Password strength: {strength.level}</p>
                </div>
              )}

              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-200">Role</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" value="student" {...register("role")} className="peer sr-only" />
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-700/50 py-2.5 text-sm font-medium text-white transition hover:border-primary-500/50 peer-checked:border-primary-500 peer-checked:bg-primary-500/15">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" value="instructor" {...register("role")} className="peer sr-only" />
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-700/50 py-2.5 text-sm font-medium text-white transition hover:border-primary-500/50 peer-checked:border-primary-500 peer-checked:bg-primary-500/15">
                    <MonitorPlay className="h-4 w-4" />
                    Instructor
                  </div>
                </label>
              </div>
              {errors.role && <p className="mt-1 text-sm text-danger">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-primary-500 to-primary-600 py-3 font-semibold text-white transition duration-200 hover:from-primary-600 hover:to-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-xs text-neutral-500">OR</span>
            <div className="h-px flex-1 bg-neutral-700" />
          </div>

          <GoogleAuthButton label="Sign up with Google" role={watch("role") || "student"} />

          <p className="mt-6 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-400 transition hover:text-primary-300">
              Login
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
