# ANSI Style

Colour and style helpers for terminal output, with dumb-terminal detection.

## Usage

```js
import { red, bold, bgBlue, strip, setLevel, Level } from 'ansi-style';

setLevel(Level.BASIC);
console.log(red(bold('error'))); // \x1b[1m\x1b[31merror\x1b[0m\x1b[0m
console.log(strip('\x1b[31mtext\x1b[0m')); // text
```

## Why

Existing terminal-colour libraries tend to either skip detection entirely or
pull in large dependency trees for terminfo parsing. This library does one
narrow thing: it checks `NO_COLOR`, `FORCE_COLOR`, `TERM=dumb`, and TTY status,
then provides named functions for the 16-colour ANSI palette plus basic
attributes (bold, dim, italic, etc.).

The trade-off: no 256-colour or truecolour support. If you need those, build
the SGR strings yourself — the code tables in `core.js` are exported for that
purpose.

## Edge cases

Detection runs once at module load and caches the result. If your process
changes environment variables or redirects stdout after import, call
`setLevel(Level.BASIC)` or `setLevel(Level.NONE)` to override.

`NO_COLOR` set to an empty string is treated as unset (per the spec, any
non-empty value disables colour). `FORCE_COLOR` follows the same rule.

Style functions always append a full reset (`\x1b[0m`). We do not compute
minimal resets because doing so reliably across composed styles is error-prone,
and full reset is universally supported.

## Exports

- `Level` — enum: `NONE`, `BASIC`, `EIGHT_BIT`, `TRUECOLOUR`
- `detectLevel(env?, isTTY?)` — returns a `Level`
- `getLevel()` / `setLevel(level)` — read/write cached level
- `strip(text)` — remove ANSI CSI sequences
- Style functions: `reset`, `bold`, `dim`, `italic`, `underline`, `blink`,
  `inverse`, `hidden`, `strikethrough`
- Foreground: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`,
  `white`
- Bright foreground: `brightBlack`, `brightRed`, `brightGreen`,
  `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`
- Background: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`,
  `bgMagenta`, `bgCyan`, `bgWhite`
- Bright background: `bgBrightBlack`, `bgBrightRed`, `bgBrightGreen`,
  `bgBrightYellow`, `bgBrightBlue`, `bgBrightMagenta`, `bgBrightCyan`,
  `bgBrightWhite`
- Code tables (from `core.js`): `STYLES`, `FOREGROUND`, `BRIGHT_FOREGROUND`,
  `BACKGROUND`, `BRIGHT_BACKGROUND`

## Running tests

```sh
node --test
```

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

