import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const car = await prisma.car.findFirst({
  where: { isPublished: true },
  select: { id: true, referenceNo: true, inStock: true, title: true },
});
console.log(JSON.stringify(car, null, 2));
await prisma.$disconnect();
