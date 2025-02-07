import type { Route } from "../+types/root";
import { SocialIcon } from "react-social-icons";
import boatImage from "../assets/boat.png?url";
import { data, Link, useLoaderData, useNavigation } from "react-router";
import { Ellipsis, House, MoveRight } from "lucide-react";
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
    <main className="flex h-screen w-screen flex-col">
      <Header />
      <Hero />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-300 p-4">
      <p className="font-pacifico text-3xl md:text-4xl">Flowy</p>
      <SocialIcon
        url="https://github.com/dhruvkaushik305/flowy"
        style={{ width: 40, height: 40 }}
      />
    </header>
  );
}

function Hero() {
  const { validUser } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <>
      <section className="flex grow items-center justify-center bg-blue-50">
        <div className="flex max-w-3xl grow flex-col items-center justify-center gap-5 px-4 xl:max-w-5xl">
          <h2 className="text-center font-abril text-5xl md:text-5xl xl:text-7xl">
            Ride the current of progress
          </h2>
          <h3 className="text-center font-roboto text-sm font-medium md:text-lg lg:text-xl">
            Supercharge your productivity with a social time and task tracking
            app that turns goals into a collaborative adventure
          </h3>
          <Link
            prefetch="intent"
            to={validUser ? "/home" : "/login"}
            className="group flex items-center justify-center gap-2 rounded-full bg-blue-700 px-4 py-3 font-semibold text-white"
          >
            {validUser ? (
              <>
                Go to Home{" "}
                {navigation.state !== "idle" ? (
                  <Ellipsis size={20} />
                ) : (
                  <House
                    size={20}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </>
            ) : (
              <>
                Get Started{" "}
                {navigation.state !== "idle" ? (
                  <Ellipsis size={20} />
                ) : (
                  <MoveRight
                    size={20}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                )}
              </>
            )}
          </Link>
        </div>
        <figure className="hidden lg:block">
          <img
            src={boatImage}
            className="h-auto w-[25rem] xl:h-auto xl:w-[35rem]"
            alt="hero_image"
          />
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
