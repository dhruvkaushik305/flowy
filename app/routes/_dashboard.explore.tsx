import { getSession } from "~/.server/sessions";
import type { Route } from "./+types/_dashboard.explore";
import invariant from "tiny-invariant";
import { getFollowingData, searchUsers } from "~/.server/models/user";
import { data, Link, useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import debouncer from "~/utils/debouncer";
import { Clock } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  invariant(userId, "User id was not resolved at the explore loader");

  const { searchParams } = new URL(request.url);
  const initials = searchParams.get("q");

  const searchedUsers = await searchUsers(initials);
  const followingUsers = await getFollowingData(userId);

  return data({
    searchedUsers,
    followingUsers,
  });
}

export default function ExplorePage({ loaderData }: Route.ComponentProps) {
  return (
    <section className="mx-auto max-w-6xl px-2 py-5">
      <SearchUsers />
      <FollowingUsers />
    </section>
  );
}

function SearchUsers() {
  const searchFetcher = useFetcher<typeof loader>();
  const searchedUsers = searchFetcher.data?.searchedUsers;

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);

    if (event.target.value === "") {
      setShowModal(false);
    } else {
      setShowModal(true);
      debouncer(() => {
        searchFetcher.submit(event.target.form);
      }, 300);
    }
  };

  const handleOverlayClick = () => {
    setSearch("");
    setShowModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleOverlayClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <searchFetcher.Form className="relative z-50 h-full">
        <div className="space-y-4">
          <header className="font-roboto text-2xl font-bold md:text-3xl">
            Search other users
          </header>
          <input
            placeholder="Search by username"
            name="q"
            className="relative w-full rounded-md border-2 border-blue-200 bg-blue-100 p-2 transition-colors duration-200 focus:rounded-b-none focus:border-blue-300 focus:outline-none"
            onChange={handleInputChange}
            value={search}
          />
        </div>
        {showModal && (
          <div className="absolute left-0 top-full z-50 max-h-[15rem] w-full space-y-2 overflow-y-auto overflow-x-hidden rounded-b-md bg-blue-100 p-4">
            {searchedUsers && searchedUsers.length > 0 ? (
              searchedUsers.map((user) => (
                <UserResult key={user.id} user={user} />
              ))
            ) : (
              <h3 className="text-center text-zinc-500">No results found</h3>
            )}
          </div>
        )}
      </searchFetcher.Form>
      {showModal && (
        <button
          className="fixed inset-0 z-40 bg-gray-800 bg-opacity-60 hover:cursor-default"
          onClick={handleOverlayClick}
        ></button>
      )}
    </>
  );
}

interface UserResultProps {
  user: {
    id: string;
    name: string;
    userName: string;
  };
}

function UserResult({ user }: Readonly<UserResultProps>) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex flex-col rounded-md border-2 border-blue-200 p-2 md:p-3"
    >
      <p className="font-roboto text-lg font-medium md:text-xl">{user.name}</p>
      <p className="font-mono text-sm">@{user.userName}</p>
    </Link>
  );
}

function FollowingUsers() {
  const { followingUsers } = useLoaderData<typeof loader>();

  return (
    <div className="my-8 space-y-4">
      <header className="font-roboto text-2xl font-semibold md:text-3xl">
        People you follow
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {followingUsers.length > 0 ? (
          followingUsers.map((user) => (
            <DisplayUser key={user.id} user={user} />
          ))
        ) : (
          <p>You are not following anyone</p>
        )}
      </div>
    </div>
  );
}

interface Displayuser {
  user: {
    id: string;
    name: string;
    userName: string;
    timeStudied: number;
    totalTodos: number;
    completedTodos: number;
  };
}

function DisplayUser({ user }: Readonly<Displayuser>) {
  const hours = Math.floor(user.timeStudied / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((user.timeStudied % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (user.timeStudied % 60).toString().padStart(2, "0");

  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex flex-col gap-3 rounded-lg border-4 border-blue-200 p-2 md:p-3"
    >
      <header className="flex items-center gap-5">
        <p className="flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full bg-blue-200 font-roboto text-lg font-semibold md:text-xl">
          {user.name[0].toUpperCase()}
        </p>
        <div className="leading-4">
          <p className="font-roboto text-lg font-semibold md:text-xl">
            {user.name}
          </p>
          <p className="font-mono text-sm">@{user.userName}</p>
        </div>
      </header>
      <div className="space-y-2">
        <p className="flex items-center gap-2">
          <span className="text-sm font-medium">Focused for</span>
          <Clock className="size-5" /> {hours}:{minutes}:{seconds}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-nowrap text-sm font-medium">Today's Progress</p>
          <div className="relative h-6 w-full rounded-md bg-blue-200">
            <div
              className="h-full rounded-md bg-blue-400"
              style={{ width: `${user.completedTodos / user.totalTodos}` }}
            ></div>
            <span className="absolute right-2 top-0 z-10">
              {((user.completedTodos / user.totalTodos) * 100).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
