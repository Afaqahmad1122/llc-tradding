export default function AdminCarsPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Cars</h1>
        <p className="text-muted-foreground text-sm">
          Inventory: create and edit listings, images, and publish state (cars admin API).
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Connect listing tables and forms to the cars admin endpoints next.
      </div>
    </>
  );
}
