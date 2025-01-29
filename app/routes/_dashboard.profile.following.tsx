import { getSession } from "~/.server/sessions";
import type { Route } from "./+types/_dashboard.profile.following";
import { data, Link } from "react-router";
import invariant from "tiny-invariant";
import { getFollowingList } from "~/.server/models/follow";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const currentUserId = session.get("userId");
  invariant(
    currentUserId,
    "The userId was not resolved on the following loader",
  );

  const followingList = await getFollowingList(currentUserId);

  return data({ followingList }, { status: 200 });
}

export default function FollowingListPage({
  loaderData,
}: Route.ComponentProps) {
  const { followingList } = loaderData;

  return (
    <section className="mx-auto max-w-md space-y-4 py-5">
      <header className="text-3xl font-bold">Following</header>
      <div>
        {followingList.map((followingItem) => (
          <FollowingItem key={followingItem.id} followingData={followingItem} />
        ))}
      </div>
    </section>
  );
}

interface FollowingData {
  followingData: {
    id: string;
    name: string;
    userName: string;
  };
}

function FollowingItem({ followingData }: Readonly<FollowingData>) {
  return (
    <Link to={`/profile/${followingData.id}`}>
      <div className="flex items-center gap-5 rounded-lg border-4 border-blue-200 p-4">
        <div className="leading-3">
          <p className="text-lg font-medium">{followingData.name}</p>
          <p>@{followingData.userName}</p>
        </div>
      </div>
    </Link>
  );
}
