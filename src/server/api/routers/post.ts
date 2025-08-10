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

  getAllPosts: publicProcedure.query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true, id: true },
        },
        votes: {
          select: {
            isUpvote: true,
            userId: true,
          },
        },
      },
    });

    // Calculate vote counts and user vote status
    const postsWithVotes = posts.map((post) => {
      const upvotes = post.votes.filter(
        (vote) => vote.isUpvote === true,
      ).length;
      const downvotes = post.votes.filter(
        (vote) => vote.isUpvote === false,
      ).length;
      const userVote = ctx.session?.user?.id
        ? post.votes.find((vote) => vote.userId === ctx.session!.user.id)
        : null;

      return {
        ...post,
        upvotes,
        downvotes,
        userVote: userVote ? (userVote.isUpvote ? "UPVOTE" : "DOWNVOTE") : null,
        votes: undefined, // Remove the votes array from the response
      };
    });

    return postsWithVotes;
  }),

  vote: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        isUpvote: z.boolean(), // true for upvote, false for downvote
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user already voted on this post
      const existingVote = await ctx.db.vote.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: input.postId,
          },
        },
      });

      if (existingVote) {
        // If user voted the same way, remove the vote (toggle off)
        if (existingVote.isUpvote === input.isUpvote) {
          await ctx.db.vote.delete({
            where: {
              id: existingVote.id,
            },
          });
          return { success: true, action: "removed" };
        } else {
          // If user voted differently, update the vote
          await ctx.db.vote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              isUpvote: input.isUpvote,
            },
          });
          return { success: true, action: "updated" };
        }
      } else {
        // Create new vote
        await ctx.db.vote.create({
          data: {
            userId: userId,
            postId: input.postId,
            isUpvote: input.isUpvote,
          },
        });
        return { success: true, action: "created" };
      }
    }),

  removeVote: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const userId = ctx.session.user.id;

      await ctx.db.vote.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return { success: true };
    }),

  getPostVotes: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const votes = await ctx.db.vote.findMany({
        where: { postId: input.postId },
      });

      const upvotes = votes.filter((vote) => vote.isUpvote).length;
      const downvotes = votes.filter((vote) => !vote.isUpvote).length;

      const userVote = ctx.session?.user?.id
        ? votes.find((vote) => vote.userId === ctx.session!.user.id)
        : null;

      return {
        upvotes,
        downvotes,
        userVote: userVote ? userVote.isUpvote : null,
      };
    }),
});
