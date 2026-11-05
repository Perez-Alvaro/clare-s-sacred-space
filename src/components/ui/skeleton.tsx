import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };

