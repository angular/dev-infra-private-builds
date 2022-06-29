
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);

import {
  __esm,
  __export
} from "./chunk-X3O2C2F5.mjs";

// node_modules/supports-color/index.js
var supports_color_exports = {};
__export(supports_color_exports, {
  createSupportsColor: () => createSupportsColor2,
  default: () => supports_color_default2
});
import process3 from "process";
import os2 from "os";
import tty2 from "tty";
function hasFlag2(flag, argv = process3.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
function envForceColor2() {
  if ("FORCE_COLOR" in env2) {
    if (env2.FORCE_COLOR === "true") {
      return 1;
    }
    if (env2.FORCE_COLOR === "false") {
      return 0;
    }
    return env2.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env2.FORCE_COLOR, 10), 3);
  }
}
function translateLevel2(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor2(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor2();
  if (noFlagForceColor !== void 0) {
    flagForceColor2 = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor2 : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env2.TERM === "dumb") {
    return min;
  }
  if (process3.platform === "win32") {
    const osRelease = os2.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env2) {
    if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE", "DRONE"].some((sign) => sign in env2) || env2.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env2) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env2.TEAMCITY_VERSION) ? 1 : 0;
  }
  if ("TF_BUILD" in env2 && "AGENT_NAME" in env2) {
    return 1;
  }
  if (env2.COLORTERM === "truecolor") {
    return 3;
  }
  if ("TERM_PROGRAM" in env2) {
    const version = Number.parseInt((env2.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env2.TERM_PROGRAM) {
      case "iTerm.app":
        return version >= 3 ? 3 : 2;
      case "Apple_Terminal":
        return 2;
    }
  }
  if (/-256(color)?$/i.test(env2.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env2.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env2) {
    return 1;
  }
  return min;
}
function createSupportsColor2(stream, options = {}) {
  const level = _supportsColor2(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel2(level);
}
var env2, flagForceColor2, supportsColor2, supports_color_default2;
var init_supports_color = __esm({
  "node_modules/supports-color/index.js"() {
    ({ env: env2 } = process3);
    if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
      flagForceColor2 = 0;
    } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
      flagForceColor2 = 1;
    }
    supportsColor2 = {
      stdout: createSupportsColor2({ isTTY: tty2.isatty(1) }),
      stderr: createSupportsColor2({ isTTY: tty2.isatty(2) })
    };
    supports_color_default2 = supportsColor2;
  }
});

// node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red2, green2, blue2) => `\x1B[${38 + offset};2;${red2};${green2};${blue2}m`;
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  const styles2 = {
    modifier: {
      reset: [0, 0],
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      overline: [53, 55],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29]
    },
    color: {
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],
      blackBright: [90, 39],
      redBright: [91, 39],
      greenBright: [92, 39],
      yellowBright: [93, 39],
      blueBright: [94, 39],
      magentaBright: [95, 39],
      cyanBright: [96, 39],
      whiteBright: [97, 39]
    },
    bgColor: {
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],
      bgBlackBright: [100, 49],
      bgRedBright: [101, 49],
      bgGreenBright: [102, 49],
      bgYellowBright: [103, 49],
      bgBlueBright: [104, 49],
      bgMagentaBright: [105, 49],
      bgCyanBright: [106, 49],
      bgWhiteBright: [107, 49]
    }
  };
  styles2.color.gray = styles2.color.blackBright;
  styles2.bgColor.bgGray = styles2.bgColor.bgBlackBright;
  styles2.color.grey = styles2.color.blackBright;
  styles2.bgColor.bgGrey = styles2.bgColor.bgBlackBright;
  for (const [groupName, group] of Object.entries(styles2)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles2[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles2[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles2, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles2, "codes", {
    value: codes,
    enumerable: false
  });
  styles2.color.close = "\x1B[39m";
  styles2.bgColor.close = "\x1B[49m";
  styles2.color.ansi = wrapAnsi16();
  styles2.color.ansi256 = wrapAnsi256();
  styles2.color.ansi16m = wrapAnsi16m();
  styles2.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles2.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles2.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles2, {
    rgbToAnsi256: {
      value: (red2, green2, blue2) => {
        if (red2 === green2 && green2 === blue2) {
          if (red2 < 8) {
            return 16;
          }
          if (red2 > 248) {
            return 231;
          }
          return Math.round((red2 - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red2 / 255 * 5) + 6 * Math.round(green2 / 255 * 5) + Math.round(blue2 / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value: (hex) => {
        const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let { colorString } = matches.groups;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles2.rgbToAnsi256(...styles2.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value: (code) => {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red2;
        let green2;
        let blue2;
        if (code >= 232) {
          red2 = ((code - 232) * 10 + 8) / 255;
          green2 = red2;
          blue2 = red2;
        } else {
          code -= 16;
          const remainder = code % 36;
          red2 = Math.floor(code / 36) / 5;
          green2 = Math.floor(remainder / 6) / 5;
          blue2 = remainder % 6 / 5;
        }
        const value = Math.max(red2, green2, blue2) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue2) << 2 | Math.round(green2) << 1 | Math.round(red2));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red2, green2, blue2) => styles2.ansi256ToAnsi(styles2.rgbToAnsi256(red2, green2, blue2)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles2.ansi256ToAnsi(styles2.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles2;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/chalk/source/vendor/supports-color/index.js
import process2 from "process";
import os from "os";
import tty from "tty";
function hasFlag(flag, argv = process2.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
var { env } = process2;
var flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
  flagForceColor = 0;
} else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (process2.platform === "win32") {
    const osRelease = os.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app":
        return version >= 3 ? 3 : 2;
      case "Apple_Terminal":
        return 2;
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
  stderr: createSupportsColor({ isTTY: tty.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles[model] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles[bgModel] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// bazel-out/k8-fastbuild/bin/ng-dev/utils/logging.js
import { writeFileSync } from "fs";
import { join } from "path";

// bazel-out/k8-fastbuild/bin/ng-dev/utils/child-process.js
init_supports_color();
import { spawn as _spawn, spawnSync as _spawnSync } from "child_process";
var ChildProcess = class {
  static spawnInteractive(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const commandText = `${command} ${args.join(" ")}`;
      Log.debug(`Executing command: ${commandText}`);
      const childProcess = _spawn(command, args, { ...options, shell: true, stdio: "inherit" });
      childProcess.on("close", (status) => status === 0 ? resolve() : reject(status));
    });
  }
  static spawn(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const commandText = `${command} ${args.join(" ")}`;
      const outputMode = options.mode;
      const env3 = getEnvironmentForNonInteractiveSpawn(options.env);
      Log.debug(`Executing command: ${commandText}`);
      const childProcess = _spawn(command, args, { ...options, env: env3, shell: true, stdio: "pipe" });
      let logOutput = "";
      let stdout = "";
      let stderr = "";
      if (options.input !== void 0) {
        childProcess.stdin.write(options.input);
        childProcess.stdin.end();
      }
      childProcess.stderr.on("data", (message) => {
        stderr += message;
        logOutput += message;
        if (outputMode === void 0 || outputMode === "enabled") {
          process.stderr.write(message);
        }
      });
      childProcess.stdout.on("data", (message) => {
        stdout += message;
        logOutput += message;
        if (outputMode === void 0 || outputMode === "enabled") {
          process.stderr.write(message);
        }
      });
      childProcess.on("close", (exitCode, signal) => {
        const exitDescription = exitCode !== null ? `exit code "${exitCode}"` : `signal "${signal}"`;
        const printFn = outputMode === "on-error" ? Log.error : Log.debug;
        const status = statusFromExitCodeAndSignal(exitCode, signal);
        printFn(`Command "${commandText}" completed with ${exitDescription}.`);
        printFn(`Process output: 
${logOutput}`);
        if (status === 0 || options.suppressErrorOnFailingExitCode) {
          resolve({ stdout, stderr, status });
        } else {
          reject(outputMode === "silent" ? logOutput : void 0);
        }
      });
    });
  }
  static spawnSync(command, args, options = {}) {
    const commandText = `${command} ${args.join(" ")}`;
    const env3 = getEnvironmentForNonInteractiveSpawn(options.env);
    Log.debug(`Executing command: ${commandText}`);
    const { status: exitCode, signal, stdout, stderr } = _spawnSync(command, args, { ...options, env: env3, encoding: "utf8", shell: true, stdio: "pipe" });
    const status = statusFromExitCodeAndSignal(exitCode, signal);
    if (status === 0 || options.suppressErrorOnFailingExitCode) {
      return { status, stdout, stderr };
    }
    throw new Error(stderr);
  }
};
function statusFromExitCodeAndSignal(exitCode, signal) {
  return exitCode ?? signal ?? -1;
}
function getEnvironmentForNonInteractiveSpawn(userProvidedEnv) {
  const forceColorValue = supports_color_default2.stdout !== false ? supports_color_default2.stdout.level.toString() : void 0;
  return { FORCE_COLOR: forceColorValue, ...userProvidedEnv ?? process.env };
}

// bazel-out/k8-fastbuild/bin/ng-dev/utils/repo-directory.js
function determineRepoBaseDirFromCwd() {
  const { stdout, stderr, status } = ChildProcess.spawnSync("git", ["rev-parse --show-toplevel"]);
  if (status !== 0) {
    throw Error(`Unable to find the path to the base directory of the repository.
Was the command run from inside of the repo?

${stderr}`);
  }
  return stdout.trim();
}

// bazel-out/k8-fastbuild/bin/ng-dev/utils/logging.js
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["SILENT"] = 0] = "SILENT";
  LogLevel2[LogLevel2["ERROR"] = 1] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["LOG"] = 3] = "LOG";
  LogLevel2[LogLevel2["INFO"] = 4] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 5] = "DEBUG";
})(LogLevel || (LogLevel = {}));
var DEFAULT_LOG_LEVEL = LogLevel.INFO;
var red = source_default.red;
var reset = source_default.reset;
var green = source_default.green;
var yellow = source_default.yellow;
var bold = source_default.bold;
var blue = source_default.blue;
var Log = class {
};
Log.info = buildLogLevelFunction(() => console.info, LogLevel.INFO, null);
Log.error = buildLogLevelFunction(() => console.error, LogLevel.ERROR, source_default.red);
Log.debug = buildLogLevelFunction(() => console.debug, LogLevel.DEBUG, null);
Log.log = buildLogLevelFunction(() => console.log, LogLevel.LOG, null);
Log.warn = buildLogLevelFunction(() => console.warn, LogLevel.WARN, source_default.yellow);
function buildLogLevelFunction(loadCommand, level, defaultColor) {
  const loggingFunction = (...values) => {
    runConsoleCommand(loadCommand, level, ...values.map((v) => typeof v === "string" && defaultColor ? defaultColor(v) : v));
  };
  loggingFunction.group = (label, collapsed = false) => {
    const command = collapsed ? console.groupCollapsed : console.group;
    runConsoleCommand(() => command, level, defaultColor ? defaultColor(label) : label);
  };
  loggingFunction.groupEnd = () => {
    runConsoleCommand(() => console.groupEnd, level);
  };
  return loggingFunction;
}
function runConsoleCommand(loadCommand, logLevel, ...text) {
  if (getLogLevel() >= logLevel) {
    loadCommand()(...text);
  }
  printToLogFile(logLevel, ...text);
}
function getLogLevel() {
  const logLevelEnvValue = (process.env[`LOG_LEVEL`] || "").toUpperCase();
  const logLevel = LogLevel[logLevelEnvValue];
  if (logLevel === void 0) {
    return DEFAULT_LOG_LEVEL;
  }
  return logLevel;
}
var LOGGED_TEXT = "";
var FILE_LOGGING_ENABLED = false;
var LOG_LEVEL_COLUMNS = 7;
async function captureLogOutputForCommand(argv) {
  if (FILE_LOGGING_ENABLED) {
    throw Error("`captureLogOutputForCommand` cannot be called multiple times");
  }
  const repoDir = determineRepoBaseDirFromCwd();
  const now = new Date();
  const headerLine = Array(100).fill("#").join("");
  LOGGED_TEXT += `${headerLine}
Command: ${argv.$0} ${argv._.join(" ")}
Ran at: ${now}
`;
  process.on("exit", (code) => {
    LOGGED_TEXT += `${headerLine}
`;
    LOGGED_TEXT += `Command ran in ${new Date().getTime() - now.getTime()}ms
`;
    LOGGED_TEXT += `Exit Code: ${code}
`;
    const logFilePath = join(repoDir, ".ng-dev.log");
    LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, "");
    writeFileSync(logFilePath, LOGGED_TEXT);
    if (code > 1) {
      const logFileName = `.ng-dev.err-${now.getTime()}.log`;
      console.error(`Exit code: ${code}. Writing full log to ${logFileName}`);
      writeFileSync(join(repoDir, logFileName), LOGGED_TEXT);
    }
  });
  FILE_LOGGING_ENABLED = true;
}
function printToLogFile(logLevel, ...text) {
  const logLevelText = `${LogLevel[logLevel]}:`.padEnd(LOG_LEVEL_COLUMNS);
  LOGGED_TEXT += text.join(" ").split("\n").map((l) => `${logLevelText} ${l}
`).join("");
}

// bazel-out/k8-fastbuild/bin/ng-dev/utils/config.js
import { pathToFileURL } from "url";
import { join as join2 } from "path";

// bazel-out/k8-fastbuild/bin/ng-dev/utils/config-cache.js
var cachedConfig = null;
function setCachedConfig(config) {
  cachedConfig = config;
}
function getCachedConfig() {
  return cachedConfig;
}

// bazel-out/k8-fastbuild/bin/ng-dev/utils/config.js
var CONFIG_FILE_PATH = ".ng-dev/config.mjs";
var USER_CONFIG_FILE_PATH = ".ng-dev.user";
var userConfig = null;
var setConfig = setCachedConfig;
async function getConfig(baseDirOrAssertions) {
  let cachedConfig2 = getCachedConfig();
  if (cachedConfig2 === null) {
    let baseDir;
    if (typeof baseDirOrAssertions === "string") {
      baseDir = baseDirOrAssertions;
    } else {
      baseDir = determineRepoBaseDirFromCwd();
    }
    const configPath = join2(baseDir, CONFIG_FILE_PATH);
    cachedConfig2 = await readConfigFile(configPath);
    setCachedConfig(cachedConfig2);
  }
  if (Array.isArray(baseDirOrAssertions)) {
    for (const assertion of baseDirOrAssertions) {
      assertion(cachedConfig2);
    }
  }
  return { ...cachedConfig2, __isNgDevConfigObject: true };
}
async function getUserConfig() {
  if (userConfig === null) {
    const configPath = join2(determineRepoBaseDirFromCwd(), USER_CONFIG_FILE_PATH);
    userConfig = await readConfigFile(configPath, true);
  }
  return { ...userConfig };
}
var ConfigValidationError = class extends Error {
  constructor(message, errors = []) {
    super(message);
    this.errors = errors;
  }
};
function assertValidGithubConfig(config) {
  const errors = [];
  if (config.github === void 0) {
    errors.push(`Github repository not configured. Set the "github" option.`);
  } else {
    if (config.github.name === void 0) {
      errors.push(`"github.name" is not defined`);
    }
    if (config.github.owner === void 0) {
      errors.push(`"github.owner" is not defined`);
    }
  }
  if (errors.length) {
    throw new ConfigValidationError("Invalid `github` configuration", errors);
  }
}
async function readConfigFile(configPath, returnEmptyObjectOnError = false) {
  try {
    return await import(pathToFileURL(configPath).toString());
  } catch (e) {
    if (returnEmptyObjectOnError) {
      Log.debug(`Could not read configuration file at ${configPath}, returning empty object instead.`);
      Log.debug(e);
      return {};
    }
    Log.error(`Could not read configuration file at ${configPath}.`);
    Log.error(e);
    process.exit(1);
  }
}

// bazel-out/k8-fastbuild/bin/ng-dev/release/config/index.js
function assertValidReleaseConfig(config) {
  const errors = [];
  if (config.release === void 0) {
    throw new ConfigValidationError("No configuration provided for `release`");
  }
  if (config.release.representativeNpmPackage === void 0) {
    errors.push(`No "representativeNpmPackage" configured for releasing.`);
  }
  if (config.release.npmPackages === void 0) {
    errors.push(`No "npmPackages" configured for releasing.`);
  }
  if (config.release.buildPackages === void 0) {
    errors.push(`No "buildPackages" function configured for releasing.`);
  }
  if (config.release.representativeNpmPackage && config.release.npmPackages) {
    const representativePkgEntry = config.release.npmPackages.find((pkg) => {
      var _a;
      return pkg.name === ((_a = config.release) == null ? void 0 : _a.representativeNpmPackage);
    });
    if (representativePkgEntry === void 0) {
      errors.push(`Configured "representativeNpmPackage" (${representativePkgEntry}) does not match a package in "npmPackages".`);
    } else if (representativePkgEntry.experimental) {
      errors.push(`Configured "representativeNpmPackage" (${representativePkgEntry}) corresponds to an experimental package. The representative NPM package is expected to be a long-standing and non-experimental package of the project.`);
    }
  }
  if (errors.length) {
    throw new ConfigValidationError("Invalid `release` configuration", errors);
  }
}

export {
  supports_color_exports,
  init_supports_color,
  ChildProcess,
  determineRepoBaseDirFromCwd,
  LogLevel,
  DEFAULT_LOG_LEVEL,
  red,
  reset,
  green,
  yellow,
  bold,
  blue,
  Log,
  captureLogOutputForCommand,
  setConfig,
  getConfig,
  getUserConfig,
  ConfigValidationError,
  assertValidGithubConfig,
  assertValidReleaseConfig
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=chunk-XBLHPK6F.mjs.map
