import { redirect } from "next/navigation";
import { requireProfile, roleHomePath } from "@/lib/rbac";

export default async function DashboardIndex() {
  const profile = await requireProfile();
  redirect(roleHomePath(profile.role));
}
