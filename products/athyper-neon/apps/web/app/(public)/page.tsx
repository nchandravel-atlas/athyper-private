import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const COOKIE_NAME = "neon_session";

export default function PublicHome() {
  const session = cookies().get(COOKIE_NAME)?.value;

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
