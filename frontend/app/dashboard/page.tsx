export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <main className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center shadow-(--shadow-soft)">
        <h1 className="mb-3 text-3xl font-bold text-primary-500">Dashboard</h1>
        <p className="text-muted-foreground">
          This is a simple dashboard placeholder page.
        </p>
      </main>
    </div>
  );
}
