"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Protected({
  adminOnly = false,
  children
}: {
  adminOnly?: boolean;
  children: React.ReactNode;
}) {
  const { ready, user } = useAuth();

  if (!ready) {
    return <p className="text-sm text-slate-600">Loading session...</p>;
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Login required</h1>
        <p className="mt-2 text-slate-600">Please login to continue.</p>
        <Link className="mt-4 inline-flex rounded-md bg-rosewood px-4 py-2 text-white" href="/login">
          Login
        </Link>
      </div>
    );
  }

  if (adminOnly && user.role !== "ADMIN") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Forbidden</h1>
        <p className="mt-2 text-slate-600">Admin permission is required.</p>
      </div>
    );
  }

  return <>{children}</>;
}
