export async function generateQR(text: string): Promise<string> {
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WVFWARP/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`QR API ${res.status}`);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return fallbackSVG();
  }
}

export function unsupportedQR(formatName: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#1c1c20"/><text x="100" y="105" text-anchor="middle" fill="#71717a" font-size="14">⚠ ${formatName} — QR не поддерживается</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function fallbackSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#1c1c20"/><text x="100" y="105" text-anchor="middle" fill="#71717a" font-size="14">QR код недоступен</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
