import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileText, Database, CheckCircle2, AlertCircle, Coffee } from 'lucide-react';
import { Post } from '../types';
import { exportToJson, exportToMarkdown, readJsonFile } from '../utils/export';
import { batchImportPosts } from '../storage/db';
import { useI18n } from '../i18n';
import { BUY_ME_A_COFFEE_URL } from '../constants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onImportSuccess?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  posts,
  onImportSuccess,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    exportToJson(posts);
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(posts);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(t('export.importing'));
    setImportError(null);

    try {
      const importedPosts = await readJsonFile(file);
      const count = await batchImportPosts(importedPosts);
      setImportStatus(t('export.importSuccess', { count }));
      onImportSuccess?.();
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportError(err?.message || t('export.importError'));
      setImportStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2f3336] pb-3">
          <h3 className="font-bold text-lg text-white">{t('export.title')}</h3>
          <button onClick={onClose} className="p-1 text-[#71767b] hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* JSON Export */}
          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#2f3336] bg-[#000000]/40 hover:border-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#1d9bf0]" />
              <div>
                <div className="font-semibold text-sm text-[#e7e9ea] group-hover:text-[#1d9bf0]">
                  {t('export.jsonTitle')}
                </div>
                <div className="text-xs text-[#71767b]">
                  {t('export.jsonDesc', { count: posts.length })}
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#71767b] group-hover:text-[#1d9bf0]" />
          </button>

          {/* Markdown Export */}
          <button
            onClick={handleExportMarkdown}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#2f3336] bg-[#000000]/40 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-sm text-[#e7e9ea] group-hover:text-purple-400">
                  {t('export.mdTitle')}
                </div>
                <div className="text-xs text-[#71767b]">
                  {t('export.mdDesc')}
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#71767b] group-hover:text-purple-400" />
          </button>

          {/* Import JSON */}
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#2f3336] hover:border-[#536471] text-[#71767b] hover:text-[#e7e9ea] transition-colors text-xs font-medium"
            >
              <Upload className="w-4 h-4" />
              {t('export.importJson')}
            </button>
          </div>
        </div>

        {/* Sponsor Callout */}
        <div className="pt-3 border-t border-[#2f3336]/60 text-center">
          <p className="text-xs text-[#71767b] flex items-center justify-center gap-1.5">
            <span>{t('sponsor.exportFooterPrefix')}</span>
            <a
              href={BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5 inline" />
              <span>{t('sponsor.exportFooterLink')}</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
