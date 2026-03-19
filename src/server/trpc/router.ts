import { router } from "./trpc";
import { customersRouter } from "./routers/customers";
import { vendingRouter } from "./routers/vending";
import { erpRouter } from "./routers/erp";
import { recommendationsRouter } from "./routers/recommendations";
import { demoRouter } from "./routers/demo";

export const appRouter = router({
  customers: customersRouter,
  vending: vendingRouter,
  erp: erpRouter,
  recommendations: recommendationsRouter,
  demo: demoRouter,
});

export type AppRouter = typeof appRouter;
