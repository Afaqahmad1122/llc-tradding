export default function AdminReviewsPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">
          Reviews admin list, plus review eligibility create/list endpoints.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Connect moderation and eligibility tooling to the reviews endpoints next.
      </div>
    </>
  );
}
