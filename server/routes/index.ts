import { router } from "server/utils/trpc";
import { authRouter } from "./auth.route";

export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
