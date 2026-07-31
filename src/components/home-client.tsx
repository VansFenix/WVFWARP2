'use client';

import { useGenerator } from '@/hooks/use-generator';
import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';
import { ConfigSelectors } from '@/components/generator/config-selectors';
import { AdvancedSettings } from '@/components/generator/advanced-settings';
import { ServicePicker } from '@/components/generator/service-picker';
import { ResultPanel } from '@/components/generator/result-panel';
import { FormatsTab } from '@/components/generator/formats-tab';
import { AboutTab } from '@/components/generator/about-tab';
import type { ServiceEntry } from '@/types';
import { isCommunityDns } from '@/config/dns';
import { useState } from 'react';

interface HomeClientProps {
  services: ServiceEntry[];
}

export function HomeClient({ services }: HomeClientProps) {
  const {
    state, set, toggleService, setEndpoint, setDnsId, setSiteMode,
    handleGenerate, reset, copyConfig, downloadConfig,
  } = useGenerator();
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="site-shell min-h-screen flex flex-col">
      <div className="ambient-grid fixed inset-0 pointer-events-none" />
      <div className="ambient-orb ambient-orb-one fixed pointer-events-none" />
      <div className="ambient-orb ambient-orb-two fixed pointer-events-none" />

      <div className="relative z-10 flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} />

        <header className="hero-section py-10 sm:py-14 text-center">
          <div className="eyebrow inline-flex items-center gap-2 mb-5">
            <span className="status-dot" />
            Генератор нового поколения
          </div>
          <h1 className="hero-title mx-auto max-w-[760px]">
            Настрой свой WARP
            <span className="hero-title-accent"> без лишнего.</span>
          </h1>
          <p className="hero-copy mx-auto mt-5 max-w-[600px]">
            Быстро создавай защищённые конфигурации Cloudflare WARP под свои устройства,
            приложения и любимый формат подключения.
          </p>
          <div className="hero-stats mx-auto mt-8 grid max-w-[640px] grid-cols-3">
            <div className="hero-stat"><strong>7+</strong><span>форматов</span></div>
            <div className="hero-stat"><strong>100%</strong><span>бесплатно</span></div>
            <div className="hero-stat"><strong>0</strong><span>регистраций</span></div>
          </div>
        </header>

        <main>
          {activeTab === 'generator' && (
            <section className="generator-card overflow-hidden">
              <div className="generator-card-head flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="section-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Создание конфигурации</h2>
                    <p className="text-[11px] text-[var(--text-dim)] mt-0.5">Параметры подключения WARP</p>
                  </div>
                </div>
                <div className="live-pill"><span className="status-dot status-dot-small" /> API работает</div>
              </div>

              <div className="px-5 py-5 sm:px-7 sm:py-7">
                <div className="step-track mb-7">
                  <div className="step-item step-active"><span>01</span><b>Параметры</b></div>
                  <div className="step-line" />
                  <div className={`step-item ${state.siteMode === 'specific' ? 'step-active' : ''}`}><span>02</span><b>Маршрутизация</b></div>
                  <div className="step-line" />
                  <div className={`step-item ${state.isGenerated ? 'step-active' : ''}`}><span>03</span><b>Готово</b></div>
                </div>

                <div className="form-section-label"><span>Основные настройки</span><i /></div>
                <ConfigSelectors
                  configFormat={state.configFormat}
                  deviceType={state.deviceType}
                  siteMode={state.siteMode}
                  endpointId={state.endpointId}
                  customEndpoint={state.customEndpoint}
                  dnsId={state.dnsId}
                  communityDns={isCommunityDns(state.dnsId)}
                  excludeLan={state.excludeLan}
                  onFormatChange={(v) => set('configFormat', v)}
                  onDeviceChange={(v) => set('deviceType', v)}
                  onSiteModeChange={setSiteMode}
                  onEndpointChange={setEndpoint}
                  onCustomEndpointChange={(v) => set('customEndpoint', v)}
                  onDnsChange={setDnsId}
                  onExcludeLanChange={(v) => set('excludeLan', v)}
                />

                {state.siteMode === 'specific' && !isCommunityDns(state.dnsId) && (
                  <div className="route-section animate-in">
                    <div className="form-section-label"><span>Сайты через WARP</span><i /></div>
                    <p className="text-[12px] text-[var(--text-dim)] mb-3">
                      Выберите сервисы, трафик которых нужно направить через туннель.
                    </p>
                    <ServicePicker services={services} selected={state.selectedServices} onToggle={toggleService} />
                  </div>
                )}

                <div className="advanced-wrap">
                  <AdvancedSettings
                    ipv6={state.ipv6}
                    onIpv6Change={(v) => set('ipv6', v)}
                    keepaliveEnabled={state.keepaliveEnabled}
                    onKeepaliveEnabledChange={(v) => set('keepaliveEnabled', v)}
                    keepaliveValue={state.keepaliveValue}
                    onKeepaliveValueChange={(v) => set('keepaliveValue', v)}
                    customI1Enabled={state.customI1Enabled}
                    onCustomI1EnabledChange={(v) => set('customI1Enabled', v)}
                    customI1Domain={state.customI1Domain}
                    onCustomI1DomainChange={(v) => set('customI1Domain', v)}
                  />
                </div>

                <button
                  onClick={() => { reset(); handleGenerate(); }}
                  disabled={state.isLoading}
                  className={`generate-button ${state.isLoading ? 'generate-button-loading' : ''}`}
                >
                  {state.isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                      </svg>
                      Создаём конфигурацию...
                    </>
                  ) : (
                    <>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Сгенерировать конфиг
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>

                {!state.isGenerated ? (
                  <div className="empty-result mt-5">
                    <div className="empty-result-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v4M12 17v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M3 12h4M17 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div><b>Конфигурация появится здесь</b><span>Заполни параметры и запусти генерацию</span></div>
                  </div>
                ) : (
                  <div className="mt-5 animate-in">
                    <ResultPanel result={state.result!} onDownload={downloadConfig} onCopy={copyConfig} />
                  </div>
                )}

                {state.error && (
                  <div className="mt-4 px-4 py-3 bg-[var(--error-soft)] border border-[var(--error)]/20 rounded-[var(--radius-md)] text-[var(--error)] text-[13px]">
                    {state.error}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'formats' && <FormatsTab />}
          {activeTab === 'about' && <AboutTab />}
        </main>

        {activeTab === 'generator' && (
          <div className="feature-row mt-5 grid gap-3 sm:grid-cols-3">
            <div className="feature-card"><span className="feature-number">01</span><div><b>Создай</b><p>Выбери нужный формат</p></div></div>
            <div className="feature-card"><span className="feature-number">02</span><div><b>Настрой</b><p>Укажи сайты и DNS</p></div></div>
            <div className="feature-card"><span className="feature-number">03</span><div><b>Скачай</b><p>Готово за пару секунд</p></div></div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
