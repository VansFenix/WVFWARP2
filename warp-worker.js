/**
 * WVFWARP — Cloudflare Worker Proxy
 * ===================================
 *
 * Бесплатный прокси для API Cloudflare WARP.
 *
 * Деплой:
 *   1. Перейдите на https://dash.cloudflare.com/ → Workers & Pages
 *   2. Создайте новый Worker, вставьте этот код
 *   3. Сохраните и получите URL вида: https://wvf-proxy-xxx.workers.dev
 *   4. Вставьте этот URL в поле «Прокси CF Worker» в приложении
 *
 * Лимиты бесплатного тарифа: 100 000 запросов/день
 * Этого хватит на >10 000 генераций конфигов в день.
 */

const API_BASE = "https://api.cloudflareclient.com/v0a2158";

// Разрешённые origin'ы — запросы только с вашего домена
const ALLOWED_ORIGINS = ["https://wvfwarp-2.vercel.app"];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname; // например /reg или /reg/xxx/account

    // Предохранитель: проксируем только WARP API
    if (!path.startsWith("/reg")) {
      return new Response("Not Found", { status: 404 });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    // Целевой URL
    const target = `${API_BASE}${path}${url.search}`;

    // Прокси-запрос к Cloudflare API
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set("Host", "api.cloudflareclient.com");

    const response = await fetch(target, {
      method: request.method,
      headers: proxyHeaders,
      body: request.body,
    });

    // Копируем ответ с CORS-заголовками
    const corsResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(corsHeaders(request))) {
      corsResponse.headers.set(key, value);
    }

    return corsResponse;
  },
};

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "*";
  const headers = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*")
      ? origin
      : ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0] || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  return headers;
}
