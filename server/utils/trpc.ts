import { initTRPC } from "@trpc/server";

import { HonoContext } from "server/types/remix-hono";

const t = initTRPC.context<HonoContext>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
