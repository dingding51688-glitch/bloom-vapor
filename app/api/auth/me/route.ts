import { resolveServerBase } from "@/lib/server-base";
import { NextResponse } from "next/server";

const RAW_AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_BASE = RAW_AUTH_BASE ? resolveServerBase(RAW_AUTH_BASE) : "";

export async function GET(request: Request) {
  if (!AUTH_BASE) {
    return NextResponse.json({ error: { message: "Auth base URL is not configured" } }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: { message: "Missing Authorization header" } }, { status: 401 });
  }

  try {
    const response = await fetch(`${AUTH_BASE}/api/users/me`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json"
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || "Unable to load profile";
      return NextResponse.json({ error: { message } }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: { message: "Unable to reach auth service" } }, { status: 502 });
  }
}
