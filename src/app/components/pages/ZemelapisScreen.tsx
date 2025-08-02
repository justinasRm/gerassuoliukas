"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import type { Session } from "next-auth";
import { LoadingSpinner } from "../LoadingSpinner";
import dynamic from "next/dynamic";
import { UploadDropzone } from "~/utils/uploadthing";
import { LeafletMap } from "../LeafletMap";

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

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface Props {
  session: Session;
}
export const ZemelapisScreen = (props: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      photoUrl: "",
    },
  });

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
                // className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:border-[hsl(118,100%,70%)] focus:ring-1 focus:ring-[hsl(118,100%,70%)] focus:outline-none"
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
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    console.log("Dropzone upload complete:", res);
                    if (res && res[0]) {
                      setValue("photoUrl", res[0].ufsUrl);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.log("Upload error:", error);
                    // FileSizeMismatch - if the file size exceeds the limit
                    // FileCountMismatch - if the number of files exceeds the limit
                    if (error.message.includes("FileSizeMismatch")) {
                      setError("photoUrl", {
                        type: "manual",
                        message:
                          "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB.",
                      });
                    } else if (error.message.includes("FileCountMismatch")) {
                      setError("photoUrl", {
                        type: "manual",
                        message:
                          "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos.",
                      });
                    } else {
                      setError("photoUrl", {
                        type: "manual",
                        message:
                          "Kažkas nepavyko. elektra nepraėjo, rezisteris užstrigo, ar dar kas nors, nežinau.\nPerkrauk ir bandyk iš naujo.",
                      });
                    }
                  }}
                  appearance={{
                    button: {
                      backgroundColor: "#6bff66",
                      color: "#000",
                      border: "none",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 1rem",
                      fontWeight: "600",
                    },
                    label: {
                      color: "#fff",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem",
                    },
                    allowedContent: {
                      color: "#fff",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    },
                    uploadIcon: {
                      color: "#6bff66",
                    },
                  }}
                  //                     ready: boolean;
                  //   isUploading: boolean;
                  //   uploadProgress: number;
                  //   fileTypes: string[];
                  //   isDragActive: boolean;
                  //   files: File[];
                  content={{
                    label: "Pasirink nuotrauką/as, arba mestelk jas čia",
                    allowedContent: "Leidžiamos tik nuotraukos",
                    button({ ready, isUploading, uploadProgress, files }) {
                      if (ready) return "Įkelk";
                      if (uploadProgress) return `Kraunama: ${uploadProgress}%`;
                      if (files.length > 0)
                        return `Įkelsi ${files.length} nuostabias suoliuko nuotrauks`;
                    },
                  }}
                />
              </div>
              {errors.photoUrl && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.photoUrl.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || createPost.isPending}
              className="mt-4 w-full rounded-md bg-[hsl(118,100%,70%)] py-4 font-semibold text-black transition hover:bg-[hsl(118,80%,60%)] disabled:opacity-50"
            >
              {isSubmitting || createPost.isPending
                ? "Kuriama..."
                : "Sukurti įrašą"}
            </button>
          </form>
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
            <div className="rounded-lg bg-white/10 p-8 text-center text-white/70">
              Dar neturite įrašų. Sukurkite savo pirmą įrašą aukščiau!
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
