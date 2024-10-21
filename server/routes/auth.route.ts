import { publicProcedure, router } from "server/utils/trpc";
import { login, register } from "server/service/auth.service";
import { loginSchema, registerSchema } from "~/schemas/auth.schema";

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const loggedIdUser = await login(input);
    ctx.session.set("userId", loggedIdUser.id);

    return loggedIdUser;
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const registeredUser = await register(input);
    return registeredUser;
  }),
});
