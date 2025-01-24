import type { Route } from "../+types/root";
import { SocialIcon } from "react-social-icons";
import boatImage from "/boat.png";
import { Link } from "react-router";
import { MoveRight } from "lucide-react";
import getUserId from "~/.server/getUserId";

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
  await getUserId(request);
}

export default function RootPage() {
  return (
    <main className="bg-blue-50 w-screen h-screen flex flex-col">
      <Header />
      <Hero />
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-blue-100 p-4 flex justify-between items-center">
      <p className="font-pacifico text-2xl md:text-4xl">Flowy</p>
      <SocialIcon
        url="https://github.com/dhruvkaushik305/flowy"
        style={{ width: 40, height: 40 }}
      />
    </header>
  );
}

function Hero() {
  return (
    <section className="flex grow items-center justify-center">
      <div className="grow flex flex-col items-center justify-center gap-5 max-w-5xl px-4">
        <h2 className="font-abril text-4xl md:text-5xl lg:text-6xl text-center">
          Ride the current of progress
        </h2>
        <h3 className="font-roboto font-medium text-sm md:text-lg lg:text-xl text-center">
          Supercharge your productivity with a social time and task tracking app
          that turns goals into a collaborative adventure
        </h3>
        <Link
          to="/login"
          className="text-white bg-blue-700 rounded-full px-6 py-3 flex gap-2 items-center justify-center text-xs md:text-sm"
        >
          Get Started <MoveRight size={18} />
        </Link>
      </div>
      <figure className="h-auto max-w-lg grow lg:block hidden">
        <img src={boatImage} className="w-full" />
      </figure>
    </section>
  );
}
