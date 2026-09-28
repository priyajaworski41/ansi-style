/**
 * ANSI Style — colour/style helpers for terminals, with dumb-terminal detection.
 *
 * Design decision: detection is done ONCE at module load and cached. The brief
 * says "detection", not "re-detection on every call". Re-parsing environment
 * variables per call is wasteful and introduces non-determinism if the env
 * mutates. If a caller needs to override detection, they use `setLevel`.
 */

import {
  buildStyle,
  STYLES,
  FOREGROUND,
  BACKGROUND,
  BRIGHT_FOREGROUND,
  BRIGHT_BACKGROUND,
} from './core.js';

/**
 * Colour support level.
 *
 * 0 — no colour (dumb terminal or non-TTY).
 * 1 — 16 colours (basic ANSI).
 * 2 — 256 colours (not used by the named helpers, but reserved).
 * 3 — truecolour (24-bit, not used by the named helpers, but reserved).
 *
 * The named style helpers only emit level-1 codes. This keeps the output
 * portable across every terminal that supports colour at all. Adding 256/true
 * colour helpers would inflate the surface area without serving the stated
 * purpose; a caller who needs them can build their own SGR strings.
 *
 * @enum {number}
 */
export const Level = Object.freeze({
  NONE: 0,
  BASIC: 1,
  EIGHT_BIT: 2,
  TRUECOLOUR: 3,
});

/**
 * Detect colour support from the environment.
 *
 * We check, in order:
 *   1. NO_COLOR — if set to any value, force NONE (https://no-color.org).
 *   2. FORCE_COLOR — if set to a non-empty value, force BASIC.
 *   3. TERM — if "dumb", force NONE.
 *   4. isTTY on stdout — if not a TTY, force NONE.
 *
 * We do NOT parse COLORTERM or terminfo. The brief asks for dumb-terminal
 * detection, not a full terminfo database. Keeping this narrow means the
 * behaviour is predictable and testable without spawning processes.
 *
 * @param {object} [env] - Environment record (defaults to process.env).
 * @param {boolean} [isTTY] - Whether stdout is a TTY (defaults to process.stdout.isTTY).
 * @returns {number} A Level value.
 */
export function detectLevel(env = process.env, isTTY = process.stdout?.isTTY ?? false) {
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') {
    return Level.NONE;
  }
  if (env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== '') {
    return Level.BASIC;
  }
  if (env.TERM === 'dumb') {
    return Level.NONE;
  }
  return isTTY ? Level.BASIC : Level.NONE;
}

let currentLevel = detectLevel();

/**
 * Get the current colour support level.
 * @returns {number}
 */
export function getLevel() {
  return currentLevel;
}

/**
 * Override the detected level. Pass a Level value.
 * @param {number} level
 */
export function setLevel(level) {
  currentLevel = level;
}

/**
 * Build a style function for the current level.
 *
 * @param {number[]} codes - SGR parameter codes.
 * @returns {(text: string) => string}
 */
function style(codes) {
  return (text) => buildStyle(codes, text, currentLevel);
}

// --- Attribute styles ---
export const reset = style(STYLES.reset);
export const bold = style(STYLES.bold);
export const dim = style(STYLES.dim);
export const italic = style(STYLES.italic);
export const underline = style(STYLES.underline);
export const blink = style(STYLES.blink);
export const inverse = style(STYLES.inverse);
export const hidden = style(STYLES.hidden);
export const strikethrough = style(STYLES.strikethrough);

// --- Foreground colours ---
export const black = style(FOREGROUND.black);
export const red = style(FOREGROUND.red);
export const green = style(FOREGROUND.green);
export const yellow = style(FOREGROUND.yellow);
export const blue = style(FOREGROUND.blue);
export const magenta = style(FOREGROUND.magenta);
export const cyan = style(FOREGROUND.cyan);
export const white = style(FOREGROUND.white);

// --- Bright foreground colours ---
export const brightBlack = style(BRIGHT_FOREGROUND.black);
export const brightRed = style(BRIGHT_FOREGROUND.red);
export const brightGreen = style(BRIGHT_FOREGROUND.green);
export const brightYellow = style(BRIGHT_FOREGROUND.yellow);
export const brightBlue = style(BRIGHT_FOREGROUND.blue);
export const brightMagenta = style(BRIGHT_FOREGROUND.magenta);
export const brightCyan = style(BRIGHT_FOREGROUND.cyan);
export const brightWhite = style(BRIGHT_FOREGROUND.white);

// --- Background colours ---
export const bgBlack = style(BACKGROUND.black);
export const bgRed = style(BACKGROUND.red);
export const bgGreen = style(BACKGROUND.green);
export const bgYellow = style(BACKGROUND.yellow);
export const bgBlue = style(BACKGROUND.blue);
export const bgMagenta = style(BACKGROUND.magenta);
export const bgCyan = style(BACKGROUND.cyan);
export const bgWhite = style(BACKGROUND.white);

// --- Bright background colours ---
export const bgBrightBlack = style(BRIGHT_BACKGROUND.black);
export const bgBrightRed = style(BRIGHT_BACKGROUND.red);
export const bgBrightGreen = style(BRIGHT_BACKGROUND.green);
export const bgBrightYellow = style(BRIGHT_BACKGROUND.yellow);
export const bgBrightBlue = style(BRIGHT_BACKGROUND.blue);
export const bgBrightMagenta = style(BRIGHT_BACKGROUND.magenta);
export const bgBrightCyan = style(BRIGHT_BACKGROUND.cyan);
export const bgBrightWhite = style(BRIGHT_BACKGROUND.white);

/**
 * Strip ANSI escape sequences from a string.
 *
 * Handles CSI sequences (ESC [ ... letter). This covers all SGR codes this
 * library produces, plus cursor movement, erasing, etc.
 *
 * @param {string} text
 * @returns {string}
 */
export function strip(text) {
  if (typeof text !== 'string') {
    throw new TypeError(`strip expected a string, got ${typeof text}`);
  }
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}

export { STYLES, FOREGROUND, BACKGROUND, BRIGHT_FOREGROUND, BRIGHT_BACKGROUND } from './core.js';
