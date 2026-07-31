import type { DeviceType, DeviceProfile, DNSConfig } from '@/types';

export const DEVICE_PROFILES: Record<DeviceType, DeviceProfile> = {
  phone: { jc: 4, jmin: 40, jmax: 70 },
  awg15: { jc: 4, jmin: 40, jmax: 70 },
};

export const DNS: DNSConfig = {
  primary: ['1.1.1.1', '2606:4700:4700::1111'],
  secondary: ['1.0.0.1', '2606:4700:4700::1001'],
};

export const MTU = 1280;
export const WARP_PUBLIC_KEY = 'bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=';

export const I1_MASKS: string[] = [
  "I1 = **0100000001d724363863636b588c879467155b8a3b8f9d2c8f65c0f8e2c1a9b70675843d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0 ** **0000000000000000000000000000000000000000000000000000000000000000 **",
  "I1 =** 0100000001d724363863636b588c879467155b8a3b8f9d2c8f65c0f8e2c1a9b70675843d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0 ** 0000000000000000000000000000000000000000000000000000000000000000 **",
];

export function pickI1(): string {
  return I1_MASKS[Math.floor(Math.random() * I1_MASKS.length)];
}

export function formatDNS(): string {
  return [...DNS.primary, ...DNS.secondary].join(', ');
}

export function parseEndpoint(ep: string): { server: string; port: number } {
  const [server, portStr] = ep.split(':');
  return { server, port: parseInt(portStr || '4500', 10) };
}
