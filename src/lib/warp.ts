import nacl from "tweetnacl";

/* ============================ types ============================ */

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface WarpRegistration {
  id: string;
  token: string;
  account?: {
    license?: string;
    account_type?: string;
    warp_plus?: { enabled?: boolean };
  };
  config: {
    interface: { addresses: { v4: string; v6: string } };
    peers: Array<{
      public_key: string;
      endpoint: { host?: string; v4?: string; v6?: string };
    }>;
  };
}

export interface AmneziaOpts {
  enabled: boolean;
  jc: number;
  jmin: number;
  jmax: number;
  s1: number;
  s2: number;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
}

export interface BuildOptions {
  privateKey: string;
  addressV4: string;
  addressV6: string;
  peerPublicKey: string;
  endpoint: string;
  allowedIps: string[];
  dns: string[];
  mtu: number;
  keepalive: number;
  deviceName: string;
  accountLabel: string;
  amnezia: AmneziaOpts;
  offline: boolean;
}

export interface GenerateResult {
  config: string;
  fileName: string;
  qrText: string;
  endpoint: string;
  allowedCount: number;
  fingerprint: string;
  accountLabel: string;
  ipv4: string;
  ipv6: string;
  offline: boolean;
}

/* ============================ crypto ============================ */

const b64 = (bytes: Uint8Array): string => {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

const randB64 = (len: number): string => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return b64(bytes);
};

export const generateKeyPair = (): KeyPair => {
  const kp = nacl.box.keyPair();
  return { privateKey: b64(kp.secretKey), publicKey: b64(kp.publicKey) };
};

export const keyFingerprint = (key: string): string => {
  const clean = key.replace(/=+$/, "").slice(-10).toUpperCase();
  return `#${clean.slice(0, 5)}-${clean.slice(5)}`;
};

/* ============================ API ============================ */

const API_VER = "v0a2158";
const API_BASE = `https://api.cloudflareclient.com/${API_VER}`;
const REAL_PEER_KEY = "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=";

const withProxy = (url: string): string[] => [
  url,
  `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Встроенный серверный прокси сайта (Vercel Function `/api/warp.js`).
 * Идёт первым в списке попыток — работает без CORS и не зависит от
 * публичных CORS-прокси.
 */
const sameOriginProxy = (path: string): string | null => {
  if (typeof location !== "undefined" && /^https?:\/\//.test(location.origin)) {
    return `${location.origin}/api${path}`;
  }
  return null;
};

export interface RegisterOutcome {
  reg: WarpRegistration;
  offline: boolean;
  plusApplied: boolean;
}

export async function registerDevice(
  publicKey: string,
  warpKey: string,
  onLog: (msg: string, kind: "info" | "ok" | "warn") => void,
  customProxy?: string,
): Promise<RegisterOutcome> {
  const installId = randB64(11).replace(/[+/=]/g, "x").slice(0, 22);
  const body = JSON.stringify({
    key: publicKey,
    install_id: installId,
    fcm_token: `${installId}:APA91b${randB64(80).replace(/[+/=]/g, "f")}`,
    tos: new Date().toISOString(),
    model: "PC",
    serial_number: installId,
    locale: "ru-RU",
  });

  /**
   * Если указан кастомный прокси (Cloudflare Worker), шлём запросы напрямую через него.
   * Worker сам решает CORS и не требует fallback-прокси.
   */
  const useProxy = customProxy
    ?.replace(/\/+$/, "")
    // Если пользователь случайно вставил URL с путём /reg, обрезаем
    ?.replace(/\/reg(\/.*)?$/, "");

  const apiFetch = async <T>(path: string, init: RequestInit): Promise<T> => {
    const candidates: string[] = [];
    if (useProxy) {
      candidates.push(`${useProxy}${path}`);
    } else {
      const same = sameOriginProxy(path);
      if (same) candidates.push(same);
      candidates.push(...withProxy(`${API_BASE}${path}`));
    }
    let lastError: unknown = null;
    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as T;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("network error");
  };

  let reg: WarpRegistration | null = null;
  let offline = false;

  try {
    reg = await apiFetch<WarpRegistration>("/reg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Client-Version": "a-6.10-1914",
        "User-Agent": "okhttp/3.12.1",
      },
      body,
    });
    onLog("Устройство зарегистрировано в сети Cloudflare", "ok");
  } catch {
    offline = true;
    onLog("API недоступен — собран автономный конфиг", "warn");
    reg = makeOfflineRegistration();
  }

  let plusApplied = false;
  const license = warpKey.trim();
  if (license && !offline && reg.id && reg.token) {
    try {
      await apiFetch(`/reg/${reg.id}/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${reg.token}`,
        },
        body: JSON.stringify({ license }),
      });
      plusApplied = true;
      onLog("Лицензия WARP+ применена (≈24 ПБ трафика)", "ok");
    } catch {
      onLog("Не удалось применить ключ WARP+ — конфиг останется Free", "warn");
    }
  }

  return { reg, offline, plusApplied };
}

function makeOfflineRegistration(): WarpRegistration {
  const rand = (n: number) => {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return Array.from(bytes);
  };
  const v4tail = rand(2);
  const v6 = rand(15)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const v6grouped = `${v6.slice(0, 4)}:${v6.slice(4, 8)}:${v6.slice(8, 12)}:${v6.slice(12, 16)}:${v6.slice(16, 20)}:${v6.slice(20, 24)}:${v6.slice(24, 28)}:${v6.slice(28, 30)}00`;
  return {
    id: "offline",
    token: "",
    account: { account_type: "free" },
    config: {
      interface: {
        addresses: {
          v4: `172.16.${v4tail[0] % 256}.${(v4tail[1] % 252) + 2}`,
          v6: `2606:4700:110:${v6grouped}`,
        },
      },
      peers: [
        {
          public_key: REAL_PEER_KEY,
          endpoint: { host: "engage.cloudflareclient.com:2408" },
        },
      ],
    },
  };
}

/* ============================ config builder ============================ */

export function buildConfig(o: BuildOptions): string {
  const lines: string[] = [];
  const now = new Date().toLocaleString("ru-RU");

  lines.push(`# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`#  WVFWARP · Cloudflare WARP ${o.offline ? "(автономный режим)" : ""}`);
  lines.push(`#  Устройство: ${o.deviceName} · Аккаунт: ${o.accountLabel}`);
  lines.push(`#  Создано: ${now}`);
  lines.push(`# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`[Interface]`);
  lines.push(`PrivateKey = ${o.privateKey}`);
  lines.push(`Address = ${o.addressV4}/32`);
  lines.push(`Address = ${o.addressV6}/128`);
  if (o.dns.length) lines.push(`DNS = ${o.dns.join(", ")}`);
  lines.push(`MTU = ${o.mtu}`);
  if (o.amnezia.enabled) {
    lines.push(`Jc = ${o.amnezia.jc}`);
    lines.push(`Jmin = ${o.amnezia.jmin}`);
    lines.push(`Jmax = ${o.amnezia.jmax}`);
    lines.push(`S1 = ${o.amnezia.s1}`);
    lines.push(`S2 = ${o.amnezia.s2}`);
    lines.push(`H1 = ${o.amnezia.h1}`);
    lines.push(`H2 = ${o.amnezia.h2}`);
    lines.push(`H3 = ${o.amnezia.h3}`);
    lines.push(`H4 = ${o.amnezia.h4}`);
  }
  lines.push(``);
  lines.push(`[Peer]`);
  lines.push(`PublicKey = ${o.peerPublicKey}`);
  lines.push(`AllowedIPs = ${o.allowedIps.join(", ")}`);
  lines.push(`Endpoint = ${o.endpoint}`);
  if (o.keepalive > 0) lines.push(`PersistentKeepalive = ${o.keepalive}`);
  return lines.join("\n");
}

export const sanitizeName = (name: string): string => {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 15);
  return clean || "wvfwarp";
};

/** Имя конфига в стиле официального клиента: WARP + 7 цифр */
export const randomConfigName = (): string =>
  `WARP${String(Math.floor(1000000 + Math.random() * 9000000))}`;

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ============================ constants ============================ */

export const PORTS = [
  { value: 2408, label: "2408", hint: "стандарт WARP" },
  { value: 500, label: "500", hint: "IKE / IPsec" },
  { value: 1701, label: "1701", hint: "L2TP" },
  { value: 4500, label: "4500", hint: "IPsec NAT-T" },
  { value: 864, label: "864", hint: "резервный" },
  { value: 878, label: "878", hint: "резервный" },
  { value: 8886, label: "8886", hint: "альтернативный" },
] as const;

export const ENDPOINTS = [
  { value: "auto", label: "Автовыбор", hint: "лучший узел от API" },
  { value: "engage.cloudflareclient.com", label: "engage", hint: "доменное имя" },
  { value: "162.159.192.1", label: "162.159.192.1", hint: "узел · EU" },
  { value: "162.159.193.10", label: "162.159.193.10", hint: "узел · EU" },
  { value: "162.159.195.5", label: "162.159.195.5", hint: "узел · EU" },
  { value: "188.114.96.1", label: "188.114.96.1", hint: "узел · anycast" },
  { value: "188.114.97.1", label: "188.114.97.1", hint: "узел · anycast" },
  { value: "188.114.98.1", label: "188.114.98.1", hint: "узел · anycast" },
  { value: "188.114.99.1", label: "188.114.99.1", hint: "узел · anycast" },
] as const;

export const DNS_PRESETS = [
  {
    id: "standard",
    label: "1.1.1.1",
    hint: "стандартный",
    dns: ["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"],
  },
  {
    id: "family",
    label: "1.1.1.2",
    hint: "защита от вредоносных сайтов",
    dns: ["1.1.1.2", "1.0.0.2", "2606:4700:4700::1112", "2606:4700:4700::1002"],
  },
  {
    id: "family18",
    label: "1.1.1.3",
    hint: "семейный фильтр",
    dns: ["1.1.1.3", "1.0.0.3", "2606:4700:4700::1113", "2606:4700:4700::1003"],
  },
  {
    id: "quad9",
    label: "Quad9",
    hint: "блокировка вредоносных доменов",
    dns: ["9.9.9.9", "149.112.112.112", "2620:fe::fe", "2620:fe::9"],
  },
  {
    id: "malw",
    label: "Malware",
    hint: "AdGuard — антивирусная фильтрация",
    dns: ["94.140.14.14", "94.140.15.15", "2a10:50c0::ad1:ff", "2a10:50c0::ad2:ff"],
  },
  {
    id: "xbox",
    label: "Xbox",
    hint: "Microsoft — игровой",
    dns: ["4.2.2.1", "4.2.2.2", "8.8.8.8"],
  },
  {
    id: "astracat",
    label: "AstraCAT",
    hint: "российский DNS",
    dns: ["77.221.128.134", "77.221.128.135"],
  },
  {
    id: "mafioznik",
    label: "Mafioznik",
    hint: "dns.mafioznik.xyz",
    dns: ["185.250.151.125", "178.217.188.124"],
  },
  {
    id: "geohide",
    label: "GeoHide",
    hint: "обход geo-блокировок",
    dns: ["188.246.246.1", "79.137.10.115"],
  },
  { id: "none", label: "Без DNS", hint: "не прописывать", dns: [] as string[] },
] as const;

export const MTU_OPTIONS = [1280, 1340, 1380, 1420];

export const resolveEndpoint = (
  choice: string,
  port: number,
  apiHost?: string,
): string => {
  if (choice === "auto") {
    const raw = apiHost || "engage.cloudflareclient.com:2408";
    const host = raw.startsWith("[")
      ? raw.slice(0, raw.indexOf("]") + 1)
      : raw.split(":")[0];
    return `${host}:${port}`;
  }
  return `${choice}:${port}`;
};
