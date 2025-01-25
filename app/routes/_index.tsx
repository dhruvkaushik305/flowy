import type { Route } from "../+types/root";
import { SocialIcon } from "react-social-icons";
import boatImage from "../assets/boat.png?url";
import { data, Link, useLoaderData } from "react-router";
import { MoveRight } from "lucide-react";
import requireUserId from "~/.server/requireUserId";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flowy - Clock in, Check off" },
    {
      name: "description",
      content: "Track tasks, time efforts & ride the current of progress",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const validUser = await requireUserId(request);

  return data({ validUser });
}

export default function RootPage() {
  return (
    <main className="flex h-screen w-screen flex-col bg-blue-50">
      <Header />
      <Hero />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-blue-100 p-4">
      <p className="font-pacifico text-2xl md:text-4xl">Flowy</p>
      <SocialIcon
        url="https://github.com/dhruvkaushik305/flowy"
        style={{ width: 40, height: 40 }}
      />
    </header>
  );
}

function Hero() {
  const { validUser } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="flex grow items-center justify-center">
        <div className="flex max-w-5xl grow flex-col items-center justify-center gap-5 px-4">
          <h2 className="text-center font-abril text-4xl md:text-5xl lg:text-6xl">
            Ride the current of progress
          </h2>
          <h3 className="text-center font-roboto text-sm font-medium md:text-lg lg:text-xl">
            Supercharge your productivity with a social time and task tracking
            app that turns goals into a collaborative adventure
          </h3>
          <Link
            prefetch="intent"
            to={validUser ? "/home" : "/login"}
            className="flex items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-xs text-white md:text-sm"
          >
            Get Started <MoveRight size={18} />
          </Link>
        </div>
        <figure className="hidden h-auto max-w-lg grow lg:block">
          <img src={boatImage} className="w-full" />
        </figure>
      </section>
      <footer className="border-t border-blue-100 px-2 py-1 text-right text-sm">
        Made with{" "}
        <a href="https://x.com/remix_run" target="_blank">
          💿
        </a>{" "}
        by{" "}
        <a
          href="https://x.com/dhruvkaushik305"
          target="_blank"
          className="hover:underline"
        >
          Dhruv
        </a>
      </footer>
    </>
  );
}
