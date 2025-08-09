"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="mb-8 rounded-lg bg-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/zemelapis"
            className={`rounded-full px-6 py-2 font-semibold transition hover:bg-white/20 ${
              pathname === "/zemelapis"
                ? "bg-[hsl(118,100%,70%)] text-black"
                : "bg-white/10"
            }`}
          >
            {session ? "Mano įrašai" : "Pridėti įrašą"}
          </Link>
          <Link
            href="/ieskoti"
            className={`rounded-full px-6 py-2 font-semibold transition hover:bg-white/20 ${
              pathname === "/ieskoti"
                ? "bg-[hsl(118,100%,70%)] text-black"
                : "bg-white/10"
            }`}
          >
            Ieškoti suoliukų
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <button
              onClick={() => signOut()}
              className="rounded-full px-6 py-2 font-semibold text-white transition hover:bg-white/20"
            >
              Atsijungti
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-full px-6 py-2 font-semibold text-white transition hover:bg-white/20"
            >
              Prisijungti
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
