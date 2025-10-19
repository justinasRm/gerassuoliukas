"use client";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { InteractiveMap } from "../interactiveMap/InteractiveMap";
import { Button } from "../commonUi/Button";
import { UploadThingDrop, type UploadThingDropRef } from "../UploadThingDrop";
import { useRef } from "react";
import { Navigation } from "../Navigation";
import { createPostSchema, type CreatePostFormData } from "./createPostSchema";

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

export const ZemelapisScreen = () => {
  const uploadRef = useRef<UploadThingDropRef>(null);
  const methods = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      photoUrls: [],
      location: {
        lat: 0,
        lng: 0,
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const utils = api.useUtils();

  const createPost = api.post.createPost.useMutation({
    onSuccess: () => {
      reset({
        title: "",
        description: "",
        photoUrls: [],
        location: {
          lat: 0,
          lng: 0,
        },
      });
      void utils.post.invalidate();
    },
  });

  const onSubmit = async (data: CreatePostFormData) => {
    if (!uploadRef.current) return;

    try {
      const uploadedUrls = await uploadRef.current.uploadFiles();

      createPost.mutate({
        title: data.title.trim(),
        description: data.description.trim(),
        photoUrls: uploadedUrls,
        location: {
          lat: data.location.lat,
          lng: data.location.lng,
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[hsl(125,100%,5%)] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Mano <span className="text-[hsl(118,100%,70%)]">suoliukas</span>
          </h1>
        </div>

        <Navigation />

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
                  <UploadThingDrop ref={uploadRef} />
                </div>

                {errors.photoUrls && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.photoUrls.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-4 block text-sm font-medium">Vieta*</label>
                <div
                  className={`mt-1 block w-full rounded-md border bg-white/10 px-3 py-2 focus:ring-1 focus:outline-none ${
                    errors.location
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:border-[hsl(118,100%,70%)] focus:ring-[hsl(118,100%,70%)]"
                  }`}
                >
                  <InteractiveMap
                    mode="location-picker"
                    onLocationSelect={(lat: number, lng: number) => {
                      setValue("location", {
                        lat,
                        lng,
                      });
                    }}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.location.message}
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
      </div>
    </main>
  );
};
