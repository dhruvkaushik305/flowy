import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_auth";
import requireUserId from "~/.server/requireUserId";

export async function loader({request}:Route.LoaderArgs){
  const validUser = await requireUserId(request);

  if(validUser){
    return redirect("/home");
  }
}

export default function AuthLayout() {
  return (
    <main className="flex items-center justify-center h-screen bg-blue-50 p-4">
      <div className="w-[40rem] lg:w-[60rem] flex justify-center items-center bg-white rounded-xl">
        <Outlet />
      </div>
    </main>
  );
}
