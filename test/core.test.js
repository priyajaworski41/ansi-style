import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  Level,
  detectLevel,
  getLevel,
  setLevel,
  bold,
  red,
  bgBlue,
  brightRed,
  strip,
  STYLES,
  FOREGROUND,
} from '../src/index.js';

import { buildStyle } from '../src/core.js';

describe('detectLevel', () => {
  it('returns NONE when TERM is dumb', () => {
    assert.equal(detectLevel({ TERM: 'dumb' }, true), Level.NONE);
  });

  it('returns NONE when not a TTY', () => {
    assert.equal(detectLevel({ TERM: 'xterm-256color' }, false), Level.NONE);
  });

  it('returns BASIC when TTY and TERM is not dumb', () => {
    assert.equal(detectLevel({ TERM: 'xterm-256color' }, true), Level.BASIC);
  });

  it('respects NO_COLOR over everything else', () => {
    assert.equal(detectLevel({ TERM: 'xterm-256color', NO_COLOR: '1' }, true), Level.NONE);
  });

  it('treats empty NO_COLOR as unset', () => {
    assert.equal(detectLevel({ TERM: 'xterm-256color', NO_COLOR: '' }, true), Level.BASIC);
  });

  it('respects FORCE_COLOR over TERM=dumb', () => {
    assert.equal(detectLevel({ TERM: 'dumb', FORCE_COLOR: '1' }, false), Level.BASIC);
  });

  it('treats empty FORCE_COLOR as unset', () => {
    assert.equal(detectLevel({ TERM: 'dumb', FORCE_COLOR: '' }, false), Level.NONE);
  });

  it('NO_COLOR wins over FORCE_COLOR', () => {
    assert.equal(
      detectLevel({ TERM: 'xterm-256color', NO_COLOR: '1', FORCE_COLOR: '1' }, true),
      Level.NONE,
    );
  });
});

describe('getLevel / setLevel', () => {
  let saved;
  beforeEach(() => {
    saved = getLevel();
  });
  afterEach(() => {
    setLevel(saved);
  });

  it('setLevel changes what getLevel returns', () => {
    setLevel(Level.NONE);
    assert.equal(getLevel(), Level.NONE);
    setLevel(Level.BASIC);
    assert.equal(getLevel(), Level.BASIC);
  });
});

describe('style functions', () => {
  let saved;
  beforeEach(() => {
    saved = getLevel();
  });
  afterEach(() => {
    setLevel(saved);
  });

  it('wraps text with SGR codes at BASIC level', () => {
    setLevel(Level.BASIC);
    assert.equal(bold('hi'), '\x1b[1mhi\x1b[0m');
  });

  it('returns plain text at NONE level', () => {
    setLevel(Level.NONE);
    assert.equal(bold('hi'), 'hi');
  });

  it('red uses code 31', () => {
    setLevel(Level.BASIC);
    assert.equal(red('x'), '\x1b[31mx\x1b[0m');
  });

  it('bgBlue uses code 44', () => {
    setLevel(Level.BASIC);
    assert.equal(bgBlue('x'), '\x1b[44mx\x1b[0m');
  });

  it('brightRed uses code 91', () => {
    setLevel(Level.BASIC);
    assert.equal(brightRed('x'), '\x1b[91mx\x1b[0m');
  });

  it('handles empty string input', () => {
    setLevel(Level.BASIC);
    assert.equal(red(''), '\x1b[31m\x1b[0m');
  });

  it('throws TypeError on non-string input', () => {
    assert.throws(() => red(42), TypeError);
  });
});

describe('buildStyle', () => {
  it('returns text unchanged at level 0', () => {
    assert.equal(buildStyle([1], 'hi', 0), 'hi');
  });

  it('returns text unchanged for empty codes array', () => {
    assert.equal(buildStyle([], 'hi', 1), 'hi');
  });

  it('joins multiple codes with semicolons', () => {
    assert.equal(buildStyle([1, 31], 'hi', 1), '\x1b[1;31mhi\x1b[0m');
  });
});

describe('strip', () => {
  it('removes SGR sequences', () => {
    assert.equal(strip('\x1b[31mred\x1b[0m'), 'red');
  });

  it('removes composed SGR sequences', () => {
    assert.equal(strip('\x1b[1;31mbold red\x1b[0m'), 'bold red');
  });

  it('leaves plain text untouched', () => {
    assert.equal(strip('hello world'), 'hello world');
  });

  it('handles strings with no escapes', () => {
    assert.equal(strip('abc'), 'abc');
  });

  it('throws TypeError on non-string input', () => {
    assert.throws(() => strip(42), TypeError);
  });
});

describe('code tables', () => {
  it('STYLES.bold is [1]', () => {
    assert.deepEqual(STYLES.bold, [1]);
  });

  it('FOREGROUND.red is [31]', () => {
    assert.deepEqual(FOREGROUND.red, [31]);
  });

  it('tables are frozen', () => {
    assert.ok(Object.isFrozen(STYLES));
    assert.ok(Object.isFrozen(FOREGROUND));
  });
});
