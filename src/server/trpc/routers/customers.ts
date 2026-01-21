import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { mockCustomers, getMockRecommendations } from "@/lib/mock-data";

const isDemoMode = process.env.DEMO_MODE === "true";

export const customersRouter = router({
  // Get all customers
  list: publicProcedure.query(async ({ ctx }) => {
    if (isDemoMode) {
      const recs = getMockRecommendations();
      return mockCustomers.map(c => ({
        ...c,
        _count: {
          recommendations: recs.filter(r => r.customerId === c.id && r.status === "PENDING").length
        }
      }));
    }
    return ctx.prisma.customer.findMany({
      include: {
        vendingStations: {
          include: {
            _count: {
              select: { stationItems: true },
            },
          },
        },
        _count: {
          select: { recommendations: { where: { status: "PENDING" } } },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single customer with full details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        const customer = mockCustomers.find(c => c.id === input.id);
        if (!customer) return null;
        const recs = getMockRecommendations().filter(r => r.customerId === input.id && r.status === "PENDING");
        return {
          ...customer,
          recommendations: recs,
        };
      }
      return ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          vendingStations: {
            include: {
              stationItems: {
                include: {
                  item: true,
                },
              },
            },
          },
          recommendations: {
            where: { status: "PENDING" },
            include: { item: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Get customer by code
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        return mockCustomers.find(c => c.code === input.code) ?? null;
      }
      return ctx.prisma.customer.findUnique({
        where: { code: input.code },
        include: {
          vendingStations: {
            include: {
              stationItems: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
    }),

  // Create customer
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        code: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (isDemoMode) {
        return { id: "demo-new", ...input, createdAt: new Date(), updatedAt: new Date() };
      }
      return ctx.prisma.customer.create({ data: input });
    }),

  // Search customers
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (isDemoMode) {
        const q = input.query.toLowerCase();
        return mockCustomers.filter(c =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
        );
      }
      return ctx.prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { code: { contains: input.query, mode: "insensitive" } },
          ],
        },
        include: {
          vendingStations: true,
        },
        orderBy: { name: "asc" },
        take: 20,
      });
    }),
});
