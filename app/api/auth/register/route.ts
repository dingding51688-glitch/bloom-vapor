import { resolveServerBase } from "@/lib/server-base";
import { NextResponse } from "next/server";

const RAW_AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_BASE = RAW_AUTH_BASE ? resolveServerBase(RAW_AUTH_BASE) : "";

export async function POST(request: Request) {
  if (!AUTH_BASE) {
    return NextResponse.json({ error: { message: "Auth base URL is not configured" } }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { fullName, email, password, phone, telegramHandle } = body || {};

  if (!email || !password) {
    return NextResponse.json({ error: { message: "Email and password are required" } }, { status: 400 });
  }

  const username = (fullName && typeof fullName === "string" && fullName.trim().length > 0 ? fullName.trim() : email).slice(0, 60);

  const payload = {
    username,
    email,
    password,
    fullName,
    phone,
    telegramHandle
  };

  try {
    const response = await fetch(`${AUTH_BASE}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || "Registration failed";
      return NextResponse.json({ error: { message } }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: { message: "Unable to reach auth service" } }, { status: 502 });
  }
}
