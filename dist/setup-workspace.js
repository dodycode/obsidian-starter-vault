#!/usr/bin/env npx tsx
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js
var require_src = __commonJS({
  "node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js"(exports2, module2) {
    "use strict";
    var ESC2 = "\x1B";
    var CSI2 = `${ESC2}[`;
    var beep = "\x07";
    var cursor = {
      to(x, y) {
        if (!y) return `${CSI2}${x + 1}G`;
        return `${CSI2}${y + 1};${x + 1}H`;
      },
      move(x, y) {
        let ret = "";
        if (x < 0) ret += `${CSI2}${-x}D`;
        else if (x > 0) ret += `${CSI2}${x}C`;
        if (y < 0) ret += `${CSI2}${-y}A`;
        else if (y > 0) ret += `${CSI2}${y}B`;
        return ret;
      },
      up: (count = 1) => `${CSI2}${count}A`,
      down: (count = 1) => `${CSI2}${count}B`,
      forward: (count = 1) => `${CSI2}${count}C`,
      backward: (count = 1) => `${CSI2}${count}D`,
      nextLine: (count = 1) => `${CSI2}E`.repeat(count),
      prevLine: (count = 1) => `${CSI2}F`.repeat(count),
      left: `${CSI2}G`,
      hide: `${CSI2}?25l`,
      show: `${CSI2}?25h`,
      save: `${ESC2}7`,
      restore: `${ESC2}8`
    };
    var scroll = {
      up: (count = 1) => `${CSI2}S`.repeat(count),
      down: (count = 1) => `${CSI2}T`.repeat(count)
    };
    var erase = {
      screen: `${CSI2}2J`,
      up: (count = 1) => `${CSI2}1J`.repeat(count),
      down: (count = 1) => `${CSI2}J`.repeat(count),
      line: `${CSI2}2K`,
      lineEnd: `${CSI2}K`,
      lineStart: `${CSI2}1K`,
      lines(count) {
        let clear = "";
        for (let i = 0; i < count; i++)
          clear += this.line + (i < count - 1 ? cursor.up() : "");
        if (count)
          clear += cursor.left;
        return clear;
      }
    };
    module2.exports = { cursor, scroll, erase, beep };
  }
});

// scripts/setup-workspace.ts
var setup_workspace_exports = {};
__export(setup_workspace_exports, {
  VAULT_REPO: () => VAULT_REPO,
  buildConfig: () => buildConfig,
  detectMode: () => detectMode,
  executeSetup: () => executeSetup,
  findProjectFolder: () => findProjectFolder,
  getEnvOrArg: () => getEnvOrArg,
  isNonInteractive: () => isNonInteractive,
  isProjectFolder: () => isProjectFolder,
  parseArgs: () => parseArgs,
  resolveProjectName: () => resolveProjectName,
  resolveUserName: () => resolveUserName,
  resolveWorkspace: () => resolveWorkspace,
  validateProjectName: () => validateProjectName,
  validateUserName: () => validateUserName
});
module.exports = __toCommonJS(setup_workspace_exports);

// node_modules/.pnpm/@clack+core@1.3.0/node_modules/@clack/core/dist/index.mjs
var import_node_util = require("node:util");
var import_node_process = require("node:process");
var b = __toESM(require("node:readline"), 1);
var import_node_readline = __toESM(require("node:readline"), 1);

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/utils.js
var getCodePointsLength = /* @__PURE__ */ (() => {
  const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return (input) => {
    let surrogatePairsNr = 0;
    SURROGATE_PAIR_RE.lastIndex = 0;
    while (SURROGATE_PAIR_RE.test(input)) {
      surrogatePairsNr += 1;
    }
    return input.length - surrogatePairsNr;
  };
})();
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWideNotCJKTNotEmoji = (x) => {
  return x === 8987 || x === 9001 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]|\u001b\]8;[^;]*;.*?(?:\u0007|\u001b\u005c)/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var CJKT_WIDE_RE = /(?:(?![\uFF61-\uFF9F\uFF00-\uFFEF])[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Tangut}]){1,1000}/yu;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/yu;
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = /\p{M}+/gu;
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? FULL_WIDTH_WIDTH;
  const PARSE_BLOCKS = [
    [LATIN_RE, REGULAR_WIDTH],
    [ANSI_RE, ANSI_WIDTH],
    [CONTROL_RE, CONTROL_WIDTH],
    [TAB_RE, TAB_WIDTH],
    [EMOJI_RE, EMOJI_WIDTH],
    [CJKT_WIDE_RE, WIDE_WIDTH]
  ];
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer: while (true) {
    if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
      const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
      lengthExtra = 0;
      for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
        const codePoint = char.codePointAt(0) || 0;
        if (isFullWidth(codePoint)) {
          widthExtra = FULL_WIDTH_WIDTH;
        } else if (isWideNotCJKTNotEmoji(codePoint)) {
          widthExtra = WIDE_WIDTH;
        } else {
          widthExtra = REGULAR_WIDTH;
        }
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        lengthExtra += char.length;
        width += widthExtra;
      }
      unmatchedStart = unmatchedEnd = 0;
    }
    if (index >= length) {
      break outer;
    }
    for (let i = 0, l = PARSE_BLOCKS.length; i < l; i++) {
      const [BLOCK_RE, BLOCK_WIDTH] = PARSE_BLOCKS[i];
      BLOCK_RE.lastIndex = index;
      if (BLOCK_RE.test(input)) {
        lengthExtra = BLOCK_RE === CJKT_WIDE_RE ? getCodePointsLength(input.slice(index, BLOCK_RE.lastIndex)) : BLOCK_RE === EMOJI_RE ? 1 : BLOCK_RE.lastIndex - index;
        widthExtra = lengthExtra * BLOCK_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / BLOCK_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = BLOCK_RE.lastIndex;
        continue outer;
      }
    }
    index += 1;
  }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/.pnpm/fast-string-width@3.0.2/node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/.pnpm/fast-wrap-ansi@0.2.0/node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "\x9B";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return void 0;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === void 0 ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== void 0 && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join("\n");
  let inSurrogate = false;
  for (let i = 0; i < preString.length; i++) {
    const character = preString[i];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
      if (inSurrogate) {
        continue;
      }
    } else {
      inSurrogate = false;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== void 0) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? void 0 : code;
      } else if (groups?.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    if (preString[i + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : void 0;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === "\n") {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join("\n");
}

// node_modules/.pnpm/@clack+core@1.3.0/node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
var import_node_tty = require("node:tty");
function d(r, t, s) {
  if (!s.some((o) => !o.disabled)) return r;
  const e2 = r + t, i = Math.max(s.length - 1, 0), n = e2 < 0 ? i : e2 > i ? 0 : e2;
  return s[n].disabled ? d(n, t < 0 ? -1 : 1, s) : n;
}
var G = ["up", "down", "left", "right", "space", "enter", "cancel"];
var K = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var h = { actions: new Set(G), aliases: /* @__PURE__ */ new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"], ["", "cancel"], ["escape", "cancel"]]), messages: { cancel: "Canceled", error: "Something went wrong" }, withGuide: true, date: { monthNames: [...K], messages: { required: "Please enter a valid date", invalidMonth: "There are only 12 months in a year", invalidDay: (r, t) => `There are only ${r} days in ${t}`, afterMin: (r) => `Date must be on or after ${r.toISOString().slice(0, 10)}`, beforeMax: (r) => `Date must be on or before ${r.toISOString().slice(0, 10)}` } } };
function C(r, t) {
  if (typeof r == "string") return h.aliases.get(r) === t;
  for (const s of r) if (s !== void 0 && C(s, t)) return true;
  return false;
}
function z(r, t) {
  if (r === t) return;
  const s = r.split(`
`), e2 = t.split(`
`), i = Math.max(s.length, e2.length), n = [];
  for (let o = 0; o < i; o++) s[o] !== e2[o] && n.push(o);
  return { lines: n, numLinesBefore: s.length, numLinesAfter: e2.length, numLines: i };
}
var Y = globalThis.process.platform.startsWith("win");
var k = /* @__PURE__ */ Symbol("clack:cancel");
function q(r) {
  return r === k;
}
function w(r, t) {
  const s = r;
  s.isTTY && s.setRawMode(t);
}
function R({ input: r = import_node_process.stdin, output: t = import_node_process.stdout, overwrite: s = true, hideCursor: e2 = true } = {}) {
  const i = b.createInterface({ input: r, output: t, prompt: "", tabSize: 1 });
  b.emitKeypressEvents(r, i), r instanceof import_node_tty.ReadStream && r.isTTY && r.setRawMode(true);
  const n = (o, { name: u, sequence: a }) => {
    const l = String(o);
    if (C([l, u, a], "cancel")) {
      e2 && t.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!s) return;
    const f = u === "return" ? 0 : -1, y = u === "return" ? -1 : 0;
    b.moveCursor(t, f, y, () => {
      b.clearLine(t, 1, () => {
        r.once("keypress", n);
      });
    });
  };
  return e2 && t.write(import_sisteransi.cursor.hide), r.once("keypress", n), () => {
    r.off("keypress", n), e2 && t.write(import_sisteransi.cursor.show), r instanceof import_node_tty.ReadStream && r.isTTY && !Y && r.setRawMode(false), i.terminal = false, i.close();
  };
}
var A = (r) => "columns" in r && typeof r.columns == "number" ? r.columns : 80;
var L = (r) => "rows" in r && typeof r.rows == "number" ? r.rows : 20;
function W(r, t, s, e2 = s, i) {
  const n = A(r ?? import_node_process.stdout);
  return wrapAnsi(t, n - s.length, { hard: true, trim: false }).split(`
`).map((o, u) => {
    const a = i ? i(o, u) : o;
    return `${u === 0 ? e2 : s}${a}`;
  }).join(`
`);
}
var p = class {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map();
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t, s = true) {
    const { input: e2 = import_node_process.stdin, output: i = import_node_process.stdout, render: n, signal: o, ...u } = t;
    this.opts = u, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = n.bind(this), this._track = s, this._abortSignal = o, this.input = e2, this.output = i;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(t, s) {
    const e2 = this._subscribers.get(t) ?? [];
    e2.push(s), this._subscribers.set(t, e2);
  }
  on(t, s) {
    this.setSubscriber(t, { cb: s });
  }
  once(t, s) {
    this.setSubscriber(t, { cb: s, once: true });
  }
  emit(t, ...s) {
    const e2 = this._subscribers.get(t) ?? [], i = [];
    for (const n of e2) n.cb(...s), n.once && i.push(() => e2.splice(e2.indexOf(n), 1));
    for (const n of i) n();
  }
  prompt() {
    return new Promise((t) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted) return this.state = "cancel", this.close(), t(k);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      this.rl = import_node_readline.default.createInterface({ input: this.input, tabSize: 2, prompt: "", escapeCodeTimeout: 50, terminal: true }), this.rl.prompt(), this.opts.initialUserInput !== void 0 && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), w(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t(k);
      });
    });
  }
  _isActionKey(t, s) {
    return t === "	";
  }
  _shouldSubmit(t, s) {
    return true;
  }
  _setValue(t) {
    this.value = t, this.emit("value", this.value);
  }
  _setUserInput(t, s) {
    this.userInput = t ?? "", this.emit("userInput", this.userInput), s && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t, s) {
    if (this._track && s.name !== "return" && (s.name && this._isActionKey(t, s) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), s?.name && (!this._track && h.aliases.has(s.name) && this.emit("cursor", h.aliases.get(s.name)), h.actions.has(s.name) && this.emit("cursor", s.name)), t && (t.toLowerCase() === "y" || t.toLowerCase() === "n") && this.emit("confirm", t.toLowerCase() === "y"), this.emit("key", t?.toLowerCase(), s), s?.name === "return" && this._shouldSubmit(t, s)) {
      if (this.opts.validate) {
        const e2 = this.opts.validate(this.value);
        e2 && (this.error = e2 instanceof Error ? e2.message : e2, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    C([t, s?.name, s?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), w(this.input, false), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t * -1));
  }
  render() {
    const t = wrapAnsi(this._render(this) ?? "", process.stdout.columns, { hard: true, trim: false });
    if (t !== this._prevFrame) {
      if (this.state === "initial") this.output.write(import_sisteransi.cursor.hide);
      else {
        const s = z(this._prevFrame, t), e2 = L(this.output);
        if (this.restoreCursor(), s) {
          const i = Math.max(0, s.numLinesAfter - e2), n = Math.max(0, s.numLinesBefore - e2);
          let o = s.lines.find((u) => u >= i);
          if (o === void 0) {
            this._prevFrame = t;
            return;
          }
          if (s.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, o - n)), this.output.write(import_sisteransi.erase.lines(1));
            const u = t.split(`
`);
            this.output.write(u[o]), this._prevFrame = t, this.output.write(import_sisteransi.cursor.move(0, u.length - o - 1));
            return;
          } else if (s.lines.length > 1) {
            if (i < n) o = i;
            else {
              const a = o - n;
              a > 0 && this.output.write(import_sisteransi.cursor.move(0, a));
            }
            this.output.write(import_sisteransi.erase.down());
            const u = t.split(`
`).slice(o);
            this.output.write(u.join(`
`)), this._prevFrame = t;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t), this.state === "initial" && (this.state = "active"), this._prevFrame = t;
    }
  }
};
var X = class extends p {
  get cursor() {
    return this.value ? 0 : 1;
  }
  get _value() {
    return this.cursor === 0;
  }
  constructor(t) {
    super(t, false), this.value = !!t.initialValue, this.on("userInput", () => {
      this.value = this._value;
    }), this.on("confirm", (s) => {
      this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = s, this.state = "submit", this.close();
    }), this.on("cursor", () => {
      this.value = !this.value;
    });
  }
};
var ut = class extends p {
  options;
  cursor = 0;
  get _selectedValue() {
    return this.options[this.cursor];
  }
  changeValue() {
    this.value = this._selectedValue.value;
  }
  constructor(t) {
    super(t, false), this.options = t.options;
    const s = this.options.findIndex(({ value: i }) => i === t.initialValue), e2 = s === -1 ? 0 : s;
    this.cursor = this.options[e2].disabled ? d(e2, 1, this.options) : e2, this.changeValue(), this.on("cursor", (i) => {
      switch (i) {
        case "left":
        case "up":
          this.cursor = d(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = d(this.cursor, 1, this.options);
          break;
      }
      this.changeValue();
    });
  }
};
var ht = class extends p {
  get userInputWithCursor() {
    if (this.state === "submit") return this.userInput;
    const t = this.userInput;
    if (this.cursor >= t.length) return `${this.userInput}\u2588`;
    const s = t.slice(0, this.cursor), [e2, ...i] = t.slice(this.cursor);
    return `${s}${(0, import_node_util.styleText)("inverse", e2)}${i.join("")}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t) {
    super({ ...t, initialUserInput: t.initialUserInput ?? t.initialValue }), this.on("userInput", (s) => {
      this._setValue(s);
    }), this.on("finalize", () => {
      this.value || (this.value = t.defaultValue), this.value === void 0 && (this.value = "");
    });
  }
};

// node_modules/.pnpm/@clack+prompts@1.3.0/node_modules/@clack/prompts/dist/index.mjs
var import_node_util2 = require("node:util");
var import_node_process2 = __toESM(require("node:process"), 1);
var import_sisteransi2 = __toESM(require_src(), 1);
function te() {
  return import_node_process2.default.platform !== "win32" ? import_node_process2.default.env.TERM !== "linux" : !!import_node_process2.default.env.CI || !!import_node_process2.default.env.WT_SESSION || !!import_node_process2.default.env.TERMINUS_SUBLIME || import_node_process2.default.env.ConEmuTask === "{cmd::Cmder}" || import_node_process2.default.env.TERM_PROGRAM === "Terminus-Sublime" || import_node_process2.default.env.TERM_PROGRAM === "vscode" || import_node_process2.default.env.TERM === "xterm-256color" || import_node_process2.default.env.TERM === "alacritty" || import_node_process2.default.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var tt = te();
var at2 = () => process.env.CI === "true";
var w2 = (t, r) => tt ? t : r;
var _t = w2("\u25C6", "*");
var ot2 = w2("\u25A0", "x");
var ut2 = w2("\u25B2", "x");
var F = w2("\u25C7", "o");
var lt = w2("\u250C", "T");
var $ = w2("\u2502", "|");
var E2 = w2("\u2514", "\u2014");
var It = w2("\u2510", "T");
var Et = w2("\u2518", "\u2014");
var z2 = w2("\u25CF", ">");
var H = w2("\u25CB", " ");
var et2 = w2("\u25FB", "[\u2022]");
var U = w2("\u25FC", "[+]");
var J = w2("\u25FB", "[ ]");
var Gt = w2("\u25AA", "\u2022");
var st = w2("\u2500", "-");
var ct = w2("\u256E", "+");
var xt = w2("\u251C", "+");
var $t = w2("\u256F", "+");
var dt = w2("\u2570", "+");
var Ot = w2("\u256D", "+");
var ht2 = w2("\u25CF", "\u2022");
var pt = w2("\u25C6", "*");
var mt = w2("\u25B2", "!");
var gt = w2("\u25A0", "x");
var M = (t) => {
  switch (t) {
    case "initial":
    case "active":
      return (0, import_node_util2.styleText)("cyan", _t);
    case "cancel":
      return (0, import_node_util2.styleText)("red", ot2);
    case "error":
      return (0, import_node_util2.styleText)("yellow", ut2);
    case "submit":
      return (0, import_node_util2.styleText)("green", F);
  }
};
var yt = (t) => {
  switch (t) {
    case "initial":
    case "active":
      return (0, import_node_util2.styleText)("cyan", $);
    case "cancel":
      return (0, import_node_util2.styleText)("red", $);
    case "error":
      return (0, import_node_util2.styleText)("yellow", $);
    case "submit":
      return (0, import_node_util2.styleText)("green", $);
  }
};
var ee = (t, r, s, i, u) => {
  let n = r, o = 0;
  for (let c2 = s; c2 < i; c2++) {
    const a = t[c2];
    if (n = n - a.length, o++, n <= u) break;
  }
  return { lineCount: n, removals: o };
};
var Y2 = ({ cursor: t, options: r, style: s, output: i = process.stdout, maxItems: u = Number.POSITIVE_INFINITY, columnPadding: n = 0, rowPadding: o = 4 }) => {
  const c2 = A(i) - n, a = L(i), l = (0, import_node_util2.styleText)("dim", "..."), d2 = Math.max(a - o, 0), y = Math.max(Math.min(u, d2), 5);
  let p2 = 0;
  t >= y - 3 && (p2 = Math.max(Math.min(t - y + 3, r.length - y), 0));
  let m = y < r.length && p2 > 0, g = y < r.length && p2 + y < r.length;
  const S2 = Math.min(p2 + y, r.length), h2 = [];
  let f = 0;
  m && f++, g && f++;
  const v2 = p2 + (m ? 1 : 0), T = S2 - (g ? 1 : 0);
  for (let b2 = v2; b2 < T; b2++) {
    const G2 = wrapAnsi(s(r[b2], b2 === t), c2, { hard: true, trim: false }).split(`
`);
    h2.push(G2), f += G2.length;
  }
  if (f > d2) {
    let b2 = 0, G2 = 0, x = f;
    const A2 = t - v2, P = (N, D2) => ee(h2, x, N, D2, d2);
    m ? ({ lineCount: x, removals: b2 } = P(0, A2), x > d2 && ({ lineCount: x, removals: G2 } = P(A2 + 1, h2.length))) : ({ lineCount: x, removals: G2 } = P(A2 + 1, h2.length), x > d2 && ({ lineCount: x, removals: b2 } = P(0, A2))), b2 > 0 && (m = true, h2.splice(0, b2)), G2 > 0 && (g = true, h2.splice(h2.length - G2, G2));
  }
  const C2 = [];
  m && C2.push(l);
  for (const b2 of h2) for (const G2 of b2) C2.push(G2);
  return g && C2.push(l), C2;
};
var ue = (t) => {
  const r = t.active ?? "Yes", s = t.inactive ?? "No";
  return new X({ active: r, inactive: s, signal: t.signal, input: t.input, output: t.output, initialValue: t.initialValue ?? true, render() {
    const i = t.withGuide ?? h.withGuide, u = `${M(this.state)}  `, n = i ? `${(0, import_node_util2.styleText)("gray", $)}  ` : "", o = W(t.output, t.message, n, u), c2 = `${i ? `${(0, import_node_util2.styleText)("gray", $)}
` : ""}${o}
`, a = this.value ? r : s;
    switch (this.state) {
      case "submit": {
        const l = i ? `${(0, import_node_util2.styleText)("gray", $)}  ` : "";
        return `${c2}${l}${(0, import_node_util2.styleText)("dim", a)}`;
      }
      case "cancel": {
        const l = i ? `${(0, import_node_util2.styleText)("gray", $)}  ` : "";
        return `${c2}${l}${(0, import_node_util2.styleText)(["strikethrough", "dim"], a)}${i ? `
${(0, import_node_util2.styleText)("gray", $)}` : ""}`;
      }
      default: {
        const l = i ? `${(0, import_node_util2.styleText)("cyan", $)}  ` : "", d2 = i ? (0, import_node_util2.styleText)("cyan", E2) : "";
        return `${c2}${l}${this.value ? `${(0, import_node_util2.styleText)("green", z2)} ${r}` : `${(0, import_node_util2.styleText)("dim", H)} ${(0, import_node_util2.styleText)("dim", r)}`}${t.vertical ? i ? `
${(0, import_node_util2.styleText)("cyan", $)}  ` : `
` : ` ${(0, import_node_util2.styleText)("dim", "/")} `}${this.value ? `${(0, import_node_util2.styleText)("dim", H)} ${(0, import_node_util2.styleText)("dim", s)}` : `${(0, import_node_util2.styleText)("green", z2)} ${s}`}
${d2}
`;
      }
    }
  } }).prompt();
};
var R2 = { message: (t = [], { symbol: r = (0, import_node_util2.styleText)("gray", $), secondarySymbol: s = (0, import_node_util2.styleText)("gray", $), output: i = process.stdout, spacing: u = 1, withGuide: n } = {}) => {
  const o = [], c2 = n ?? h.withGuide, a = c2 ? s : "", l = c2 ? `${r}  ` : "", d2 = c2 ? `${s}  ` : "";
  for (let p2 = 0; p2 < u; p2++) o.push(a);
  const y = Array.isArray(t) ? t : t.split(`
`);
  if (y.length > 0) {
    const [p2, ...m] = y;
    p2.length > 0 ? o.push(`${l}${p2}`) : o.push(c2 ? r : "");
    for (const g of m) g.length > 0 ? o.push(`${d2}${g}`) : o.push(c2 ? s : "");
  }
  i.write(`${o.join(`
`)}
`);
}, info: (t, r) => {
  R2.message(t, { ...r, symbol: (0, import_node_util2.styleText)("blue", ht2) });
}, success: (t, r) => {
  R2.message(t, { ...r, symbol: (0, import_node_util2.styleText)("green", pt) });
}, step: (t, r) => {
  R2.message(t, { ...r, symbol: (0, import_node_util2.styleText)("green", F) });
}, warn: (t, r) => {
  R2.message(t, { ...r, symbol: (0, import_node_util2.styleText)("yellow", mt) });
}, warning: (t, r) => {
  R2.warn(t, r);
}, error: (t, r) => {
  R2.message(t, { ...r, symbol: (0, import_node_util2.styleText)("red", gt) });
} };
var me = (t = "", r) => {
  const s = r?.output ?? process.stdout, i = r?.withGuide ?? h.withGuide ? `${(0, import_node_util2.styleText)("gray", E2)}  ` : "";
  s.write(`${i}${(0, import_node_util2.styleText)("red", t)}

`);
};
var ge = (t = "", r) => {
  const s = r?.output ?? process.stdout, i = r?.withGuide ?? h.withGuide ? `${(0, import_node_util2.styleText)("gray", lt)}  ` : "";
  s.write(`${i}${t}
`);
};
var ye = (t = "", r) => {
  const s = r?.output ?? process.stdout, i = r?.withGuide ?? h.withGuide ? `${(0, import_node_util2.styleText)("gray", $)}
${(0, import_node_util2.styleText)("gray", E2)}  ` : "";
  s.write(`${i}${t}

`);
};
var _e = (t) => (0, import_node_util2.styleText)("magenta", t);
var ft = ({ indicator: t = "dots", onCancel: r, output: s = process.stdout, cancelMessage: i, errorMessage: u, frames: n = tt ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"] : ["\u2022", "o", "O", "0"], delay: o = tt ? 80 : 120, signal: c2, ...a } = {}) => {
  const l = at2();
  let d2, y, p2 = false, m = false, g = "", S2, h2 = performance.now();
  const f = A(s), v2 = a?.styleFrame ?? _e, T = (I) => {
    const V2 = I > 1 ? u ?? h.messages.error : i ?? h.messages.cancel;
    m = I === 1, p2 && (W2(V2, I), m && typeof r == "function" && r());
  }, C2 = () => T(2), b2 = () => T(1), G2 = () => {
    process.on("uncaughtExceptionMonitor", C2), process.on("unhandledRejection", C2), process.on("SIGINT", b2), process.on("SIGTERM", b2), process.on("exit", T), c2 && c2.addEventListener("abort", b2);
  }, x = () => {
    process.removeListener("uncaughtExceptionMonitor", C2), process.removeListener("unhandledRejection", C2), process.removeListener("SIGINT", b2), process.removeListener("SIGTERM", b2), process.removeListener("exit", T), c2 && c2.removeEventListener("abort", b2);
  }, A2 = () => {
    if (S2 === void 0) return;
    l && s.write(`
`);
    const I = wrapAnsi(S2, f, { hard: true, trim: false }).split(`
`);
    I.length > 1 && s.write(import_sisteransi2.cursor.up(I.length - 1)), s.write(import_sisteransi2.cursor.to(0)), s.write(import_sisteransi2.erase.down());
  }, P = (I) => I.replace(/\.+$/, ""), N = (I) => {
    const V2 = (performance.now() - I) / 1e3, B = Math.floor(V2 / 60), L2 = Math.floor(V2 % 60);
    return B > 0 ? `[${B}m ${L2}s]` : `[${L2}s]`;
  }, D2 = a.withGuide ?? h.withGuide, rt2 = (I = "") => {
    p2 = true, d2 = R({ output: s }), g = P(I), h2 = performance.now(), D2 && s.write(`${(0, import_node_util2.styleText)("gray", $)}
`);
    let V2 = 0, B = 0;
    G2(), y = setInterval(() => {
      if (l && g === S2) return;
      A2(), S2 = g;
      const L2 = v2(n[V2]);
      let Z;
      if (l) Z = `${L2}  ${g}...`;
      else if (t === "timer") Z = `${L2}  ${g} ${N(h2)}`;
      else {
        const kt = ".".repeat(Math.floor(B)).slice(0, 3);
        Z = `${L2}  ${g}${kt}`;
      }
      const Nt = wrapAnsi(Z, f, { hard: true, trim: false });
      s.write(Nt), V2 = V2 + 1 < n.length ? V2 + 1 : 0, B = B < 4 ? B + 0.125 : 0;
    }, o);
  }, W2 = (I = "", V2 = 0, B = false) => {
    if (!p2) return;
    p2 = false, clearInterval(y), A2();
    const L2 = V2 === 0 ? (0, import_node_util2.styleText)("green", F) : V2 === 1 ? (0, import_node_util2.styleText)("red", ot2) : (0, import_node_util2.styleText)("red", ut2);
    g = I ?? g, B || (t === "timer" ? s.write(`${L2}  ${g} ${N(h2)}
`) : s.write(`${L2}  ${g}
`)), x(), d2();
  };
  return { start: rt2, stop: (I = "") => W2(I, 0), message: (I = "") => {
    g = P(I ?? g);
  }, cancel: (I = "") => W2(I, 1), error: (I = "") => W2(I, 2), clear: () => W2("", 0, true), get isCancelled() {
    return m;
  } };
};
var Vt = { light: w2("\u2500", "-"), heavy: w2("\u2501", "="), block: w2("\u2588", "#") };
var it2 = (t, r) => t.includes(`
`) ? t.split(`
`).map((s) => r(s)).join(`
`) : r(t);
var Ee = (t) => {
  const r = (s, i) => {
    const u = s.label ?? String(s.value);
    switch (i) {
      case "disabled":
        return `${(0, import_node_util2.styleText)("gray", H)} ${it2(u, (n) => (0, import_node_util2.styleText)("gray", n))}${s.hint ? ` ${(0, import_node_util2.styleText)("dim", `(${s.hint ?? "disabled"})`)}` : ""}`;
      case "selected":
        return `${it2(u, (n) => (0, import_node_util2.styleText)("dim", n))}`;
      case "active":
        return `${(0, import_node_util2.styleText)("green", z2)} ${u}${s.hint ? ` ${(0, import_node_util2.styleText)("dim", `(${s.hint})`)}` : ""}`;
      case "cancelled":
        return `${it2(u, (n) => (0, import_node_util2.styleText)(["strikethrough", "dim"], n))}`;
      default:
        return `${(0, import_node_util2.styleText)("dim", H)} ${it2(u, (n) => (0, import_node_util2.styleText)("dim", n))}`;
    }
  };
  return new ut({ options: t.options, signal: t.signal, input: t.input, output: t.output, initialValue: t.initialValue, render() {
    const s = t.withGuide ?? h.withGuide, i = `${M(this.state)}  `, u = `${yt(this.state)}  `, n = W(t.output, t.message, u, i), o = `${s ? `${(0, import_node_util2.styleText)("gray", $)}
` : ""}${n}
`;
    switch (this.state) {
      case "submit": {
        const c2 = s ? `${(0, import_node_util2.styleText)("gray", $)}  ` : "", a = W(t.output, r(this.options[this.cursor], "selected"), c2);
        return `${o}${a}`;
      }
      case "cancel": {
        const c2 = s ? `${(0, import_node_util2.styleText)("gray", $)}  ` : "", a = W(t.output, r(this.options[this.cursor], "cancelled"), c2);
        return `${o}${a}${s ? `
${(0, import_node_util2.styleText)("gray", $)}` : ""}`;
      }
      default: {
        const c2 = s ? `${(0, import_node_util2.styleText)("cyan", $)}  ` : "", a = s ? (0, import_node_util2.styleText)("cyan", E2) : "", l = o.split(`
`).length, d2 = s ? 2 : 1;
        return `${o}${c2}${Y2({ output: t.output, cursor: this.cursor, options: this.options, maxItems: t.maxItems, columnPadding: c2.length, rowPadding: l + d2, style: (y, p2) => r(y, y.disabled ? "disabled" : p2 ? "active" : "inactive") }).join(`
${c2}`)}
${a}
`;
      }
    }
  } }).prompt();
};
var jt = `${(0, import_node_util2.styleText)("gray", $)}  `;
var Re = (t) => new ht({ validate: t.validate, placeholder: t.placeholder, defaultValue: t.defaultValue, initialValue: t.initialValue, output: t.output, signal: t.signal, input: t.input, render() {
  const r = t?.withGuide ?? h.withGuide, s = `${`${r ? `${(0, import_node_util2.styleText)("gray", $)}
` : ""}${M(this.state)}  `}${t.message}
`, i = t.placeholder ? (0, import_node_util2.styleText)("inverse", t.placeholder[0]) + (0, import_node_util2.styleText)("dim", t.placeholder.slice(1)) : (0, import_node_util2.styleText)(["inverse", "hidden"], "_"), u = this.userInput ? this.userInputWithCursor : i, n = this.value ?? "";
  switch (this.state) {
    case "error": {
      const o = this.error ? `  ${(0, import_node_util2.styleText)("yellow", this.error)}` : "", c2 = r ? `${(0, import_node_util2.styleText)("yellow", $)}  ` : "", a = r ? (0, import_node_util2.styleText)("yellow", E2) : "";
      return `${s.trim()}
${c2}${u}
${a}${o}
`;
    }
    case "submit": {
      const o = n ? `  ${(0, import_node_util2.styleText)("dim", n)}` : "", c2 = r ? (0, import_node_util2.styleText)("gray", $) : "";
      return `${s}${c2}${o}`;
    }
    case "cancel": {
      const o = n ? `  ${(0, import_node_util2.styleText)(["strikethrough", "dim"], n)}` : "", c2 = r ? (0, import_node_util2.styleText)("gray", $) : "";
      return `${s}${c2}${o}${n.trim() ? `
${c2}` : ""}`;
    }
    default: {
      const o = r ? `${(0, import_node_util2.styleText)("cyan", $)}  ` : "", c2 = r ? (0, import_node_util2.styleText)("cyan", E2) : "";
      return `${s}${o}${u}
${c2}
`;
    }
  }
} }).prompt();

// scripts/setup-workspace.ts
var import_child_process = require("child_process");
var import_fs = require("fs");
var import_os = require("os");
var import_path = require("path");
var import_meta = {};
var VAULT_REPO = "https://github.com/dodycode/obsidian-starter-vault.git";
function isCancel(value) {
  return q(value);
}
function exitCancel() {
  me("Operation cancelled.");
  process.exit(0);
}
var SYSTEM_DIRS = ["/", "/tmp", (0, import_path.resolve)("/tmp"), (0, import_os.homedir)(), (0, import_path.resolve)((0, import_os.homedir)())];
var PROJECT_INDICATORS = [
  ".git",
  "package.json",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "pyproject.toml",
  "composer.json",
  "Gemfile"
];
function isSystemDir(dirPath) {
  const resolved = (0, import_path.resolve)(dirPath);
  return SYSTEM_DIRS.includes(resolved);
}
function isProjectFolder(dirPath, existsSyncFn = import_fs.existsSync) {
  const resolved = (0, import_path.resolve)(dirPath);
  if (isSystemDir(resolved)) {
    return false;
  }
  return PROJECT_INDICATORS.some(
    (indicator) => existsSyncFn(`${resolved}/${indicator}`)
  );
}
function findProjectFolder(startPath, existsSyncFn = import_fs.existsSync) {
  let current = (0, import_path.resolve)(startPath);
  while (true) {
    if (isProjectFolder(current, existsSyncFn)) {
      return current;
    }
    const parent = (0, import_path.dirname)(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-/g, "_");
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}
function getEnvOrArg(key, args, env) {
  return args[key] || env[key.toUpperCase()];
}
function detectMode(args, env) {
  const projectPath = getEnvOrArg("project_path", args, env);
  if (projectPath) {
    return { mode: "existing", existingProjectPath: (0, import_path.resolve)(projectPath) };
  }
  return { mode: "new" };
}
function isNonInteractive(args, env) {
  return args.non_interactive === "true" || getEnvOrArg("project_path", args, env) !== void 0 || getEnvOrArg("workspace", args, env) !== void 0;
}
function resolveWorkspace(args, env, existingProjectPath, cwd) {
  const workspaceArg = getEnvOrArg("workspace", args, env);
  if (workspaceArg) {
    return (0, import_path.resolve)(workspaceArg);
  }
  if (existingProjectPath) {
    return `${(0, import_path.dirname)(existingProjectPath)}/${(0, import_path.basename)(existingProjectPath)}-workspace`;
  }
  return `${cwd}/my-project-workspace`;
}
function resolveProjectName(args, env, existingProjectPath) {
  const projectNameArg = getEnvOrArg("project_name", args, env);
  if (projectNameArg) {
    return projectNameArg;
  }
  if (existingProjectPath) {
    return (0, import_path.basename)(existingProjectPath);
  }
  return "my-app";
}
function resolveUserName(args, env) {
  const userNameArg = getEnvOrArg("user_name", args, env);
  if (userNameArg) {
    return userNameArg;
  }
  return env.USER || "dody";
}
function validateProjectName(name) {
  if (!name) return "Project name is required";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Only letters, digits, hyphen, underscore allowed";
  return;
}
function validateUserName(name) {
  if (!name) return "Name is required";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Only letters, digits, hyphen, underscore allowed";
  return;
}
function buildConfig(args, env, cwd) {
  const { mode, existingProjectPath } = detectMode(args, env);
  const nonInteractive = isNonInteractive(args, env);
  const workspace = resolveWorkspace(args, env, existingProjectPath, cwd);
  const projectName = resolveProjectName(args, env, existingProjectPath);
  const userName = resolveUserName(args, env);
  return {
    mode,
    existingProjectPath,
    workspace,
    projectName,
    userName,
    isNonInteractive: nonInteractive
  };
}
function executeSetup(config, deps) {
  const { mode, existingProjectPath, workspace, projectName, userName, isNonInteractive: isNonInteractive2 } = config;
  const exec2 = deps?.execSync ?? import_child_process.execSync;
  const mkdir = deps?.mkdirSync ?? import_fs.mkdirSync;
  const exists = deps?.existsSync ?? import_fs.existsSync;
  try {
    mkdir(workspace, { recursive: true });
    if (mode === "existing" && existingProjectPath) {
      exec2(`mv "${existingProjectPath}" "${workspace}/${projectName}"`, {
        stdio: "inherit"
      });
    }
    const vaultPath = `${workspace}/${projectName}-vault`;
    if (exists(vaultPath)) {
      exec2(`rm -rf "${vaultPath}"`, { stdio: "inherit" });
    }
    exec2(`git clone "${VAULT_REPO}" "${vaultPath}"`, {
      stdio: "inherit"
    });
    const installHooks = "Y";
    exec2(
      `cd "${vaultPath}/vault" && BOILERPLATE_USER="${userName}" PROJECT_NAME="${projectName}" INSTALL_HOOKS="${installHooks}" ./scripts/bootstrap.sh`,
      { stdio: "inherit" }
    );
  } catch (error) {
    throw new Error(`Setup failed: ${error}`);
  }
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = process.env;
  const projectPath = args.project_path || env.PROJECT_PATH;
  if (projectPath && !(0, import_fs.existsSync)((0, import_path.resolve)(projectPath))) {
    console.error(`Project path does not exist: ${projectPath}`);
    process.exit(1);
  }
  const config = buildConfig(args, env, process.cwd());
  if (!config.isNonInteractive) {
    ge("Obsidian Starter Vault \u2014 Workspace Setup");
    if (!config.existingProjectPath) {
      const detectedPath = findProjectFolder(process.cwd());
      let autoDetected = false;
      if (detectedPath) {
        const useDetected = await ue({
          message: `Detected project folder: ${detectedPath}
Use this folder?`,
          active: "Yes",
          inactive: "No"
        });
        if (isCancel(useDetected)) exitCancel();
        if (useDetected) {
          config.existingProjectPath = detectedPath;
          config.mode = "existing";
          config.workspace = `${(0, import_path.dirname)(detectedPath)}/${(0, import_path.basename)(detectedPath)}-workspace`;
          config.projectName = (0, import_path.basename)(detectedPath);
          autoDetected = true;
        }
      }
      if (!autoDetected) {
        const selectedMode = await Ee({
          message: "Do you have an existing project folder?",
          options: [
            {
              value: "existing",
              label: "Yes \u2014 I have an existing project folder",
              hint: "Moves your project into a new workspace alongside the vault"
            },
            {
              value: "new",
              label: "No \u2014 I'm starting fresh",
              hint: "Creates a workspace with the vault; you clone your app repo later"
            }
          ]
        });
        if (isCancel(selectedMode)) exitCancel();
        if (selectedMode === "existing") {
          const projectPath2 = await Re({
            message: "Path to your existing project folder:",
            placeholder: "/home/user/Projects/my-app",
            validate: (value) => {
              if (!value) return "Path is required";
              if (!(0, import_fs.existsSync)(value)) return "Directory does not exist";
              return;
            }
          });
          if (isCancel(projectPath2)) exitCancel();
          config.existingProjectPath = (0, import_path.resolve)(projectPath2);
          config.mode = "existing";
          config.workspace = `${(0, import_path.dirname)(config.existingProjectPath)}/${(0, import_path.basename)(config.existingProjectPath)}-workspace`;
          config.projectName = (0, import_path.basename)(config.existingProjectPath);
        }
      }
    }
    if (!args.workspace && !env.WORKSPACE) {
      const workspacePath = await Re({
        message: "Where should the workspace be created?",
        placeholder: config.workspace,
        defaultValue: config.workspace
      });
      if (isCancel(workspacePath)) exitCancel();
      config.workspace = (0, import_path.resolve)(workspacePath || config.workspace);
    }
    if (!args.project_name && !env.PROJECT_NAME) {
      const nameInput = await Re({
        message: "Project name (used for worktree naming):",
        placeholder: config.projectName,
        defaultValue: config.projectName,
        validate: validateProjectName
      });
      if (isCancel(nameInput)) exitCancel();
      config.projectName = nameInput || config.projectName;
    }
    if (!args.user_name && !env.USER_NAME) {
      const nameInput = await Re({
        message: "Your short name:",
        placeholder: config.userName,
        defaultValue: config.userName,
        validate: validateUserName
      });
      if (isCancel(nameInput)) exitCancel();
      config.userName = nameInput || config.userName;
    }
    if ((0, import_fs.existsSync)(config.workspace)) {
      const overwrite = await ue({
        message: `Directory ${config.workspace} already exists. Continue?`,
        active: "Yes",
        inactive: "No"
      });
      if (isCancel(overwrite) || !overwrite) exitCancel();
    }
    R2.info("Preview:");
    if (config.mode === "existing" && config.existingProjectPath) {
      R2.info(`  Workspace: ${config.workspace}`);
      R2.info(
        `  Project:   ${config.workspace}/${config.projectName} (moved from ${config.existingProjectPath})`
      );
      R2.info(`  Vault:     ${config.workspace}/${config.projectName}-vault`);
    } else {
      R2.info(`  Workspace: ${config.workspace}`);
      R2.info(`  Vault:     ${config.workspace}/${config.projectName}-vault`);
      R2.info(
        `  Project:   ${config.workspace}/${config.projectName} (clone your app repo here later)`
      );
    }
    const confirmed = await ue({
      message: "Create workspace?",
      active: "Yes",
      inactive: "No"
    });
    if (isCancel(confirmed) || !confirmed) exitCancel();
  }
  let s = null;
  if (!config.isNonInteractive) {
    s = ft();
    s.start("Creating workspace...");
  } else {
    console.log("Creating workspace...");
  }
  try {
    executeSetup(config);
    if (s) {
      s.stop("Workspace created successfully!");
    } else {
      console.log("Workspace created successfully!");
    }
  } catch (error) {
    if (s) {
      s.stop("Failed to create workspace");
    } else {
      console.error("Failed to create workspace");
    }
    R2.error(String(error));
    process.exit(1);
  }
  if (!config.isNonInteractive) {
    ye("Next steps:");
    console.log(`  1. Open the vault in Obsidian: ${config.workspace}/${config.projectName}-vault`);
    console.log(`  2. Start a Claude session: cd ${config.workspace}/${config.projectName}-vault && claude`);
    if (config.mode === "new") {
      console.log(
        `  3. Clone your app repo: cd ${config.workspace} && git clone <url> ${config.projectName}`
      );
    }
  }
}
var isMainModule = typeof require !== "undefined" && require.main === module;
var isMainESM = typeof import_meta.url !== "undefined" && import_meta.url === `file://${process.argv[1]}`;
if (isMainModule || isMainESM) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VAULT_REPO,
  buildConfig,
  detectMode,
  executeSetup,
  findProjectFolder,
  getEnvOrArg,
  isNonInteractive,
  isProjectFolder,
  parseArgs,
  resolveProjectName,
  resolveUserName,
  resolveWorkspace,
  validateProjectName,
  validateUserName
});
