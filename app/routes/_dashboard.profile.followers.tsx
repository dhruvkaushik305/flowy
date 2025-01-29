import { data, Link } from "react-router";
import invariant from "tiny-invariant";
import { getSession } from "~/.server/sessions";
import type { Route } from "./+types/_dashboard.profile.followers";
import { getFollowersList } from "~/.server/models/follow";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  invariant(userId, "The userId was not resolved at the followers loader");

  const followersList = await getFollowersList(userId);

  return data({ followersList });
}

export default function FollowersPage({ loaderData }: Route.ComponentProps) {
  const { followersList } = loaderData;

  return (
    <section>
      <section className="mx-auto max-w-md space-y-4 py-5">
        <header className="text-3xl font-bold md:text-3xl">Followers</header>
        <div className="space-y-5">
          {followersList.map((followersItem) => (
            <FollowersItem
              key={followersItem.id}
              followersData={followersItem}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

interface FollowersData {
  followersData: {
    id: string;
    name: string;
    userName: string;
  };
}

function FollowersItem({ followersData }: Readonly<FollowersData>) {
  return (
    <Link to={`/profile/${followersData.id}`}>
      <div className="flex items-center gap-5 rounded-lg border-2 border-blue-200 p-2 font-roboto md:border-4 md:p-4">
        <div className="leading-3">
          <p className="text-lg font-medium">{followersData.name}</p>
          <p>@{followersData.userName}</p>
        </div>
      </div>
    </Link>
  );
}
