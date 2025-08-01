import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Gera<span className="text-[hsl(118,100%,70%)]">sS</span>uoliukas
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl">
              Ei, <span className="text-[hsl(118,100%,70%)]">hiparike</span>,
              radai gerą suoliuką? Įkelk nuotrauką!
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              {session ? (
                <Link
                  href="/posts"
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  Peržiūrėti suoliukus
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  Prisijungti
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
