/**
 * WVFWARP — серверный прокси для API Cloudflare WARP (Vercel Function).
 * Обходит CORS: запросы к api.cloudflareclient.com идут с сервера Vercel.
 *
 * Роуты (через vercel.json rewrite):
 *   POST /api/reg             — регистрация устройства
 *   PUT  /api/reg/:id/account — применение лицензии WARP+
 */
const API_BASE =
  process.env.WARP_API_BASE || "https://api.cloudflareclient.com/v0a2158";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");

    // vercel.json подставляет оригинальный путь в query-параметр __path,
    // т.к. файл api/warp.js физически обслуживается по маршруту /api/warp
    const q = url.searchParams.get("__path");
    let path = q !== null ? `/${q}` : url.pathname.replace(/^\/api/, "");
    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace(/\/+$/, "") || "/";

    // Диагностика: ?__echo=1 вернёт то, что видит функция
    if (url.searchParams.has("__echo")) {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).end(
        JSON.stringify({
          method: req.method,
          pathname: url.pathname,
          path,
          host: req.headers.host || null,
          rewrite: req.headers["x-vercel-rewrite"] || null,
        }),
      );
    }

    if (!path.startsWith("/reg")) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).end(JSON.stringify({ error: "Not Found", path }));
    }

    if (req.method === "OPTIONS") return res.status(204).end();

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      const lk = k.toLowerCase();
      if (
        ["host", "content-length", "connection", "transfer-encoding", "accept-encoding"].includes(
          lk,
        )
      )
        continue;
      if (typeof v === "string") headers.set(k, v);
      else if (Array.isArray(v)) v.forEach((item) => headers.append(k, item));
    }

    const body =
      req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);

    const params = new URLSearchParams(url.search);
    params.delete("__path");
    params.delete("__echo");
    const qs = params.toString();
    const target = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

    /** Серверная цепочка: прямой запрос, затем CORS-прокси на случай блокировок */
    const attempts = [
      target,
      `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    ];

    let lastError = null;
    for (const attemptUrl of attempts) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        const resp = await fetch(attemptUrl, {
          method: req.method,
          headers,
          body,
          redirect: "manual",
        });
        clearTimeout(timer);
        res.status(resp.status);
        res.setHeader(
          "Content-Type",
          resp.headers.get("content-type") || "application/json",
        );
        res.setHeader("Cache-Control", "no-store");
        return res.end(Buffer.from(await resp.arrayBuffer()));
      } catch (err) {
        lastError = err;
      }
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(502).end(
      JSON.stringify({
        error: String(lastError instanceof Error ? lastError.message : lastError),
      }),
    );
  } catch (err) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).end(
      JSON.stringify({
        error: String(err instanceof Error ? err.message : err),
      }),
    );
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
