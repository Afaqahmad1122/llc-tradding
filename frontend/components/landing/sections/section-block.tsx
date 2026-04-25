export function SectionBlock({
  title,
  description,
  id,
  children,
}: {
  title: string;
  description: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mb-7 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[#1E104E] sm:text-3xl dark:text-white">
          {title}
        </h2>
        <p className="max-w-3xl text-[#452E5A]/85 dark:text-white/65">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
