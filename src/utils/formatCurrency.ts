/**
 * Currency Formatting Utility
 * Formats numbers as USD currency with proper comma separation
 */

/**
 * Format a number as USD currency
 * @param value - The value in cents or dollars
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: {
    cents?: boolean;
    showCents?: boolean;
    locale?: string;
    currency?: string;
  } = {}
): string {
  const {
    cents = true, // Input is in cents by default
    showCents = false, // Don't show cents in output by default
    locale = 'en-US',
    currency = 'USD',
  } = options;

  // Handle edge cases
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  // Convert from cents to dollars if needed
  const dollarValue = cents ? value / 100 : value;

  // Handle negative values
  const isNegative = dollarValue < 0;
  const absoluteValue = Math.abs(dollarValue);

  // Handle very large numbers (>10M)
  if (absoluteValue >= 10000000) {
    const millions = absoluteValue / 1000000;
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(millions);

    return `${isNegative ? '-' : ''}${formatted.replace(/[0-9.]+/, millions.toFixed(1))}M`;
  }

  // Standard formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  return formatter.format(dollarValue);
}

/**
 * Parse a formatted currency string back to a number
 * @param value - The formatted currency string
 * @param returnCents - Whether to return the value in cents
 * @returns The numeric value
 */
export function parseCurrency(value: string, returnCents = true): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbols and whitespace
  let cleaned = value.replace(/[$,\s]/g, '');

  // Handle millions notation
  const isMillions = cleaned.includes('M');
  if (isMillions) {
    cleaned = cleaned.replace('M', '');
    const millions = parseFloat(cleaned) * 1000000;
    return returnCents ? millions * 100 : millions;
  }

  // Parse the number
  const parsed = parseFloat(cleaned) || 0;

  // Return in cents or dollars
  return returnCents ? Math.round(parsed * 100) : parsed;
}

/**
 * Format a number as a compact currency for display in tight spaces
 * @param value - The value in cents
 * @returns Compact formatted string
 */
export function formatCompactCurrency(value: number): string {
  const dollars = value / 100;
  const absValue = Math.abs(dollars);

  if (absValue >= 1000000000) {
    return `$${(dollars / 1000000000).toFixed(1)}B`;
  } else if (absValue >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `$${(dollars / 1000).toFixed(0)}K`;
  }

  return formatCurrency(value, { showCents: false });
}
