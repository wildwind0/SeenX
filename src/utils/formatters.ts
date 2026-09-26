import { getCurrentLanguage, getTranslation, Language } from '../i18n';

export function formatRelativeTime(timestamp: number, lang?: Language): string {
  if (!timestamp) return '';
  const currentLang = lang || getCurrentLanguage();
  const t = getTranslation(currentLang).relativeTime;
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return t.justNow;
  if (minutes < 60) return t.minutesAgo.replace('{n}', minutes.toString());
  if (hours < 24) return t.hoursAgo.replace('{n}', hours.toString());
  if (days === 1) return t.yesterday;
  if (days < 7) return t.daysAgo.replace('{n}', days.toString());
  if (days < 30) return t.weeksAgo.replace('{n}', Math.floor(days / 7).toString());

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  if (year === currentYear) {
    return `${month}-${day}`;
  }
  return `${year}-${month}-${day}`;
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatMetricNumber(num?: number): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toString();
  if (num < 10000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000) return Math.round(num / 1000) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}

export function formatDuration(ms?: number): string {
  if (!ms) return '';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
