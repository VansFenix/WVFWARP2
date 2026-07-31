'use client';

import { useState } from 'react';
import type { GenerateResult } from '@/types';
import { getFormatInfo, supportsQR } from '@/config/formats';
import { FaCheck } from 'react-icons/fa';

interface ResultPanelProps {
  result: GenerateResult;
  onDownload: () => void;
  onCopy: () => Promise<boolean>;
}

export function ResultPanel({ result, onDownload, onCopy }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const info = getFormatInfo(result.configFormat);
  const hasQR = supportsQR(result.configFormat);

  const handleCopy = async () => {
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)]">
      {/* Success header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
          <FaCheck className="text-[var(--accent)] text-[14px]" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-[var(--text)]">
            Конфигурация {info.name} готова!
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            Файл: {result.fileName}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onDownload}
          className="flex-1 h-10 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-[var(--radius-md)] text-[13px] font-semibold text-[var(--accent-fg)] flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg shadow-[var(--accent-soft)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Скачать конфиг
        </button>
        <button
          onClick={handleCopy}
          className={`flex-1 h-10 rounded-[var(--radius-md)] text-[13px] flex items-center justify-center gap-2 transition-all border ${
            copied
              ? 'bg-[var(--success-soft)] border-[var(--success)]/30 text-[var(--success)]'
              : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:border-[var(--border-hover)]'
          }`}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Скопировано
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Скопировать
            </>
          )}
        </button>
        {hasQR && (
          <button
            onClick={() => setShowQR(!showQR)}
            className="h-10 px-4 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-muted)] flex items-center justify-center gap-2 transition-all border border-[var(--border)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="14" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="14" y="14" width="4" height="4" rx="0.5" fill="currentColor" />
              <rect x="20" y="18" width="2" height="4" rx="0.5" fill="currentColor" />
              <rect x="14" y="20" width="4" height="2" rx="0.5" fill="currentColor" />
            </svg>
            QR
          </button>
        )}
      </div>

      {/* QR code */}
      {showQR && result.qrCodeBase64 && (
        <div className="mt-3 flex justify-center p-4 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <img src={result.qrCodeBase64} alt="QR Code" width={200} height={200} className="rounded" />
        </div>
      )}
    </div>
  );
}
