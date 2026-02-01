import { NextResponse } from "next/server";
import { keycloakPasswordGrant } from "@neon/auth/keycloak";
import { setSession } from "@neon/auth/session";

export async function POST(req: Request) {
  try {
    const { username, password, workbench } = await req.json();

    if (!username || !password || !workbench) {
      return new NextResponse("Missing username/password/workbench", { status: 400 });
    }

    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";

    const session = await keycloakPasswordGrant({
      baseUrl,
      realm,
      clientId,
      username,
      password,
      workbench
    });

    setSession(session);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Login error", { status: 401 });
  }
}
