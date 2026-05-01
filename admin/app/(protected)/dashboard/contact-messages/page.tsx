export default function AdminContactMessagesPage() {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Contact messages</h1>
        <p className="text-muted-foreground text-sm">
          Inbox and status updates via contact-messages admin API.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Connect inbox and detail views to the contact-messages admin endpoints next.
      </div>
    </>
  );
}
