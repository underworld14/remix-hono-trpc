import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";

import { AppRouter } from "server/routes";

export const trpc = createTRPCReact<AppRouter>();

const proxyClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

export const trpcServerHelpers = createServerSideHelpers({
  client: proxyClient,
});
