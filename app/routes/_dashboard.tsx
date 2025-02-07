import {
  data,
  Link,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
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
  const navigation = useNavigation();

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
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="h-fit w-fit rounded-xl bg-black px-4 py-2 text-center font-pacifico text-xl text-white"
          prefetch="intent"
        >
          F
        </Link>
        {navigation.state !== "idle" && (
          <svg
            aria-hidden="true"
            className="h-8 w-8 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        )}
      </div>
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
