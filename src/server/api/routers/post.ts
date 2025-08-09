import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const createPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  photoUrls: z.array(z.string()),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// Export the inferred type for frontend use
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const postRouter = createTRPCRouter({
  createPost: publicProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const postData = {
        title: input.title,
        description: input.description,
        photoUrls: input.photoUrls,
        locationLat: input.location.lat,
        locationLng: input.location.lng,
        ...(ctx.session?.user?.id && { createdById: ctx.session.user.id }),
      };

      return ctx.db.post.create({
        data: postData,
      });
    }),

  getMyPosts: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllPosts: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
  }),
});
