import { MetaFunction } from "@remix-run/node";
import { LoginForm } from "~/modules/authentication/login-form";

export const meta: MetaFunction = () => {
  return [
    { title: "Login | Remix Hono" },
    {
      name: "description",
      content: "Remix Hono Boilerplate",
    },
  ];
};

export default function LoginPage() {
  return <LoginForm />;
}
