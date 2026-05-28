export function formatRelativeDate(value) {
  const normalizedValue =
    typeof value === "string" && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value}Z`
      : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((startOfToday - startOfDate) / 86400000);
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Сегодня, ${time}`;
  if (diffDays === 1) return `Вчера, ${time}`;
  if (diffDays < 7) return `${diffDays} дня назад`;
  if (diffDays < 14) return "Неделю назад";
  if (diffDays < 31) return `${Math.floor(diffDays / 7)} недели назад`;
  if (diffDays < 62) return "Месяц назад";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяца назад`;
  if (diffDays < 730) return "Год назад";
  return `${Math.floor(diffDays / 365)} года назад`;
}
