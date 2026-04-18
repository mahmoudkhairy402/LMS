import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <main className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center shadow-(--shadow-soft)">
        <h1 className="mb-3 text-4xl font-bold text-primary-500">EduPath LMS</h1>
        <p className="mb-8 text-muted-foreground">
          Local auth setup is ready. Start from login or go to dashboard.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-primary-500 px-5 py-3 font-semibold text-white transition hover:bg-primary-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-border px-5 py-3 font-semibold text-foreground transition hover:bg-surface-raised"
          >
            Register
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-5 py-3 font-semibold text-foreground transition hover:bg-surface-raised"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
