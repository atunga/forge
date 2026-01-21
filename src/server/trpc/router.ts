import { router } from "./trpc";
import { customersRouter } from "./routers/customers";
import { vendingRouter } from "./routers/vending";
import { erpRouter } from "./routers/erp";
import { recommendationsRouter } from "./routers/recommendations";

export const appRouter = router({
  customers: customersRouter,
  vending: vendingRouter,
  erp: erpRouter,
  recommendations: recommendationsRouter,
});

export type AppRouter = typeof appRouter;
