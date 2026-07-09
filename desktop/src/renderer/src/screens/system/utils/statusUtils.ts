export const parseStatusAndName = (
  name: string,
  description?: string | null,
): { status: string | null; cleanName: string } => {
  let status: string | null = null;
  let cleanName = name;

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/);
  if (nameMatch) {
    status = nameMatch[1].trim();
    cleanName = nameMatch[2].trim();
  } else if (description) {
    const descMatch = description.match(/^\[(.*?)\]/);
    if (descMatch) {
      status = descMatch[1].trim();
    }
  }

  return { status, cleanName };
};

export const getStatusBadgeClass = (status: string): string => {
  const lower = status.toLowerCase();
  if (
    lower.includes("bakım") ||
    lower.includes("güncel") ||
    lower.includes("geliş") ||
    lower.includes("maint")
  ) {
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }
  if (
    lower.includes("aktif") ||
    lower.includes("hazır") ||
    lower.includes("tamam") ||
    lower.includes("ready") ||
    lower.includes("active")
  ) {
    return "bg-green-500/20 text-green-300 border border-green-500/30";
  }
  return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
};

export const getStatusBadgeLightClass = (status: string): string => {
  const lower = status.toLowerCase();
  if (
    lower.includes("bakım") ||
    lower.includes("güncel") ||
    lower.includes("geliş") ||
    lower.includes("maint")
  ) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20";
  }
  if (
    lower.includes("aktif") ||
    lower.includes("hazır") ||
    lower.includes("tamam") ||
    lower.includes("ready") ||
    lower.includes("active")
  ) {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-500/20";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20";
};

export const normalizeForMatch = (str: string): string => {
  return str
    .toLocaleLowerCase("tr-TR")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
};
