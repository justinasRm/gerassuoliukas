import type { Post } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type GetAllPostsType = inferRouterOutputs<AppRouter>["post"]["getAllPosts"];

interface PostPopupProps {
  post: GetAllPostsType[number];
  onClose: () => void;
}

export const PostPopup = (props: PostPopupProps) => {
  const { post, onClose } = props;
  return (
    <div style={{ marginLeft: "4px" }}>
      <div className="mb-3 flex justify-between">
        <h3 className="text-lg font-bold text-green-600">{post.title}</h3>
        <button
          onClick={onClose}
          className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        {post.photoUrls.length === 1 ? (
          <img
            src={post.photoUrls[0]}
            alt={post.title}
            className="h-48 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {post.photoUrls.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`${post.title} ${index + 1}`}
                className={`rounded-lg object-cover ${
                  post.photoUrls.length === 2 ? "h-32" : "h-24"
                } w-full`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mb-3 text-sm text-gray-700">{post.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {post.createdBy.image && (
            <img
              src={post.createdBy.image}
              alt={post.createdBy.name || "User"}
              className="h-6 w-6 rounded-full"
            />
          )}
          <span>{post.createdBy.name || "Anonimas"}</span>
        </div>
        <span>{new Date(post.createdAt).toLocaleDateString("lt-LT")}</span>
      </div>
    </div>
  );
};
