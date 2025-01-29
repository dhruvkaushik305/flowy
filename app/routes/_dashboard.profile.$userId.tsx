import { data, Link, redirect, useFetcher, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import {
  checkFollow,
  followUser,
  getFollowersCount,
  getFollowingCount,
  unfollowUser,
} from "~/.server/models/follow";
import { getTimeActivity } from "~/.server/models/time";
import { getTodoActivity } from "~/.server/models/todo";
import { getUserDetails, verifyUserId } from "~/.server/models/user";
import { destroySession, getSession } from "~/.server/sessions";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { cloneElement } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type { Route } from "./+types/_dashboard.profile.$userId";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const currentUserId = session.get("userId");
  invariant(currentUserId, "Userid was not resolved at the profile loader");

  const paramId = params.userId;
  if (!paramId) redirect("/home");

  const isValidUserId = await verifyUserId(paramId);
  if (!isValidUserId) {
    //TODO: have a toast for this message
    redirect("/home");
  }

  const [
    userDetails,
    todoActivity,
    timeActivity,
    isFollowing,
    followingCount,
    followersCount,
  ] = await Promise.all([
    getUserDetails(paramId),
    getTodoActivity(paramId),
    getTimeActivity(paramId),
    checkFollow(currentUserId, paramId), //whether the currentUser follows this user(in the params) or not
    getFollowingCount(currentUserId),
    getFollowersCount(currentUserId),
  ]);

  return data({
    userDetails,
    todoActivity,
    timeActivity,
    paramId,
    currentUserId,
    isFollowing,
    followingCount,
    followersCount,
  });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const currentUserId = session.get("userId");
  invariant(currentUserId, "The userId was not resolved at the profile action");

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "logout": {
      return redirect("/", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }
    case "follow": {
      const userId = formData.get("userId");

      if (!userId) return;
      await followUser(currentUserId, userId as string);
      break;
    }
    case "unfollow": {
      const userId = formData.get("userId");

      if (!userId) return;
      await unfollowUser(currentUserId, userId as string);
      break;
    }
    default: {
      console.log("Unhandled request", intent);
      break;
    }
  }
}

export default function Profilepage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-2 py-5">
      <UserDetails />
      <TimeActivity />
    </div>
  );
}

function UserDetails() {
  const {
    userDetails,
    followingCount,
    followersCount,
    isFollowing,
    currentUserId,
    paramId,
  } = useLoaderData<typeof loader>();
  const userFetcher = useFetcher();

  return (
    <section className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="flex grow flex-col gap-5 p-2">
        <div className="flex grow justify-between gap-5">
          <header className="font-roboto">
            <p className="text-3xl font-bold">{userDetails.name}</p>
            <p className="text-sm">@{userDetails.userName}</p>
            <p className="text-xs italic">
              Joined{" "}
              {new Date(userDetails.joinedAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              to="/profile/following"
              className="rounded-md bg-blue-100 p-2 md:p-4"
            >
              <span className="text-sm hover:underline">
                Following {followingCount}
              </span>
            </Link>
            <Link
              to="/profile/followers"
              className="rounded-md bg-blue-100 p-2 md:p-4"
            >
              <span className="text-sm hover:underline">
                Followers {followersCount}
              </span>
            </Link>
          </div>
        </div>
        <userFetcher.Form
          method="POST"
          className="flex justify-center text-sm md:text-lg"
        >
          {currentUserId == paramId ? (
            <button
              name="intent"
              value="logout"
              type="submit"
              className="my-3 w-[15rem] rounded-lg bg-black p-2 text-sm text-white md:w-[25rem] md:p-3"
            >
              Logout
            </button>
          ) : isFollowing ? (
            <>
              <input name="userId" value={paramId} hidden readOnly />
              <button
                name="intent"
                value="unfollow"
                className="my-3 w-[15rem] rounded-lg bg-black p-2 text-sm text-white md:w-[25rem] md:p-3"
              >
                Unfollow
              </button>
            </>
          ) : (
            <>
              <input name="userId" value={paramId} hidden readOnly />
              <button
                name="intent"
                value="follow"
                className="my-3 w-[15rem] rounded-lg bg-black p-2 text-sm text-white md:w-[25rem] md:p-3"
              >
                Follow
              </button>
            </>
          )}
        </userFetcher.Form>
      </div>
      <TodoActivity />
    </section>
  );
}

function CustomTooltip({
  payload,
  label,
  active,
}: TooltipProps<number, string>) {
  if (active) {
    return (
      <div className="rounded-md bg-white/90 p-2 opacity-70">
        <p className="font-noto-mono font-medium">{`${label}`}</p>
        <p className="font-noto-sans">{`Worked for ${payload![0].value} hrs`}</p>
      </div>
    );
  }

  return null;
}

function TimeActivity() {
  const { timeActivity } = useLoaderData<typeof loader>();

  return (
    <section className="space-y-4 rounded-lg border-4 border-blue-100 p-4">
      <header className="font-roboto text-2xl font-semibold">
        Weekly study time
      </header>
      <ResponsiveContainer width="100%" height={400} className="">
        <LineChart
          data={timeActivity}
          margin={{ top: 5, right: 20, bottom: 2, left: 0 }}
        >
          <CartesianGrid strokeDasharray="10 10" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Line type="monotone" dataKey="timeStudied" stroke="#60A5FA" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function TodoActivity() {
  const { todoActivity } = useLoaderData<typeof loader>();

  const currentMonth = new Date().toLocaleString("default", { month: "short" });

  return (
    <div>
      <ActivityCalendar
        data={todoActivity}
        blockRadius={4}
        blockSize={14}
        renderBlock={(block, activity) =>
          cloneElement(block, {
            "data-tooltip-id": "react-tooltip",
            "data-tooltip-html": `${activity.count} activities on ${activity.date}`,
          })
        }
        maxLevel={3}
        hideColorLegend={true}
        labels={{
          totalCount: `{{count}} tasks done in ${currentMonth}`,
        }}
      />
      <ReactTooltip id="react-tooltip" />
    </div>
  );
}
