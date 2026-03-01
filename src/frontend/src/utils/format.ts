/**
 * Format paise to rupees display string
 */
export function formatRupees(paise: bigint | number): string {
  const amount = typeof paise === "bigint" ? Number(paise) : paise;
  return `₹${(amount / 100).toFixed(0)}`;
}

/**
 * Convert backend timestamp to milliseconds.
 * Backend returns nanoseconds (Int from Motoko Time.now()).
 * We detect if the value is in nanoseconds (>= 1e15) or seconds (< 1e12).
 */
function toMillis(ts: bigint | number): number {
  const n = typeof ts === "bigint" ? Number(ts) : ts;
  // Nanoseconds: typical value around 1.7e18 for year 2025
  // Seconds: typical value around 1.7e9
  // Threshold: if > 1e13 it's nanoseconds or milliseconds
  if (n > 1e15) {
    // nanoseconds → ms
    return n / 1_000_000;
  }
  if (n > 1e10) {
    // milliseconds already
    return n;
  }
  // seconds → ms
  return n * 1000;
}

/**
 * Format Unix timestamp (nanoseconds from Motoko) to readable date
 */
export function formatDate(ts: bigint | number): string {
  const ms = toMillis(ts);
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Format day name (Saturday etc.) from Motoko nanosecond timestamp
 */
export function formatDayDate(ts: bigint | number): string {
  const ms = toMillis(ts);
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Get status label
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    delivered: "Delivered",
    cancelled: "Cancelled",
    awaitingPayment: "Awaiting Payment",
    paid: "Paid",
  };
  return labels[status] ?? status;
}

/**
 * Get status color classes
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    delivered: "bg-emerald-100 text-emerald-900 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    awaitingPayment: "bg-orange-100 text-orange-800 border-orange-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    home: "🏠 Home",
    shop: "🏪 Shop",
    car: "🚗 Car",
  };
  return labels[category] ?? category;
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
