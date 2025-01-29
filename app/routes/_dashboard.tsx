import {
  data,
  Link,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/_dashboard";
import requireUserId from "~/.server/requireUserId";
import { ChartLine, House, Search } from "lucide-react";
import { getSession } from "~/.server/sessions";

export async function loader({ request }: Route.LoaderArgs) {
  const validUser = await requireUserId(request);
  //does the auth check for all the subsequent routes that are connected to this
  if (!validUser) {
    return redirect("/login");
  }

  const session = await getSession(request.headers.get("Cookie"));
  return data({
    userId: session.get("userId"),
  });
}

export default function DashboardOutlet() {
  return (
    <main className="flex h-full min-h-screen flex-col bg-blue-50">
      <Navbar />
      <div className="grow">
        <Outlet />
      </div>
    </main>
  );
}

function Navbar() {
  const { userId } = useLoaderData<typeof loader>();

  const navLinkItems = [
    {
      id: "1",
      label: "Home",
      href: "/home",
      icon: <House className="size-5" />,
    },
    {
      id: "2",
      label: "Explore",
      href: "/explore",
      icon: <Search className="size-5" />,
    },
    {
      id: "3",
      label: "Profile",
      href: `/profile/${userId}`,
      icon: <ChartLine className="size-5" />,
    },
  ];

  return (
    <nav className="flex h-[4rem] items-center justify-between border border-blue-100 px-5 py-2 md:px-10">
      <Link
        to="/"
        className="h-fit w-fit rounded-xl bg-black px-4 py-2 text-center font-pacifico text-xl text-white"
      >
        F
      </Link>
      <div className="flex items-center gap-3 md:gap-10">
        {navLinkItems.map((navLink) => (
          <NavLink
            key={navLink.id}
            to={navLink.href}
            className={({ isActive }) =>
              isActive ? "navlink-active" : "navlink-inactive"
            }
          >
            <span className="">{navLink.icon}</span>
            <span className="hidden md:block">{navLink.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
