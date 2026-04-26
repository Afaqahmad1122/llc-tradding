import { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const parseEmailArg = (): string => {
  const emailArg = process.argv.find((arg) => arg.startsWith("--email="));
  if (!emailArg) {
    throw new Error("Missing --email argument");
  }
  const value = emailArg.slice("--email=".length).trim().toLowerCase();
  if (!value) {
    throw new Error("Invalid --email value");
  }
  return value;
};

const shouldVerifyEmail = (): boolean => process.argv.includes("--verify-email");

const run = async (): Promise<void> => {
  const email = parseEmailArg();
  const verifyEmail = shouldVerifyEmail();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, emailVerifiedAt: true },
  });

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  if (user.role === UserRole.ADMIN && (!verifyEmail || user.emailVerifiedAt)) {
    console.log("User is already an admin.");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: UserRole.ADMIN,
      ...(verifyEmail && !user.emailVerifiedAt ? { emailVerifiedAt: new Date() } : {}),
    },
  });

  console.log(`Admin role assigned to ${email}`);
};

run()
  .catch((error: unknown) => {
    console.error("Admin bootstrap failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
