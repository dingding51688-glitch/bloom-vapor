import { resolveServerBase } from "@/lib/server-base";
import { NextResponse } from "next/server";

const RAW_AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_BASE = RAW_AUTH_BASE ? resolveServerBase(RAW_AUTH_BASE) : "";

export async function POST(request: Request) {
  if (!AUTH_BASE) {
    return NextResponse.json({ error: { message: "Auth base URL is not configured" } }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { identifier, password } = body || {};
  if (!identifier || !password) {
    return NextResponse.json({ error: { message: "Email/username and password are required" } }, { status: 400 });
  }

  try {
    const response = await fetch(`${AUTH_BASE}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const rawMessage = data?.error?.message || "Login failed";
      const message = mapStrapiError(rawMessage);
      return NextResponse.json({ error: { message } }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: { message: "Unable to reach auth service" } }, { status: 502 });
  }
}

function mapStrapiError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("identifier")) return "Email or password is incorrect";
  if (normalized.includes("not confirmed")) return "Account awaiting concierge verification";
  if (normalized.includes("blocked")) return "Account is blocked. Contact concierge.";
  return message;
}
