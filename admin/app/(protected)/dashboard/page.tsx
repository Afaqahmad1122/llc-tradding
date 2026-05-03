import Link from "next/link";
import {
  type LucideIcon,
  ArrowUpRight,
  Briefcase,
  CarFront,
  Inbox,
  LayoutDashboard,
  Ship,
  Star,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Shortcut = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const SHORTCUTS: Shortcut[] = [
  {
    href: "/dashboard/cars",
    title: "Cars",
    description: "Inventory, drafts, photos, and publishing.",
    icon: CarFront,
  },
  {
    href: "/dashboard/careers",
    title: "Careers",
    description: "Job listings and career content.",
    icon: Briefcase,
  },
  {
    href: "/dashboard/reviews",
    title: "Reviews",
    description: "Customer reviews and moderation.",
    icon: Star,
  },
  {
    href: "/dashboard/contact-messages",
    title: "Contact messages",
    description: "Inbound inquiries from the site.",
    icon: Inbox,
  },
  {
    href: "/dashboard/shipping",
    title: "Shipping",
    description: "Rates, routes, and logistics settings.",
    icon: Ship,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15">
            <LayoutDashboard className="size-7" aria-hidden strokeWidth={1.6} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Overview
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Manage inventory, content, and customer touchpoints from one place.
              Use the sidebar or jump to a section below.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SHORTCUTS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="h-full border-border/80 transition-[box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/20">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </div>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-foreground"
                    aria-hidden
                  />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <CardDescription className="text-pretty leading-relaxed">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section>
        <Card className="border-dashed border-border/90 bg-card/80 shadow-none ring-foreground/5">
          <CardHeader>
            <CardTitle className="text-base">What&apos;s next</CardTitle>
            <CardDescription className="max-w-2xl text-pretty leading-relaxed">
              Summary metrics and activity feeds can appear here once analytics and
              APIs are connected. The overview page is ready for widgets when you
              need them.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
