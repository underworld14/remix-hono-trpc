export type SessionData = {
  userId: string;
};

export type HonoContext = {
  sessionStorage: ReturnType<typeof getSessionStorage>;
  session: ReturnType<typeof getSession<SessionData>>;
};

/**
 * Declare our loaders and actions context type
 */
declare module "@remix-run/node" {
  interface AppLoadContext {
    /**
     * The app version from the build assets
     */
    readonly appVersion: string;
    readonly session: ReturnType<typeof getSession<SessionData>>;
    readonly sessionStorage: ReturnType<typeof getSessionStorage>;
  }
}
