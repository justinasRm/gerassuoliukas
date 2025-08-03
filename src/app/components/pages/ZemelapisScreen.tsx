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
import { useState, useEffect } from "react";

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
  photoUrls: z
    .array(z.string().url("Kažkas negerai su url..."))
    .min(
      1,
      "Gal tindery be nuotraukų ir praslysi, bet čia ne.\nĮkelk nuotrauką.",
    ),
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
      photoUrls: [],
    },
  });

  const photoUrls = methods.watch("photoUrls");
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(
    null,
  );
  const [polaroidRotations, setPolaroidRotations] = useState<number[]>([]);
  const [uploadingImages, setUploadingImages] = useState<number>(0);
  const singleUploadBegin = () => {
    setUploadingImages((prev) => prev + 1);
  };

  // Generate rotations when photoUrls change
  useEffect(() => {
    setPolaroidRotations(photoUrls.map(() => Math.random() * 20 - 10));
    setUploadingImages(0);
  }, [photoUrls.length]);

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
      photoUrl: data.photoUrls[0] || "", // For now, use the first URL until backend supports multiple
    });
  };

  const importantLithuanianDates = [
    new Date("1410-07-15").toLocaleDateString("lt-LT"), // Battle of Grunwald
    new Date("1918-02-16").toLocaleDateString("lt-LT"), // Act of Independence of Lithuania
    new Date("1990-03-11").toLocaleDateString("lt-LT"), // Restoration of Independence of Lithuania
    new Date("1253-07-06").toLocaleDateString("lt-LT"), // Coronation of Mindaugas
  ];

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
                    errors.photoUrls
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:border-[hsl(118,100%,70%)] focus:ring-[hsl(118,100%,70%)]"
                  }`}
                >
                  <UploadThingDrop singleUploadBegin={singleUploadBegin} />
                  <div className="my-6 px-5">
                    {(photoUrls.length > 0 || uploadingImages > 0) && (
                      <div>
                        <p className="mb-4 text-center text-sm text-white/70">
                          {uploadingImages > 0
                            ? "Keliama..."
                            : "Įkelsim šitas:"}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                          {/* Existing uploaded images */}
                          {photoUrls.map((url, index) => (
                            <div
                              key={`polaroid-${index}`}
                              className={`relative transform cursor-pointer bg-[hsl(118,100%,70%)] p-3 shadow-lg transition-all duration-200 ${
                                enlargedImageIndex === index
                                  ? "fixed inset-0 z-50 flex items-center justify-center"
                                  : ""
                              }`}
                              style={{
                                transform:
                                  enlargedImageIndex === index
                                    ? "scale(2) translate(0, 0)"
                                    : `rotate(${polaroidRotations[index] || Math.random() * 20 - 10}deg)`,
                              }}
                              onClick={() =>
                                setEnlargedImageIndex(
                                  enlargedImageIndex === index ? null : index,
                                )
                              }
                            >
                              <div
                                className={
                                  enlargedImageIndex === index ? "relative" : ""
                                }
                              >
                                <img
                                  src={url}
                                  alt={`Suoliukas ${index + 1}`}
                                  className="h-32 max-w-42 object-cover"
                                />
                                <div className="mt-2 text-center text-xs font-black text-gray-800">
                                  Suoliukas #{index + 1}
                                </div>
                                <div className="text-center text-xs font-medium text-gray-800">
                                  {new Date().toLocaleDateString("lt-LT")}
                                </div>
                                {enlargedImageIndex === index && (
                                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(118,100%,70%)] text-xs font-bold text-black">
                                    ✕
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Skeleton placeholders for uploading images */}
                          {Array.from(
                            { length: uploadingImages },
                            (_, index) => (
                              <div
                                key={`polaroid-placeholder-${index}`}
                                className="relative transform cursor-pointer bg-[hsl(118,100%,70%)] p-3 shadow-lg transition-all duration-200"
                                style={{
                                  transform: `rotate(${Math.random() * 20 - 10}deg)`,
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <img
                                    src={`/images/bench-placeholder${
                                      Math.floor(Math.random() * 5) + 1
                                    }.jpg`}
                                    alt={`Suoliukas ${index + 1}`}
                                    className="h-32 max-w-42 object-cover"
                                  />
                                  <div className="mt-2 text-center text-xs font-black text-gray-800">
                                    Panašaus originalumo{"\n"}suoliukas
                                  </div>
                                  <div className="text-center text-xs font-medium text-gray-800">
                                    {
                                      importantLithuanianDates[
                                        Math.floor(
                                          Math.random() *
                                            importantLithuanianDates.length,
                                        )
                                      ]
                                    }
                                  </div>
                                  {enlargedImageIndex === index && (
                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(118,100%,70%)] text-xs font-bold text-black">
                                      ✕
                                    </div>
                                  )}
                                </div>
                                {/* an overlay, adding slight darkness and bouncing anim in middle */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <img
                                    src="/images/bench2.svg"
                                    color="white"
                                    alt="Loading"
                                    className="h-20 w-20 animate-bounce"
                                    style={{ filter: "invert(1)" }}
                                  />
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {enlargedImageIndex !== null && (
                          <div
                            className="fixed inset-0 z-40 bg-black/80"
                            onClick={() => setEnlargedImageIndex(null)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {errors.photoUrls && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.photoUrls.message}
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
              Kol kas nieko neįkėlei. Nei vieno suoliuko. Lygiai nulis. Gal tu
              sėdėt nemėgsti? Eik paieškok suoliuko..
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
