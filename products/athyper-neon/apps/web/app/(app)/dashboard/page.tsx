import { redirect } from "next/navigation";
import { getSessionBootstrap } from "../../../lib/session-bootstrap";

export default async function Dashboard() {
  const session = await getSessionBootstrap();

  if (!session) redirect("/login");

  const wb = session.workbench;
  if (wb === "admin") redirect("/wb/admin");
  if (wb === "user") redirect("/wb/user");
  if (wb === "partner") redirect("/wb/partner");

  redirect("/login");
}
