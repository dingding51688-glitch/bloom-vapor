import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade"
]);

const FORWARDED_HEADER_ALLOWLIST = new Set([
  "authorization",
  "content-type",
  "accept",
  "accept-language",
  "accept-encoding",
  "user-agent",
  "cookie"
]);

async function handler(request: NextRequest, context: { params: { slug?: string[] } }) {
  const baseUrl = process.env.STRAPI_DIRECT_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "STRAPI_DIRECT_URL is not configured" }, { status: 500 });
  }

  const slug = context.params?.slug?.join("/") ?? "";
  const targetUrl = new URL(slug ? `/${slug}` : "/", baseUrl);
  targetUrl.search = request.nextUrl.search;

  const headers = buildForwardHeaders(request, baseUrl);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual"
  };

  if (request.body) {
    init.body = request.body as any;
    (init as any).duplex = "half";
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, init);
  } catch (error) {
    console.error("Strapi proxy fetch failed", error);
    return NextResponse.json({ error: "Unable to reach Strapi" }, { status: 502 });
  }

  const responseHeaders = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}

function buildForwardHeaders(request: NextRequest, baseUrl: string) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (FORWARDED_HEADER_ALLOWLIST.has(lowerKey) || lowerKey.startsWith("x-")) {
      headers.set(key, value);
    }
  });
  const upstreamHost = new URL(baseUrl).host;
  headers.set("host", upstreamHost);

  const forwardedHosts = request.headers.get("host");
  if (forwardedHosts) {
    headers.set("x-forwarded-host", forwardedHosts);
  }
  const existingForwardedFor = request.headers.get("x-forwarded-for") || "";
  const chain = [existingForwardedFor, request.ip].filter(Boolean);
  if (chain.length) {
    headers.set("x-forwarded-for", chain.join(", "));
  }
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  return headers;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
export const TRACE = handler;
