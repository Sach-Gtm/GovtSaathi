import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type UserRole = "citizen" | "trader" | "officer" | "gatc" | "allocator" | "admin";

export interface SessionProfile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string | null;
  state_code: string | null;
  district_id: string | null;
  organisation: string | null;
  employee_code: string | null;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, email, state_code, district_id, organisation, employee_code")
    .eq("id", user.id)
    .single();

  return (profile as SessionProfile) ?? null;
}

export async function requireProfile(): Promise<SessionProfile> {
  const p = await getSessionProfile();
  if (!p) redirect("/login");
  return p;
}

export async function requireRole(roles: UserRole[]): Promise<SessionProfile> {
  const p = await requireProfile();
  if (!roles.includes(p.role)) redirect("/dashboard");
  return p;
}

export function roleHomePath(role: UserRole): string {
  switch (role) {
    case "trader":
      return "/dashboard/trader";
    case "officer":
    case "gatc":
      return "/dashboard/officer";
    case "allocator":
      return "/dashboard/allocator";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/citizen";
  }
}

export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    citizen: "Citizen",
    trader: "Trader",
    officer: "Legal Metrology Officer",
    gatc: "GATC Verifier",
    allocator: "Allocator",
    admin: "Administrator"
  };
  return map[role];
}
