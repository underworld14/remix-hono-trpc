import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { type AppLoadContext, createCookieSessionStorage, type ServerBuild } from "@remix-run/node";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { remix } from "remix-hono/handler";
import { session, getSession, getSessionStorage } from "remix-hono/session";
import { cache } from "server/middlewares";
import { importDevBuild } from "./dev/server";
import { appRouter } from "./routes";

const mode = process.env.NODE_ENV === "test" ? "development" : process.env.NODE_ENV;

const isProductionMode = mode === "production";

const app = new Hono();

/**
 * Serve assets files from build/client/assets
 */
app.use(
  "/assets/*",
  cache(60 * 60 * 24 * 365), // 1 year
  serveStatic({ root: "./build/client" }),
);

/**
 * Serve public files
 */
app.use(
  "*",
  cache(60 * 60),
  serveStatic({ root: isProductionMode ? "./build/client" : "./public" }),
); // 1 hour

/**
 * Add logger middleware
 */
app.use("*", logger());

/**
 * Add session middleware (https://github.com/sergiodxa/remix-hono?tab=readme-ov-file#session-management)
 */
app.use(
  session({
    autoCommit: true,
    createSessionStorage() {
      if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET is not defined");
      }

      const sessionStorage = createCookieSessionStorage({
        cookie: {
          name: "session",
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secrets: [process.env.SESSION_SECRET],
          secure: process.env.NODE_ENV === "production",
        },
      });

      return {
        ...sessionStorage,
        // If a user doesn't come back to the app within 30 days, their session will be deleted.
        async commitSession(session) {
          return sessionStorage.commitSession(session, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        },
      };
    },
  }),
);

app.use(async (c, next) => {
  const pathname = new URL(c.req.url).pathname;
  if (!pathname.startsWith("/auth")) {
    const session = getSession(c);

    if (!session.has("userId")) {
      return c.redirect("/auth/login");
    }
  }

  return next();
});

/**
 * Add trpc middleware
 */
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext(opts, c) {
      return {
        session: getSession(c),
        sessionStorage: getSessionStorage(c),
      };
    },
  }),
);

/**
 * Add remix middleware to Hono server
 */
app.use(async (c, next) => {
  const build = (isProductionMode
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line import/no-unresolved -- this expected until you build the app
      await import("../build/server/remix.js")
    : await importDevBuild()) as unknown as ServerBuild;

  return remix({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    build,
    mode,
    getLoadContext(c) {
      const sessionStorage = getSessionStorage(c);
      const session = getSession(c);

      return {
        appVersion: isProductionMode ? build.assets.version : "dev",
        session,
        sessionStorage,
      } satisfies AppLoadContext;
    },
  })(c, next);
});

/**
 * Start the production server
 */

if (isProductionMode) {
  serve(
    {
      ...app,
      port: Number(process.env.PORT) || 3000,
    },
    async (info) => {
      console.log(`🚀 Server started on port ${info.port}`);
    },
  );
}

export default app;
