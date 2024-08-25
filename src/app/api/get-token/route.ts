import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Calling get-token for user: ", user.id);

    // token valid for 1 hour
    const expirationTime = Math.floor(Date.now() / 1000) * 60 * 60;

    // time when token was issued
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamServerClient.createToken(
      user.id,
      expirationTime,
      issuedAt
    );

    return Response.json({ token });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
