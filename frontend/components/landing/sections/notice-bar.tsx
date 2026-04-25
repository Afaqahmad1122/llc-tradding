export function NoticeBar({ text }: { text: string }) {
  return (
    <div className="brand-gradient-main border-b border-white/10 text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 text-center text-xs font-medium sm:px-6 lg:px-8">
        {text}
      </div>
    </div>
  );
}
