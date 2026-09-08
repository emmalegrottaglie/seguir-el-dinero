import { NEWS_SOURCES } from "@/lib/news-sources.mjs";

/**
 * Serve a feed item's lead image through this origin.
 *
 * Rendering `<img src>` straight at the publisher would hand every reader's IP
 * address, user agent and referring page to fifteen third-party hosts. Several
 * of those hosts belong to LGBTQ+ organisations, so who reads them is exactly
 * the kind of thing not to leak — and the same applies to the housing and
 * poverty feeds. Proxying keeps the request between the reader and this site.
 *
 * It also makes the images survive: publishers block hotlinking, and a broken
 * image on every card is worse than no images at all.
 *
 * The allowlist is the point. An open image proxy is a server-side request
 * forgery tool and a bandwidth piñata, so only hosts belonging to the curated
 * registry are fetched, and only things that come back declaring themselves an
 * image are returned.
 */

export const revalidate = 86_400;

const TIMEOUT_MS = 8_000;
const MAX_BYTES = 4_000_000;

/**
 * Hosts the registry itself vouches for, plus the `www.`/bare counterpart of
 * each, because a feed on `example.org` routinely serves its media from
 * `www.example.org`.
 */
const ALLOWED_HOSTS: Set<string> = (() => {
  const hosts = new Set<string>();
  for (const source of NEWS_SOURCES) {
    try {
      const host = new URL(source.url).hostname.toLowerCase();
      hosts.add(host);
      hosts.add(host.startsWith("www.") ? host.slice(4) : `www.${host}`);
    } catch {
      // A malformed registry URL is caught by scripts/check-feeds.mjs; here it
      // simply contributes no host.
    }
  }
  return hosts;
})();

/**
 * A subdomain of an allowed host counts as allowed: WordPress sites serve from
 * `i0.wp.com`-style shards and organisations use `media.` or `cdn.` prefixes.
 * Matching on the registrable suffix of a vouched host keeps that working
 * without opening the proxy to the whole internet.
 */
function isAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  for (const allowed of ALLOWED_HOSTS) {
    if (host.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("bad scheme", { status: 400 });
  }
  if (!isAllowed(target.hostname)) return new Response("host not allowed", { status: 403 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(target, {
      signal: controller.signal,
      headers: { "User-Agent": "seguir-el-dinero/1.0 (+image proxy)", Accept: "image/*" },
      // Do not follow a redirect off an allowed host.
      redirect: "follow",
      next: { revalidate },
    });
    if (!upstream.ok) return new Response("upstream error", { status: 502 });

    const type = upstream.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return new Response("not an image", { status: 415 });

    const length = Number(upstream.headers.get("content-length") ?? "0");
    if (length > MAX_BYTES) return new Response("too large", { status: 413 });

    const body = await upstream.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return new Response("too large", { status: 413 });

    return new Response(body, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        // The bytes are third-party. Never let them be interpreted as anything
        // but an image by a browser that disagrees with the Content-Type.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
