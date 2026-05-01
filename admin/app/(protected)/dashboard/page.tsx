export default function AdminDashboardPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Signed in as an administrator.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Key metrics and shortcuts will appear here.
      </div>
    </>
  );
}
