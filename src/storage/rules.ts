import { CaptureRules, DEFAULT_CAPTURE_RULES } from '../types';

const RULES_STORAGE_KEY = 'seenx_capture_rules';

export async function getCaptureRules(): Promise<CaptureRules> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(RULES_STORAGE_KEY);
      if (result && result[RULES_STORAGE_KEY]) {
        return {
          ...DEFAULT_CAPTURE_RULES,
          ...result[RULES_STORAGE_KEY],
        };
      }
    }
  } catch (error) {
    console.error('[SeenX] Failed to read capture rules:', error);
  }
  return DEFAULT_CAPTURE_RULES;
}

export async function saveCaptureRules(rules: Partial<CaptureRules>): Promise<CaptureRules> {
  const current = await getCaptureRules();
  const updated: CaptureRules = {
    ...current,
    ...rules,
  };

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [RULES_STORAGE_KEY]: updated });
    }
  } catch (error) {
    console.error('[SeenX] Failed to save capture rules:', error);
  }

  return updated;
}

export function onCaptureRulesChanged(callback: (newRules: CaptureRules) => void): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
    return () => {};
  }

  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'local' && changes[RULES_STORAGE_KEY]) {
      const newValue = changes[RULES_STORAGE_KEY].newValue;
      callback({
        ...DEFAULT_CAPTURE_RULES,
        ...newValue,
      });
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
