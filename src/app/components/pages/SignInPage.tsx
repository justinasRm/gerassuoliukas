"use client";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";

export const SignInPage = () => {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    loadProviders();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(125,100%,5%)] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Pri<span className="text-[hsl(118,100%,70%)]">si</span>junk
        </h1>
        <p className="text-2xl">Prisijunkite prie savo paskyros</p>

        <div className="flex flex-col gap-4">
          <button
            key="google-provider"
            onClick={() => signIn("google")}
            className="flex items-center gap-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            <img
              src="/images/icons8-google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Prisijungti su Google
          </button>
        </div>
      </div>
    </div>
  );
};
