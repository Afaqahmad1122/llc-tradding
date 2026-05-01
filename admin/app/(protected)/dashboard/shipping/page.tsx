export default function AdminShippingPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Shipping</h1>
        <p className="text-muted-foreground text-sm">
          Regions, schedules, departures, and arrivals via shipping admin API.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Connect region and sailing schedule editors to the shipping admin endpoints next.
      </div>
    </>
  );
}
