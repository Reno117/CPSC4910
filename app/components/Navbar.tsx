import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogoutButton from "./logout-button";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <nav className="bg-[#003862] text-[#ffffff] p-4 flex justify-between items-center sticky top-0">
      <div className="text-lg font-light tracking-[0.18em] uppercase text-white">
        <Link href="/">TIGER TRUCK TRANSIT</Link>
      </div>
      
      {session?.user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Logged in as: <strong>{session.user.name}</strong> | Role: <strong>{session.user.role}</strong>
          </span>
          <LogoutButton />
        </div>
      ) : (
     <div className="space-x-4">
      <Link
        href="/login"
        className="px-6 py-2 rounded-full border border-white text-white
                  hover:bg-white/10 transition-colors duration-200"
      >
        Login
      </Link>

      <Link
        href="/signup"
        className="px-6 py-2 rounded-full bg-white text-[#003862]
                  hover:bg-white/90 transition-colors duration-200"
      >
        Sign Up
      </Link>
    </div>
      )}
    </nav>
  );
}