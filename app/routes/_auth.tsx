import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className="flex h-screen items-center justify-center bg-blue-50">
      <div>
        <Link to="/">Flowy</Link>
        <Outlet />
      </div>
    </main>
  );
}
