/**
 * WVFWARP — серверный прокси для API Cloudflare WARP (Vercel Function).
 * Обходит CORS: запросы к api.cloudflareclient.com идут с сервера Vercel.
 *
 * Роуты:
 *   POST /api/reg            — регистрация устройства
 *   PUT  /api/reg/:id/account — применение лицензии WARP+
 */
const API_BASE =
  process.env.WARP_API_BASE || "https://api.cloudflareclient.com/v0a2158";

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";

  if (!path.startsWith("/reg")) {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const baseHeaders = new Headers(request.headers);
  baseHeaders.delete("host");
  baseHeaders.delete("content-length");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const target = `${API_BASE}${path}${url.search}`;

  /** Серверная цепочка: прямой запрос, затем CORS-прокси на случай блокировок */
  const attempts = [
    { url: target, headers: baseHeaders },
    { url: `https://corsproxy.io/?url=${encodeURIComponent(target)}`, headers: baseHeaders },
    {
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
      headers: baseHeaders,
    },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(attempt.url, {
        method: request.method,
        headers: attempt.headers,
        body,
        redirect: "manual",
      });
      clearTimeout(timer);

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      lastError = err;
    }
  }

  return new Response(
    JSON.stringify({
      error: String(lastError instanceof Error ? lastError.message : lastError),
    }),
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    },
  );
}
