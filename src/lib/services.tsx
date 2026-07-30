import type { ReactNode, SVGProps } from "react";

export interface Service {
  id: string;
  name: string;
  tag: string;
  color: string;
  cidrs: string[];
}

/* Минималистичные фирменные глифы, нарисованные вручную */

const G =
  (d: string, extra: Partial<SVGProps<SVGSVGElement>> = {}) =>
  (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...extra}
      {...props}
    >
      <path d={d} />
    </svg>
  );

export const SERVICE_GLYPHS: Record<
  string,
  (props: SVGProps<SVGSVGElement>) => ReactNode
> = {
  discord: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 5.5C5 6.2 3.8 8 3.6 12.2c-.1 2.6.5 5 1.2 6.1 1 .7 2.6 1 4.2 1l.8-1.4c-1-.3-1.9-.8-2.5-1.4" />
      <path d="M17 5.5c2 .7 3.2 2.5 3.4 6.7.1 2.6-.5 5-1.2 6.1-1 .7-2.6 1-4.2 1l-.8-1.4c1-.3 1.9-.8 2.5-1.4" />
      <circle cx="9.2" cy="12.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="4" />
      <path d="M10.2 9.3v5.4l4.9-2.7z" fill="currentColor" stroke="none" />
    </svg>
  ),
  instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  x: G("M4.5 4.5l15 15M19.5 4.5l-15 15"),
  tiktok: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.5 4v10.8a4 4 0 1 1-3.4-3.95" />
      <path d="M14.5 5.5c.6 2.3 2.3 4 4.9 4.2" />
    </svg>
  ),
  twitch: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4.5 4h15v10l-4 4h-4l-2.5 2.5H7V18H4.5z" />
      <path d="M10 8v4M14.5 8v4" />
    </svg>
  ),
  spotify: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 10.2c2.8-.8 5.6-.5 8 1M8.4 13.2c2.2-.6 4.4-.3 6.4.9M8.8 16c1.7-.4 3.4-.2 5 .7" />
    </svg>
  ),
  netflix: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 4v16M17 4v16M7 4l10 16" />
    </svg>
  ),
  reddit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="14" r="6" />
      <circle cx="9.6" cy="13.3" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="13.3" r="1" fill="currentColor" stroke="none" />
      <path d="M9.8 16.3c1.4.9 3 .9 4.4 0M12 8l1.6-3.8L17 5" />
      <circle cx="17.6" cy="5" r="1.2" />
    </svg>
  ),
  whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.1A8 8 0 1 0 12 4z" />
      <path d="M9.5 8.8c.6-.4 1.1 1.3 1.7 2.1.5.7 1.7 1.5 2.4 1.8.8.4 1 .9.7 1.5-.4.8-1.2 1.3-2.1 1-2.2-.7-4.4-2.8-5-5-.2-.9.4-1.6 1.1-2 .4-.2.9 0 1.2.6z" />
    </svg>
  ),
  telegram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 5L4 11.6l4.7 1.8L10 18.5l2.9-3.1 4.3 3.1z" />
    </svg>
  ),
  roblox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4.5" y="7.5" width="14" height="14" rx="1.6" transform="rotate(-14 11.5 14.5)" />
      <rect x="9.7" y="11.6" width="4.4" height="4.4" rx="0.8" transform="rotate(-14 11.9 13.8)" />
    </svg>
  ),
};

export const SERVICES: Service[] = [
  {
    id: "discord",
    name: "Discord",
    tag: "голос · чаты",
    color: "#5865F2",
    cidrs: ["162.159.128.0/19", "66.22.192.0/18"],
  },
  {
    id: "youtube",
    name: "YouTube",
    tag: "видео",
    color: "#FF0033",
    cidrs: [
      "8.8.4.0/24", "8.8.8.0/24", "64.233.160.0/19", "66.102.0.0/20",
      "66.249.80.0/20", "72.14.192.0/18", "74.125.0.0/16", "108.177.0.0/17",
      "142.250.0.0/15", "172.217.0.0/16", "172.253.0.0/16", "173.194.0.0/16",
      "209.85.128.0/17", "216.58.192.0/19", "216.239.32.0/19",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    tag: "фото · рилсы",
    color: "#E1306C",
    cidrs: [
      "31.13.24.0/21", "31.13.64.0/18", "45.64.40.0/22", "57.144.0.0/16",
      "66.220.144.0/20", "69.63.176.0/20", "69.171.224.0/19", "74.119.76.0/22",
      "102.132.96.0/20", "103.4.96.0/22", "129.134.0.0/16", "157.240.0.0/16",
      "163.70.128.0/17", "173.252.64.0/18", "179.60.192.0/22", "185.60.216.0/22",
      "204.15.20.0/22",
    ],
  },
  {
    id: "x",
    name: "X / Twitter",
    tag: "микроблог",
    color: "#e7e9ea",
    cidrs: [
      "69.195.160.0/19", "103.252.112.0/22", "104.244.40.0/21",
      "188.64.224.0/21", "192.133.76.0/22", "199.16.156.0/22",
      "199.59.148.0/22", "199.96.56.0/21", "202.160.128.0/22",
      "209.237.192.0/19",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    tag: "клипы",
    color: "#25F4EE",
    cidrs: [
      "71.18.236.0/22", "82.102.92.0/22", "95.161.64.0/20",
      "103.72.79.0/24", "103.136.220.0/22", "139.177.224.0/19",
      "147.160.160.0/19", "185.115.116.0/22",
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    tag: "стримы",
    color: "#9146FF",
    cidrs: [
      "103.53.48.0/22", "185.42.204.0/22", "192.108.237.0/24",
      "192.108.238.0/24", "192.108.239.0/24", "52.223.192.0/18",
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    tag: "музыка",
    color: "#1DB954",
    cidrs: ["35.186.224.0/24", "78.31.8.0/21", "193.182.8.0/21", "194.68.28.0/22"],
  },
  {
    id: "netflix",
    name: "Netflix",
    tag: "кино",
    color: "#E50914",
    cidrs: [
      "23.246.0.0/18", "37.77.184.0/21", "45.57.0.0/17", "64.120.128.0/17",
      "66.197.128.0/17", "108.175.32.0/20", "185.2.220.0/22",
      "185.9.188.0/22", "192.173.64.0/18", "198.38.96.0/19",
      "198.45.48.0/20", "208.75.76.0/22",
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    tag: "форумы",
    color: "#FF4500",
    cidrs: ["151.101.0.0/16", "199.232.0.0/16", "146.75.0.0/16"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    tag: "мессенджер",
    color: "#25D366",
    cidrs: [
      "31.13.64.0/19", "31.13.96.0/19", "57.144.0.0/16", "157.240.0.0/16",
      "163.70.128.0/17", "179.60.192.0/22", "185.60.216.0/22",
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    tag: "мессенджер",
    color: "#2AABEE",
    cidrs: [
      "91.108.4.0/22", "91.108.8.0/22", "91.108.12.0/22", "91.108.16.0/22",
      "91.108.56.0/22", "149.154.160.0/20", "185.76.151.0/24",
      "95.161.64.0/20",
    ],
  },
  {
    id: "roblox",
    name: "Roblox",
    tag: "игры",
    color: "#FF6B35",
    cidrs: ["128.116.0.0/17"],
  },
];

export const TOTAL_CIDRS = new Set(SERVICES.flatMap((s) => s.cidrs)).size;

export const collectCidrs = (ids: string[]): string[] => {
  const set = new Set<string>();
  ids.forEach((id) => {
    const s = SERVICES.find((x) => x.id === id);
    s?.cidrs.forEach((c) => set.add(c));
  });
  return Array.from(set);
};
