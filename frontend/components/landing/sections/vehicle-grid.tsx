import Image from "next/image";

import { VehicleItem } from "@/components/landing/home-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const staticVehicleImages = [
  "/download.jpeg",
  "/download (1).jpeg",
  "/download (2).jpeg",
  "/download (3).jpeg",
  "/download (4).jpeg",
];

export function VehicleGrid({ vehicles }: { vehicles: VehicleItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle, index) => {
        const imageSrc = encodeURI(
          staticVehicleImages[index % staticVehicleImages.length],
        );

        return (
        <Card
          key={vehicle.reference}
          className="group overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF653F]/45"
        >
          <div className="relative h-44 w-full overflow-hidden border-b border-[#452E5A]/10">
            <Image
              src={imageSrc}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          </div>
          <div className="h-1.5 w-full brand-gradient-warm" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base text-[#1E104E]">
                {vehicle.make} {vehicle.model}
              </CardTitle>
              {vehicle.highlight ? (
                <Badge className="border-0 bg-[#452E5A]/10 text-[#452E5A]">
                  {vehicle.highlight}
                </Badge>
              ) : null}
            </div>
            <CardDescription className="text-[#452E5A]/75">
              {vehicle.year} • {vehicle.engine}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <p className="text-3xl font-semibold tracking-tight text-[#1E104E]">
              {vehicle.price}
            </p>
            <p className="text-sm text-[#452E5A]/70">Ref #{vehicle.reference}</p>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 border-t border-[#452E5A]/10 bg-[#F8F5FF]/70">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8"
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="w-full border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] shadow-sm hover:opacity-90"
            >
              Request Quote
            </Button>
          </CardFooter>
        </Card>
        );
      })}
    </div>
  );
}
