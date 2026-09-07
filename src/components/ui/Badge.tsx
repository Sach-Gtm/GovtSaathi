import { cn } from "@/lib/utils";

type Variant = "default" | "brand" | "success" | "warning" | "danger";
export function Badge({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const map: Record<Variant, string> = {
    default: "badge-default",
    brand: "badge-brand",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger"
  };
  return <span className={cn(map[variant], className)}>{children}</span>;
}

export function statusBadge(status: string) {
  const map: Record<string, Variant> = {
    draft: "default",
    submitted: "brand",
    assigned: "brand",
    in_verification: "warning",
    verified: "success",
    rejected: "danger",
    cancelled: "default",
    pass: "success",
    fail: "danger",
    conditional: "warning"
  };
  return map[status] ?? "default";
}
