import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { PrismaClient } from "@prisma/client";

const isDemoMode = process.env.DEMO_MODE === "true";

// Only import prisma if not in demo mode
let prisma: PrismaClient | null = null;
if (!isDemoMode) {
  // Dynamic import to avoid loading db in demo mode
  prisma = require("@/lib/db").prisma;
}

export const createTRPCContext = async () => {
  return {
    prisma: prisma as PrismaClient,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
