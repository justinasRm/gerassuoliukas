interface Props {
  fullScreen?: boolean;
}
export const LoadingSpinner = ({ fullScreen }: Props) => (
  <div
    className={`flex ${fullScreen ? "min-h-screen" : "h-32"} items-center justify-center bg-[hsl(125,100%,5%)] text-white`}
  >
    <div className="relative flex h-32 flex-col items-center justify-center">
      <div className="animate-bench-move relative">
        <div className="relative h-3 w-20 animate-pulse rounded-sm bg-green-700 shadow-lg" />
        <div className="absolute top-3 left-2 h-6 w-2 animate-pulse rounded-sm bg-green-800 shadow-md" />
        <div className="absolute top-3 right-2 h-6 w-2 animate-pulse rounded-sm bg-green-800 shadow-md" />
        <div className="absolute top-9 left-0 h-1 w-20 animate-pulse rounded-full bg-green-400/20 blur-sm" />
      </div>
    </div>
  </div>
);
