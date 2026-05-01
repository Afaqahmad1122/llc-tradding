export default function AdminCareersPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Careers</h1>
        <p className="text-muted-foreground text-sm">
          Job postings: CRUD via jobs admin API; applications use public apply endpoints.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Connect job post management UI to the jobs admin endpoints next.
      </div>
    </>
  );
}
