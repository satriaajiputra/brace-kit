import { useMemo } from 'react';
import { useStore } from '../store';
import { GEMINI_NO_TOOLS_MODELS, GEMINI_SEARCH_ONLY_MODELS, XAI_IMAGE_MODELS } from '../providers';

/**
 * Hook to check if the current model supports image generation.
 * Returns true for Gemini image models and xAI image models.
 */
export function useImageGenerationCheck() {
  const currentModel = useStore((state) => state.providerConfig.model || '');
  const currentProviderId = useStore((state) => state.providerConfig.providerId || '');

  const isImageGenerationModel = useMemo(
    () =>
      GEMINI_NO_TOOLS_MODELS.includes(currentModel) ||
      GEMINI_SEARCH_ONLY_MODELS.includes(currentModel) ||
      (currentProviderId === 'xai' && XAI_IMAGE_MODELS.includes(currentModel)),
    [currentModel, currentProviderId]
  );

  return isImageGenerationModel;
}
