import { Outlet } from "@remix-run/react";

export default function AuthContainer() {
  return (
    <div className="flex h-screen w-screen items-center">
      <Outlet />
    </div>
  );
}
