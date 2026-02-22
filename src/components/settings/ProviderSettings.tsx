import { useState, useEffect, useCallback } from 'react';
import { useProvider } from '../../hooks/useProvider.ts';
import { PROVIDER_PRESETS } from '../../providers.ts';
import type { ProviderFormat, ProviderPreset } from '../../types/index.ts';

export function ProviderSettings() {
  const {
    providerConfig,
    customProviders,
    showCustomModel,
    getProvider,
    isCustomProvider,
    switchProvider,
    updateProviderConfig,
    fetchAndCacheModels,
    getAvailableModels,
    setShowCustomModel,
  } = useProvider();

  const [showKey, setShowKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const currentProvider = getProvider(providerConfig.providerId) as ProviderPreset;
  const isBuiltIn = !!PROVIDER_PRESETS[providerConfig.providerId];

  useEffect(() => {
    const models = getAvailableModels(providerConfig.providerId);
    setAvailableModels(models);
  }, [providerConfig.providerId, getAvailableModels]);

  useEffect(() => {
    // Fetch models if supported and has API key
    if (currentProvider?.supportsModelFetch && providerConfig.apiKey) {
      fetchAndCacheModels(providerConfig.providerId);
    }
  }, [providerConfig.providerId, providerConfig.apiKey, currentProvider?.supportsModelFetch, fetchAndCacheModels]);

  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    switchProvider(e.target.value);
  }, [switchProvider]);

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateProviderConfig({ apiKey: e.target.value });
    // Clear cache to force re-fetch
    if (currentProvider?.supportsModelFetch) {
      fetchAndCacheModels(providerConfig.providerId);
    }
  }, [updateProviderConfig, currentProvider?.supportsModelFetch, providerConfig.providerId, fetchAndCacheModels]);

  return (
    <section className="flex flex-col gap-3 py-3 border-b border-border last:border-0">
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Active Provider</h3>
        <p className="text-xs text-muted-foreground leading-none">Choose and configure your AI model</p>
      </div>

      <div className="flex flex-col gap-3">
        <select
          className="w-full h-9 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all text-foreground cursor-pointer"
          value={providerConfig.providerId}
          onChange={handleProviderChange}
        >
          {Object.entries(PROVIDER_PRESETS)
            .filter(([id]) => id !== 'custom')
            .map(([id, preset]) => (
              <option key={id} value={id}>{preset.name}</option>
            ))}
          {customProviders.length > 0 && (
            <>
              <option disabled>── Custom ──</option>
              {customProviders.map((cp) => (
                <option key={cp.id} value={cp.id}>{cp.name}</option>
              ))}
            </>
          )}
        </select>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 px-0.5">
            <label htmlFor="api-key" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">API Key</label>
            <div className="relative flex items-center group">
              <input
                type={showKey ? 'text' : 'password'}
                id="api-key"
                className="w-full h-8 px-2.5 pr-9 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                placeholder="sk-..."
                value={providerConfig.apiKey}
                onChange={handleApiKeyChange}
              />
              <button
                className="absolute right-1 w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title="Toggle visibility"
                onClick={() => setShowKey(!showKey)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {!isBuiltIn && (
            <div className="flex flex-col gap-1.5 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label htmlFor="api-url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Base URL</label>
              <input
                type="url"
                id="api-url"
                className="w-full h-8 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                placeholder="https://..."
                value={providerConfig.apiUrl}
                onChange={(e) => updateProviderConfig({ apiUrl: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 px-0.5">
              <label htmlFor="model-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Model</label>
              <div className="relative flex items-center group">
                {showCustomModel || availableModels.length === 0 ? (
                  <input
                    type="text"
                    id="model-custom"
                    className="w-full h-8 px-2.5 pr-8 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                    placeholder="Model name"
                    value={providerConfig.model}
                    onChange={(e) => updateProviderConfig({ model: e.target.value })}
                  />
                ) : (
                  <select
                    id="model-select"
                    className="w-full h-8 px-2.5 pr-8 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all text-foreground appearance-none cursor-pointer"
                    value={providerConfig.model}
                    onChange={(e) => updateProviderConfig({ model: e.target.value })}
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
                <button
                  className="absolute right-1 w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  title="Custom model"
                  onClick={() => setShowCustomModel(!showCustomModel)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>
            </div>

            {isCustomProvider(providerConfig.providerId) && (
              <div className="flex flex-col gap-1.5 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label htmlFor="api-format" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Format</label>
                <select
                  id="api-format"
                  className="w-full h-8 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all text-foreground cursor-pointer"
                  value={providerConfig.format}
                  onChange={(e) => updateProviderConfig({ format: e.target.value as ProviderFormat })}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5 px-0.5">
              <label htmlFor="active-window" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Context Window</label>
              <input
                type="number"
                id="active-window"
                className="w-full h-8 px-2.5 text-sm bg-muted/40 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                placeholder={String(currentProvider?.contextWindow || 128000)}
                value={providerConfig.contextWindow || ''}
                onChange={(e) => updateProviderConfig({ contextWindow: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
