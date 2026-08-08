import Link from "next/link";
import Image from "next/image";
import { CarFrontIcon } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicCar } from "@/lib/api/cars";
import {
  buildInquiryWhatsAppUrl,
  hasVisiblePrice,
  formatPkr,
  primaryPriceLabel,
} from "@/lib/car-display";

function primaryImageUrl(car: PublicCar): string | null {
  const primary = car.images.find((i) => i.isPrimary)?.url;
  if (primary) return primary;
  return car.images[0]?.url ?? null;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.07 0C5.49 0 .16 5.34.16 11.92c0 2.1.55 4.15 1.59 5.95L0 24l6.32-1.66a11.86 11.86 0 0 0 5.75 1.48h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.18-1.24-6.17-3.48-8.42Zm-8.45 18.33h-.01a9.84 9.84 0 0 1-5.01-1.37l-.36-.21-3.75.99 1-3.65-.24-.38a9.85 9.85 0 0 1-1.5-5.27c0-5.45 4.43-9.88 9.88-9.88a9.8 9.8 0 0 1 6.99 2.9 9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.43 9.89-9.88 9.89Zm5.42-7.43c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.69.15-.2.3-.79.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.24-.46-2.37-1.48-.88-.78-1.48-1.75-1.66-2.05-.18-.3-.02-.47.13-.62.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.69-1.67-.95-2.29-.25-.6-.5-.52-.69-.53h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.22 3.1.15.2 2.11 3.23 5.11 4.53.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.79-.73 2.04-1.44.25-.71.25-1.32.18-1.45-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

function TopCarsStripSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-[#452E5A]/12 bg-white/85 p-4 shadow-[0_12px_38px_-20px_rgba(30,16,78,0.55)] sm:p-5 dark:border-white/10 dark:bg-[#150e2e]/80">
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[72%] shrink-0 overflow-hidden rounded-2xl border border-[#452E5A]/10 bg-white dark:border-white/10 dark:bg-[#1c1438] min-[480px]:min-w-[64%] sm:min-w-[50%] md:min-w-[36%] lg:min-w-[32%]"
            >
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="size-9 shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type TopCarsStripProps = {
  cars: PublicCar[];
  isLoading?: boolean;
};

export function TopCarsStrip({ cars, isLoading = false }: TopCarsStripProps) {
  if (isLoading && cars.length === 0) {
    return <TopCarsStripSkeleton />;
  }

  if (!isLoading && cars.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-[#452E5A]/12 bg-white/85 p-4 shadow-[0_12px_38px_-20px_rgba(30,16,78,0.55)] sm:p-5 dark:border-white/10 dark:bg-[#150e2e]/80">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {cars.map((car) => {
              const imageUrl = primaryImageUrl(car);
              const waUrl = buildInquiryWhatsAppUrl(car);
              const make = car.model.brand;
              const modelName = car.model.name;
              const hasPrice = hasVisiblePrice(car);
              const primaryPrice = primaryPriceLabel(car);
              const pkrLine = formatPkr(car.pricePkr);

              return (
                <CarouselItem
                  key={car.id}
                  className="basis-[88%] pl-3 min-[480px]:basis-[64%] sm:basis-[50%] md:basis-[36%] lg:basis-[32%]"
                >
                  <article className="overflow-hidden rounded-2xl border border-[#452E5A]/10 bg-white shadow-[0_10px_28px_-20px_rgba(30,16,78,0.6)] dark:border-white/10 dark:bg-[#1c1438]">
                    <div className="relative h-28 w-full border-b border-[#452E5A]/10 bg-[#F7F4FF] dark:border-white/10 dark:bg-white/5">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={`${make} ${modelName}`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 1280px) 50vw, 20vw"
                          unoptimized
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">
                          <CarFrontIcon className="size-10 opacity-40" aria-hidden />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-[#1E104E] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {car.referenceNo}
                      </span>
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="text-xl leading-none font-bold text-[#1E104E] dark:text-white">
                        {make.toUpperCase()}
                      </p>
                      <p className="text-sm font-semibold tracking-wide text-[#0F8A66] uppercase dark:text-[#3DD598]">
                        {modelName}
                      </p>
                      <div>
                        <p className="text-[10px] font-bold tracking-wide text-[#5C4A76] uppercase dark:text-white/55">
                          {hasPrice ? "FOB price" : "Price"}
                        </p>
                        <p
                          className={`mt-0.5 text-lg leading-none font-bold tabular-nums text-[#EA3B58] ${
                            hasPrice
                              ? ""
                              : "ask-price-badge rounded-md px-2 py-1 text-[#1E104E]"
                          }`}
                        >
                          {primaryPrice}
                        </p>
                        {pkrLine ? (
                          <p className="mt-1 text-sm font-semibold tabular-nums text-[#EA3B58]">
                            {pkrLine}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="h-12 flex-1 rounded-[4px] border-0 bg-[#0EA640] px-3 text-xs font-semibold text-white hover:bg-[#0B9238]"
                        >
                          <Link href={waUrl} target="_blank" rel="noreferrer">
                            Inquire Now
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="icon-sm"
                          className="size-12 shrink-0 rounded-[4px] border-0 bg-[#2AD36A] text-white hover:bg-[#23BE5F]"
                        >
                          <Link
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open WhatsApp chat for ${make} ${modelName}`}
                          >
                            <WhatsAppIcon className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white dark:border-white/15 dark:bg-[#150e2e]/95 dark:text-white dark:hover:bg-[#1c1438]" />
          <CarouselNext className="right-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white dark:border-white/15 dark:bg-[#150e2e]/95 dark:text-white dark:hover:bg-[#1c1438]" />
        </Carousel>
      </div>
    </section>
  );
}
