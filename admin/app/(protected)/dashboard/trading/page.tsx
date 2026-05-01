export default function AdminTradingPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Trading</h1>
        <p className="text-muted-foreground text-sm">
          Monitor orders, positions, and activity.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Trading operations will appear here.
      </div>
    </>
  );
}
