import Image from "next/image";
import { MessageCircle } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const staticTopCars = [
  { id: "323", make: "Mazda", model: "Demio", image: "/download.jpeg" },
  { id: "107", make: "Mazda", model: "Axela", image: "/download (1).jpeg" },
  { id: "139", make: "Mazda", model: "CX5", image: "/download (2).jpeg" },
  { id: "24", make: "Volkswagen", model: "Polo", image: "/download (3).jpeg" },
  { id: "59", make: "BMW", model: "X1", image: "/download (4).jpeg" },
  { id: "86", make: "Toyota", model: "Aqua", image: "/download.jpeg" },
];

export function TopCarsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-[#452E5A]/12 bg-white/85 p-4 shadow-[0_12px_38px_-20px_rgba(30,16,78,0.55)] sm:p-5">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {staticTopCars.map((car) => (
              <CarouselItem
                key={car.id}
                className="basis-[88%] pl-3 min-[480px]:basis-[64%] sm:basis-[50%] md:basis-[36%] lg:basis-[32%]"
              >
                <article className="overflow-hidden rounded-2xl border border-[#452E5A]/10 bg-white shadow-[0_10px_28px_-20px_rgba(30,16,78,0.6)]">
                  <div className="relative h-28 w-full border-b border-[#452E5A]/10 bg-[#F7F4FF]">
                    <Image
                      src={encodeURI(car.image)}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 1280px) 50vw, 20vw"
                    />
                    <span className="absolute top-2 right-2 rounded-full bg-[#1E104E] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {car.id}
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="text-xl leading-none font-bold text-[#1E104E]">
                      {car.make.toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold tracking-wide text-[#0F8A66] uppercase">
                      {car.model}
                    </p>
                    <p className="text-[11px] font-medium tracking-wide text-[#5C4A76] uppercase">
                      Best Price
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#D83B35] transition-colors hover:text-[#B82C27]"
                      >
                        Contact
                      </button>
                      <Button
                        size="sm"
                        className="h-8 border-0 bg-[#2AD36A] px-3 text-xs text-white hover:bg-[#23BE5F]"
                      >
                        <MessageCircle className="size-3.5" />
                        Quote
                      </Button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white" />
          <CarouselNext className="right-2 size-9 border-[#452E5A]/20 bg-white/95 text-[#452E5A] hover:bg-white" />
        </Carousel>
      </div>
    </section>
  );
}
