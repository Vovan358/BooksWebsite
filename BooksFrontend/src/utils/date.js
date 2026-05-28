export function formatRelativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday - startOfDate) / 86400000);

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дня назад`;
  if (diffDays < 14) return "Неделю назад";
  if (diffDays < 31) return `${Math.floor(diffDays / 7)} недели назад`;
  if (diffDays < 62) return "Месяц назад";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяца назад`;
  if (diffDays < 730) return "Год назад";
  return `${Math.floor(diffDays / 365)} года назад`;
}
