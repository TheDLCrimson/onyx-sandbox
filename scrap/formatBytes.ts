/**
 * formatBytes — tiny utility for turning raw byte counts into readable strings.
 *
 * Usage:
 *   formatBytes(1024)                  // "1.00 KiB"  (IEC, base-2 by default)
 *   formatBytes(1000, { si: true })    // "1.00 KB"   (SI, base-10)
 *   formatBytes(1536, { decimals: 1 }) // "1.5 KiB"
 */

interface FormatBytesOptions {
  /** Use SI (base-10) units — KB, MB, GB … instead of KiB, MiB, GiB … */
  si?: boolean;
  /** Number of decimal places. Defaults to 2. */
  decimals?: number;
}

export function formatBytes(
  bytes: number,
  { si = false, decimals = 2 }: FormatBytesOptions = {}
): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`bytes must be a finite non-negative number, got ${bytes}`);
  }

  const base = si ? 1000 : 1024;
  const units = si
    ? ["B", "KB", "MB", "GB", "TB", "PB", "EB"]
    : ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

  if (bytes < base) {
    return `${bytes} B`;
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );

  const value = bytes / Math.pow(base, exponent);
  return `${value.toFixed(decimals)} ${units[exponent]}`;
}

// ─── Demo ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const samples = [0, 512, 1023, 1024, 1536, 1_000_000, 1_048_576, 1_500_000_000, 2 ** 40];

  console.log("── IEC (base-2, default) ──────────────────");
  for (const n of samples) {
    console.log(`  ${String(n).padStart(15)} B  →  ${formatBytes(n)}`);
  }

  console.log("\n── SI  (base-10)  ─────────────────────────");
  for (const n of samples) {
    console.log(`  ${String(n).padStart(15)} B  →  ${formatBytes(n, { si: true })}`);
  }

  console.log("\n── Custom decimals (1) ─────────────────────");
  for (const n of samples) {
    console.log(`  ${String(n).padStart(15)} B  →  ${formatBytes(n, { decimals: 1 })}`);
  }
}
