import { getSession } from "./sessions";

export default async function requireUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    return true;
  } else {
    return false;
  }
}
