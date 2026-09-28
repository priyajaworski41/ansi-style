/**
 * Core SGR code tables and the low-level string builder.
 *
 * Kept separate from index.js so the code tables are importable without
 * triggering the module-level detection side-effect in index.js.
 */

/**
 * SGR (Select Graphic Rendition) parameter codes.
 *
 * Each entry is a single-element array so it can be composed with colour
 * codes by simple concatenation. We use arrays rather than pre-formatted
 * strings so that a future `compose` helper could merge codes without
 * re-parsing.
 *
 * @enum {number[]}
 */
export const STYLES = Object.freeze({
  reset: [0],
  bold: [1],
  dim: [2],
  italic: [3],
  underline: [4],
  blink: [5],
  inverse: [7],
  hidden: [8],
  strikethrough: [9],
});

/**
 * Standard foreground colour codes (30–37).
 */
export const FOREGROUND = Object.freeze({
  black: [30],
  red: [31],
  green: [32],
  yellow: [33],
  blue: [34],
  magenta: [35],
  cyan: [36],
  white: [37],
});

/**
 * Bright foreground colour codes (90–97).
 */
export const BRIGHT_FOREGROUND = Object.freeze({
  black: [90],
  red: [91],
  green: [92],
  yellow: [93],
  blue: [94],
  magenta: [95],
  cyan: [96],
  white: [97],
});

/**
 * Standard background colour codes (40–47).
 */
export const BACKGROUND = Object.freeze({
  black: [40],
  red: [41],
  green: [42],
  yellow: [43],
  blue: [44],
  magenta: [45],
  cyan: [46],
  white: [47],
});

/**
 * Bright background colour codes (100–107).
 */
export const BRIGHT_BACKGROUND = Object.freeze({
  black: [100],
  red: [101],
  green: [102],
  yellow: [103],
  blue: [104],
  magenta: [105],
  cyan: [106],
  white: [107],
});

/**
 * Build a styled string from SGR codes.
 *
 * When level is NONE, returns the text unchanged — this is the dumb-terminal
 * path. When level >= BASIC, wraps the text in the SGR sequence and appends
 * a reset so styles don't bleed into subsequent output.
 *
 * We always append reset (code 0) rather than trying to compute a "minimal"
 * reset, because computing the inverse of composed styles is error-prone and
 * reset is universally supported.
 *
 * @param {number[]} codes - SGR parameter codes.
 * @param {string} text - The text to wrap.
 * @param {number} level - Colour support level (0 = none).
 * @returns {string}
 */
export function buildStyle(codes, text, level) {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof text}`);
  }
  if (level === 0) {
    return text;
  }
  if (!Array.isArray(codes) || codes.length === 0) {
    return text;
  }
  const params = codes.join(';');
  return `\x1b[${params}m${text}\x1b[0m`;
}
