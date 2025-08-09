"use client";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../LoadingSpinner";
import { Navigation } from "../Navigation";
import { InteractiveMap } from "../interactiveMap/InteractiveMap";

export const IeskotiScreen = () => {
  const { data: posts, isLoading, error } = api.post.getAllPosts.useQuery();

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col bg-[hsl(125,100%,5%)] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              <span className="text-[hsl(118,100%,70%)]">Ieškoti</span> suoliukų
            </h1>
          </div>
          <Navigation />
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner fullScreen={false} />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col bg-[hsl(125,100%,5%)] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              <span className="text-[hsl(118,100%,70%)]">Ieškoti</span> suoliukų
            </h1>
          </div>
          <Navigation />
          <div className="rounded-lg bg-red-500/20 p-8 text-center text-red-300">
            Kažkas negerai... Nepavyko užkrauti suoliukų žemėlapio.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[hsl(125,100%,5%)] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(118,100%,70%)]">Ieškoti</span> suoliukų
          </h1>
        </div>

        <Navigation />

        <div className="mb-6 rounded-lg bg-white/10 p-6">
          <InteractiveMap
            mode="post-display"
            posts={posts || []}
            height="h-130 md:h-[600px]"
            zoom={11}
          />
        </div>

        <div className="rounded-lg bg-white/10 p-6">
          <h2 className="mb-4 text-xl font-semibold text-[hsl(118,100%,70%)]">
            Statistikos
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                {posts?.length || 0}
              </div>
              <div className="text-sm text-white/70">Viso suoliukų</div>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                {posts?.reduce((sum, post) => sum + post.photoUrls.length, 0) ||
                  0}
              </div>
              <div className="text-sm text-white/70">Viso nuotraukų</div>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                {posts && posts.length > 0
                  ? (() => {
                      const authenticatedUsers = new Set(
                        posts
                          .filter((post) => post.createdBy?.name)
                          .map((post) => post.createdBy!.name),
                      ).size;

                      return authenticatedUsers;
                    })()
                  : 0}
              </div>
              {posts && posts.some((post) => !post.createdBy) && (
                <div className="mb-1 text-xs text-[hsl(118,100%,70%)]">
                  + anonimai (cmon, prisijunkit...)
                </div>
              )}
              <div className="text-sm text-white/70">Aktyvių ieškotojų</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
