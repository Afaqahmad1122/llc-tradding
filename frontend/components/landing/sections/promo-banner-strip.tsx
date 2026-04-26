import Image from "next/image";
import Link from "next/link";

import type { PromoBannerItem } from "@/components/landing/home-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type PromoBannerStripProps = {
  items: PromoBannerItem[];
};

export function PromoBannerStrip({ items }: PromoBannerStripProps) {
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
            {items.map((item) => (
              <CarouselItem
                key={item.title}
                className="basis-[90%] pl-3 min-[480px]:basis-[72%] sm:basis-[52%] md:basis-[42%] lg:basis-[34%]"
              >
                <Link
                  href={item.href}
                  aria-label={`Open ${item.title}`}
                  className="group block overflow-hidden rounded-2xl border border-[#452E5A]/12 bg-white shadow-[0_10px_26px_-16px_rgba(30,16,78,0.58)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(30,16,78,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF653F]/70 dark:border-white/12 dark:bg-[#1c1438]"
                >
                  <div className="relative h-[92px] w-full sm:h-[102px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 80vw, 30vw"
                    />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white dark:border-white/15 dark:bg-[#150e2e]/95 dark:text-white dark:hover:bg-[#1c1438]" />
          <CarouselNext className="right-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white dark:border-white/15 dark:bg-[#150e2e]/95 dark:text-white dark:hover:bg-[#1c1438]" />
        </Carousel>
      </div>
    </section>
  );
}
