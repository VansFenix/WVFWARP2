'use client';

import { useGenerator } from '@/hooks/use-generator';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { ConfigSelectors } from '@/components/generator/config-selectors';
import { AdvancedSettings } from '@/components/generator/advanced-settings';
import { ServicePicker } from '@/components/generator/service-picker';
import { ResultPanel } from '@/components/generator/result-panel';
import { FormatsTab } from '@/components/generator/formats-tab';
import { AboutTab } from '@/components/generator/about-tab';
import type { ServiceEntry } from '@/types';
import { isCommunityDns } from '@/config/dns';
import { useMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface HomeClientProps {
  services: ServiceEntry[];
}

export function HomeClient({ services }: HomeClientProps) {
  const {
    state, set, toggleService, setEndpoint, setDnsId, setSiteMode,
    handleGenerate, reset, copyConfig, downloadConfig,
  } = useGenerator();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('generator');

  const gen = {
    state,
    set,
    setEndpoint,
    setDnsId,
    setSiteMode,
    toggleService,
    handleGenerate,
    reset,
    copyConfig,
    downloadConfig,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#6366f1]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex gap-4">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'generator' && (
              <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)]">
                <h1 className="text-[16px] font-semibold text-[var(--text)] mb-4">
                  Настройки конфигурации
                </h1>

                <ConfigSelectors
                  configFormat={state.configFormat}
                  deviceType={state.deviceType}
                  siteMode={state.siteMode}
                  endpointId={state.endpointId}
                  customEndpoint={state.customEndpoint}
                  dnsId={state.dnsId}
                  communityDns={isCommunityDns(state.dnsId)}
                  excludeLan={state.excludeLan}
                  onFormatChange={(v) => gen.set('configFormat', v)}
                  onDeviceChange={(v) => gen.set('deviceType', v)}
                  onSiteModeChange={gen.setSiteMode}
                  onEndpointChange={gen.setEndpoint}
                  onCustomEndpointChange={(v) => gen.set('customEndpoint', v)}
                  onDnsChange={gen.setDnsId}
                  onExcludeLanChange={(v) => gen.set('excludeLan', v)}
                />

                {state.siteMode === 'specific' && !isCommunityDns(state.dnsId) && (
                  <>
                    <p className="text-[12px] text-[var(--text-dim)] mb-2 font-light">
                      Выберите сервисы для маршрутизации через WARP
                    </p>
                    <ServicePicker
                      services={services}
                      selected={state.selectedServices}
                      onToggle={gen.toggleService}
                    />
                  </>
                )}

                <AdvancedSettings
                  ipv6={state.ipv6}
                  onIpv6Change={(v) => gen.set('ipv6', v)}
                  keepaliveEnabled={state.keepaliveEnabled}
                  onKeepaliveEnabledChange={(v) => gen.set('keepaliveEnabled', v)}
                  keepaliveValue={state.keepaliveValue}
                  onKeepaliveValueChange={(v) => gen.set('keepaliveValue', v)}
                  customI1Enabled={state.customI1Enabled}
                  onCustomI1EnabledChange={(v) => gen.set('customI1Enabled', v)}
                  customI1Domain={state.customI1Domain}
                  onCustomI1DomainChange={(v) => gen.set('customI1Domain', v)}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => { gen.reset(); gen.handleGenerate(); }}
                    disabled={state.isLoading}
                    className={`flex-1 h-11 rounded-[var(--radius-md)] text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${
                      state.isLoading
                        ? 'bg-[var(--surface-3)] text-[var(--text-dim)] cursor-wait'
                        : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-fg)] hover:opacity-90 shadow-lg shadow-[var(--accent-soft)]'
                    }`}
                  >
                    {state.isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                        </svg>
                        Генерация...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Сгенерировать конфиг
                      </>
                    )}
                  </button>
                </div>

                {!state.isGenerated ? (
                  <div className="mt-4 text-center py-8 text-[13px] text-[var(--text-dim)]">
                    Нажмите кнопку выше для генерации конфигурации
                  </div>
                ) : (
                  <div className="mt-4 animate-in">
                    <ResultPanel
                      result={state.result!}
                      onDownload={gen.downloadConfig}
                      onCopy={gen.copyConfig}
                    />
                  </div>
                )}

                {state.error && (
                  <div className="mt-4 px-4 py-3 bg-[var(--error-soft)] border border-[var(--error)]/20 rounded-[var(--radius-md)] text-[var(--error)] text-[13px]">
                    {state.error}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'formats' && <FormatsTab />}
            {activeTab === 'about' && <AboutTab />}
          </main>

          {/* Sidebar (desktop only) */}
          {!isMobile && (
            <div className="w-[240px] shrink-0">
              <Sidebar />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
