import { getSession } from "./sessions";

export default async function getUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    //check if this is a matching userId or not
    console.log(session);
  } else {
    console.log("User is not signed in");
    return null;
  }
}
