import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  photoUrl: z.string(),
});

// Export the inferred type for frontend use
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          description: input.description,
          photoUrl: input.photoUrl || "",
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getMyPosts: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),
});
