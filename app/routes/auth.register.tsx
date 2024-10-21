import { MetaFunction } from "@remix-run/node";
import { RegisterForm } from "~/modules/authentication/register-form";

export const meta: MetaFunction = () => {
  return [
    { title: "Register | Remix Hono" },
    {
      name: "description",
      content: "Remix Hono Boilerplate",
    },
  ];
};

export default function LoginPage() {
  return <RegisterForm />;
}
