import { redirect } from "next/navigation";
import { getWorkbenchFromSession } from "@neon/auth/session";

export default function Dashboard() {
  const wb = getWorkbenchFromSession();

  if (!wb) redirect("/login");

  if (wb === "admin") redirect("/wb/admin");
  if (wb === "user") redirect("/wb/user");
  if (wb === "partner") redirect("/wb/partner");

  redirect("/login");
}
