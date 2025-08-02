"use client";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import type { Session } from "next-auth";
import { LoadingSpinner } from "../LoadingSpinner";
import dynamic from "next/dynamic";
import { UploadDropzone } from "~/utils/uploadthing";
import { LeafletMap } from "../LeafletMap";
import { Button } from "../ui/Button";
import { UploadThingDrop } from "../UploadThingDrop";
import Image from "next/image";

// const LeafletMap = dynamic(
//   () => import("../LeafletMap").then((mod) => ({ default: mod.LeafletMap })),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex h-[500px] w-full items-center justify-center">
//         <LoadingSpinner fullScreen={false} />
//       </div>
//     ),
//   },
// );

const createPostSchema = z.object({
  title: z
    .string()
    .min(
      1,
      "Nu toks geras tas tavo fotografuotas suoliukas (turbūt). Sugalvok jam pavadinimą.",
    )
    .max(100, "Persistengi su tuo pavadinimu, ne? Mažink iki 100 simbolių."),
  description: z
    .string()
    .min(1, "Vargai fotkindamas suoliuką, o aprašyt tingi? Įvesk aprašymą!")
    .max(500, "Leidžiu 500 simbolių. Daugiau neįmanoma. Ir taškas, seni."),
  photoUrl: z
    .string()
    .min(
      1,
      "Gal tindery be nuotraukų ir praslysi, bet čia ne.\nĮkelk nuotrauką.",
    )
    .url("Kažkas negerai su url..."),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

interface Props {
  session: Session;
}
export const ZemelapisScreen = (props: Props) => {
  const methods = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      photoUrl: "",
    },
  });

  const photoUrl = methods.watch("photoUrl");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const utils = api.useUtils();

  const { data: posts, isLoading } = api.post.getMyPosts.useQuery();

  const createPost = api.post.createPost.useMutation({
    onSuccess: () => {
      reset();
      void utils.post.getMyPosts.invalidate();
    },
  });

  const onSubmit = (data: CreatePostFormData) => {
    createPost.mutate({
      title: data.title.trim(),
      description: data.description.trim(),
      photoUrl: data.photoUrl,
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-[hsl(125,100%,5%)] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Mano <span className="text-[hsl(118,100%,70%)]">įrašai</span>
          </h1>
        </div>
        <LeafletMap />
        <div className="mb-8 rounded-lg bg-white/10 p-6">
          <h2 className="mb-8 text-xl font-semibold text-[hsl(118,100%,70%)]">
            Sukurti naują įrašą
          </h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-4 block text-sm font-medium">
                  Pavadinimas*
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className={`mt-1 block w-full rounded-md border bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:ring-1 focus:outline-none ${
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:border-[hsl(118,100%,70%)] focus:ring-[hsl(118,100%,70%)]"
                  }`}
                  placeholder="Įveskite pavadinimą..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-4 block text-sm font-medium">
                  Aprašymas*
                </label>
                <textarea
                  {...register("description")}
                  className={`mt-1 block w-full rounded-md border bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:ring-1 focus:outline-none ${
                    errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:border-[hsl(118,100%,70%)] focus:ring-[hsl(118,100%,70%)]"
                  }`}
                  placeholder="Aprašykite savo įrašą..."
                  rows={3}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-4 block text-sm font-medium">
                  Nuotrauka/os*
                </label>
                <div
                  className={`mt-1 block w-full rounded-md border bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:ring-1 focus:outline-none ${
                    errors.photoUrl
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:border-[hsl(118,100%,70%)] focus:ring-[hsl(118,100%,70%)]"
                  }`}
                >
                  <UploadThingDrop />
                  {/* {photoUrl && ( */}
                  {/* shitty image displaying. Need to fix. */}
                  <div className="mt-2">
                    <Image
                      src={
                        "https://utfs.io/f/Lad37l7OmRSbO0gzGiYr6aILHGYd84v0njgNWZuiF7wRBCcq"
                      }
                      alt="Preview"
                      className="max-h-48 w-full rounded object-cover"
                      width={500}
                      height={300}
                    />
                  </div>
                  {/* )} */}
                </div>

                {errors.photoUrl && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.photoUrl.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                fullWidth
                isLoading={isSubmitting || createPost.isPending}
                loadingText="Kuriama..."
                disabled={isSubmitting || createPost.isPending}
              >
                Sukurti įrašą
              </Button>
            </form>
          </FormProvider>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-[hsl(118,100%,70%)]">
            Jūsų įrašai
          </h2>
          {isLoading ? (
            <div className="text-center text-white/70">Kraunama...</div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg bg-white/10 p-4 transition hover:bg-white/20"
                >
                  <h3 className="font-semibold text-[hsl(118,100%,70%)]">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="mt-2 text-white/80">{post.description}</p>
                  )}
                  {post.photoUrl && (
                    <img
                      src={post.photoUrl}
                      alt={post.title}
                      className="mt-2 h-48 w-full rounded object-cover"
                    />
                  )}
                  <p className="mt-2 text-sm text-white/60">
                    Sukurta:
                    {new Date(post.createdAt).toLocaleDateString("lt-LT")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white/10 p-8 text-center text-white">
              Kol kas nieko neįkėlei. Nei vieno suoliuko. Lygiai 0. Gal tu sėdėt
              nemėgsti? Keistuolis...
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
