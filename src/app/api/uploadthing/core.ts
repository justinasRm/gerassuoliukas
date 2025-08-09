import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 3 } })
    // Set permissions and file types for this FileRoute
    // .middleware(({ req }) => {
    //   // This code runs on your server before upload
    //   // const session = await auth();
    //   // console.log("Session in middleware:", session?.user?.id);

    //   // // If you throw, the user will not be able to upload
    //   // if (!session?.user) {
    //   //   console.log("No session found, throwing unauthorized");
    //   //   throw new UploadThingError("Unauthorized");
    //   // }

    //   // console.log("Middleware completed successfully");
    //   // Whatever is returned here is accessible in onUploadComplete as `metadata`
    //   // return { userId: session.user.id };
    //   return null;
    // })
    .onUploadComplete(async ({ file }) => {
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
