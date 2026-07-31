/**
 * WVFWARP — Cloudflare Worker Proxy
 * ===================================
 *
 * Прокси для API Cloudflare WARP. Работает с сайтом WVFWARP,
 * отдаёт CORS-заголовки и проксирует запросы /reg*.
 *
 * Деплой:
 *   npx wrangler login
 *   npx wrangler deploy warp-worker.js --name wvf-proxy
 *
 * Опционально: переменная окружения ALLOWED_ORIGINS
 * (список origin'ов через запятую, например:
 *  "https://wvfwarp-2.vercel.app,http://localhost:5173")
 */

const API_BASE = "https://api.cloudflareclient.com/v0a2158";

const DEFAULT_ORIGINS = [
  "https://wvfwarp-2.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Проверка живости воркера
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders(request, env) },
      });
    }

    // Предохранитель: проксируем только WARP API
    if (!path.startsWith("/reg")) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(request, env) },
      });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }

    const target = `${API_BASE}${path}${url.search}`;

    // Прокси-запрос к Cloudflare API (Host берётся из URL)
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.delete("host");
    proxyHeaders.delete("content-length");

    try {
      const response = await fetch(target, {
        method: request.method,
        headers: proxyHeaders,
        body: request.body,
      });

      const out = new Response(response.body, response);
      for (const [key, value] of Object.entries(corsHeaders(request, env))) {
        out.headers.set(key, value);
      }
      return out;
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders(request, env) },
        },
      );
    }
  },
};

function corsHeaders(request, env) {
  const origin = request?.headers?.get("Origin") || "";
  const fromEnv = (env?.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = [...fromEnv, ...DEFAULT_ORIGINS];
  const allow = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
