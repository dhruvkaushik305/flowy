import { getSession } from "./sessions";

export default async function requireUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    console.log(`User ${session.get("userId")} logged in`);
    return true;
  } else {
    console.log("User is not signed in");
    return false;
  }
}
