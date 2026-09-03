import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border px-2 py-0.5 text-xs text-fg/70",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: "online" | "beta" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg/60">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "online" ? "bg-signal" : "bg-brass"
        )}
      />
      {status === "online" ? "online" : "beta"}
    </span>
  );
}
