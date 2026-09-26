import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, ShieldAlert, Trash2, Clock, Eye, Sparkles, Globe, Coffee, ExternalLink, ChevronDown } from 'lucide-react';
import { CaptureRules, DEFAULT_CAPTURE_RULES } from '../types';
import { getCaptureRules, saveCaptureRules } from '../storage/rules';
import { clearAllPosts } from '../storage/db';
import { useI18n, SUPPORTED_LANGUAGES, Language } from '../i18n';
import { BUY_ME_A_COFFEE_URL } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryCleared?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onHistoryCleared }) => {
  const { lang, setLang, t } = useI18n();
  const [rules, setRules] = useState<CaptureRules>(DEFAULT_CAPTURE_RULES);
  const [savedToast, setSavedToast] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCaptureRules().then((loaded) => {
        setRules(loaded);
      });
      setConfirmClear(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerSavedToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleUpdate = async (patch: Partial<CaptureRules>) => {
    const updated = await saveCaptureRules(patch);
    setRules(updated);
    triggerSavedToast();
  };

  const handleDwellChange = (seconds: number) => {
    handleUpdate({ dwellTimeMs: Math.round(seconds * 1000) });
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang !== lang) {
      await setLang(newLang);
      triggerSavedToast();
    }
  };

  const handleClearHistory = async () => {
    await clearAllPosts();
    setConfirmClear(false);
    onHistoryCleared?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-lg bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2f3336] pb-4">
          <div className="flex items-center gap-2 text-white">
            <Sliders className="w-5 h-5 text-[#1d9bf0]" />
            <h3 className="font-bold text-lg">{t('settings.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#71767b] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved feedback toast */}
        {savedToast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('settings.savedToast')}</span>
          </div>
        )}

        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 0: Language */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="language-select" className="text-sm font-semibold text-[#e7e9ea] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1d9bf0]" />
                {t('settings.language')}
              </label>
              <span className="text-xs text-[#71767b]">
                {SUPPORTED_LANGUAGES.find((item) => item.code === lang)?.nativeName}
              </span>
            </div>
            <div className="relative">
              <select
                id="language-select"
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full appearance-none bg-[#000000]/40 border border-[#2f3336] hover:border-[#536471] focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[#e7e9ea] font-medium transition-colors cursor-pointer outline-none shadow-sm"
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-[#16181c] text-[#e7e9ea] py-1.5">
                    {item.flag} {item.nativeName} ({item.name})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#71767b]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Section 1: Capture Mode */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-[#e7e9ea] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#1d9bf0]" />
              {t('settings.captureMode')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleUpdate({ captureMode: 'all_qualifying' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rules.captureMode === 'all_qualifying'
                    ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-white'
                    : 'border-[#2f3336] bg-[#000000]/40 text-[#71767b] hover:border-[#536471]'
                }`}
              >
                <div className="font-semibold text-sm text-[#e7e9ea]">{t('settings.allQualifying')}</div>
                <div className="text-xs text-[#71767b] mt-1">
                  {t('settings.allQualifyingDesc')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ captureMode: 'engaged_only' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rules.captureMode === 'engaged_only'
                    ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-white'
                    : 'border-[#2f3336] bg-[#000000]/40 text-[#71767b] hover:border-[#536471]'
                }`}
              >
                <div className="font-semibold text-sm text-[#e7e9ea]">{t('settings.engagedOnly')}</div>
                <div className="text-xs text-[#71767b] mt-1">
                  {t('settings.engagedOnlyDesc')}
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Dwell Time Threshold */}
          {rules.captureMode === 'all_qualifying' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#e7e9ea] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1d9bf0]" />
                  {t('settings.dwellTitle')}
                </label>
                <span className="text-xs font-mono font-bold text-[#1d9bf0] bg-[#1d9bf0]/10 px-2 py-0.5 rounded">
                  {t('settings.dwellUnit', { count: rules.dwellTimeMs / 1000 })}
                </span>
              </div>
              <p className="text-xs text-[#71767b]">
                {t('settings.dwellDesc')}
              </p>
              <div className="flex items-center gap-2">
                {[1.0, 1.5, 2.0, 3.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleDwellChange(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      rules.dwellTimeMs === s * 1000
                        ? 'border-[#1d9bf0] bg-[#1d9bf0] text-white'
                        : 'border-[#2f3336] bg-[#000000]/40 text-[#71767b] hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Promoted Tweets */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#000000]/40 border border-[#2f3336]">
            <div>
              <div className="text-sm font-semibold text-[#e7e9ea] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t('settings.filterPromoted')}
              </div>
              <div className="text-xs text-[#71767b] mt-0.5">
                {t('settings.filterPromotedDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={rules.filterPromoted}
              onChange={(e) => handleUpdate({ filterPromoted: e.target.checked })}
              className="w-4 h-4 accent-[#1d9bf0] rounded cursor-pointer"
            />
          </div>

          {/* Section 4: Retention Policy */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-[#e7e9ea]">
              {t('settings.retentionTitle')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: t('settings.retentionForever'), value: 0 },
                { label: t('settings.retentionDays', { days: 30 }), value: 30 },
                { label: t('settings.retentionDays', { days: 90 }), value: 90 },
                { label: t('settings.retentionDays', { days: 180 }), value: 180 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleUpdate({ retentionDays: opt.value })}
                  className={`py-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                    rules.retentionDays === opt.value
                      ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]'
                      : 'border-[#2f3336] bg-[#000000]/40 text-[#71767b] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Sponsor / Buy Me a Coffee */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400 shrink-0 mt-0.5 shadow-sm">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{t('sponsor.title')}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                    Open Source
                  </span>
                </div>
                <p className="text-xs text-[#71767b] leading-relaxed">
                  {t('sponsor.desc')}
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-end">
              <a
                href={BUY_ME_A_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFDD00] hover:bg-[#FFC800] text-black text-xs font-bold transition-all shadow-md active:scale-95 group cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                <span>{t('sponsor.button')}</span>
                <ExternalLink className="w-3 h-3 text-black/60" />
              </a>
            </div>
          </div>

          {/* Section 6: Clear Data Danger Zone */}
          <div className="pt-2 border-t border-[#2f3336]">
            {confirmClear ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {t('settings.confirmClearPrompt')}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[#202327] text-[#71767b] hover:text-white"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 rounded-lg text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
                  >
                    {t('settings.confirmClearBtn')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('settings.clearHistoryBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#71767b] text-center">
          {t('settings.footerDisclaimer')}
        </div>
      </div>
    </div>
  );
};
