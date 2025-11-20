export function trim(str: string, char: string): string {
  if (char.length !== 1) {
    throw new Error('')
  }
  // Fast pointer-based trim of a single character from both ends.
  // Avoids regex and allocations; uses code-point comparison for speed.
  if (str == null || str.length === 0) return str;
  if (!char) return str;

  const c = char.charCodeAt(0);
  let start = 0;
  let end = str.length - 1;
  while (start <= end && str.charCodeAt(start) === c) start++;
  while (end >= start && str.charCodeAt(end) === c) end--;
  return str.slice(start, end + 1);
}
