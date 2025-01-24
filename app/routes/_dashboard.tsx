import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_dashboard";
import requireUserId from "~/.server/requireUserId";

export async function loader({ request }: Route.LoaderArgs) {
  const validUser = await requireUserId(request);

  if (!validUser) {
    return redirect("/login");
  }
}

export default function DashboardOutlet() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
