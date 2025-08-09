import { FaChevronLeft } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import React from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type GetAllPostsType = inferRouterOutputs<AppRouter>["post"]["getAllPosts"];

interface PostPopupProps {
  post: GetAllPostsType[number];
  onClose: () => void;
}

export const PostPopup = (props: PostPopupProps) => {
  const { post, onClose } = props;
  const images =
    post.photoUrls && post.photoUrls.length > 0 ? post.photoUrls : [];
  const [index, setIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  const hasMultiple = images.length > 1;
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40; // px
    if (Math.abs(delta) > threshold) {
      if (delta > 0)
        goNext(); // swipe left
      else goPrev(); // swipe right
    }
  };

  return (
    <div className="airbnb-card overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
      <div
        className="relative select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 0 && (
          <div className="relative h-44 w-full overflow-hidden sm:h-52">
            <div
              className="flex h-full w-full transition-transform duration-300"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((src) => (
                <div
                  key={src}
                  className="h-full w-full shrink-0 grow-0 basis-full"
                >
                  <img
                    src={src}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute top-1/2 left-2 flex h-10 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 p-1 font-black text-black shadow hover:bg-white"
                  aria-label="Previous image"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute top-1/2 right-2 flex h-10 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 p-1 font-black text-black shadow hover:bg-white"
                  aria-label="Next image"
                >
                  <FaChevronLeft
                    size={10}
                    style={{ transform: "rotate(180deg)" }}
                  />
                </button>
                <div className="pointer-events-none absolute right-0 bottom-2 left-0 flex justify-center gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 font-black text-black shadow hover:bg-white"
          aria-label="Close popup"
        >
          <IoIosClose size={20} onClick={onClose} className="" />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
            {post.title}
          </h3>
        </div>

        {post.description && (
          <p className="mb-2 line-clamp-3 text-sm text-gray-600">
            {post.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {post.createdBy?.image && (
              <img
                src={post.createdBy.image}
                alt={post.createdBy.name || "User"}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="max-w-[140px] truncate">
              {post.createdBy?.name || "Chromosoma X (arba Y)"}
            </span>
          </div>
          <span>{new Date(post.createdAt).toLocaleDateString("lt-LT")}</span>
        </div>
      </div>
    </div>
  );
};
