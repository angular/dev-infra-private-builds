/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/console" />
import * as chalk from 'chalk';
import { Arguments } from 'yargs';
/** Reexport of chalk colors for convenient access. */
export declare const red: chalk.Chalk;
export declare const green: chalk.Chalk;
export declare const yellow: chalk.Chalk;
export declare const bold: chalk.Chalk;
export declare const blue: chalk.Chalk;
/** Prompts the user with a confirmation question and a specified message. */
export declare function promptConfirm(message: string, defaultValue?: boolean): Promise<boolean>;
/** Prompts the user for one line of input. */
export declare function promptInput(message: string): Promise<string>;
/**
 * Supported levels for logging functions.
 *
 * Levels are mapped to numbers to represent a hierarchy of logging levels.
 */
export declare enum LOG_LEVELS {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    LOG = 3,
    INFO = 4,
    DEBUG = 5
}
/** Default log level for the tool. */
export declare const DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;
/** Write to the console for at INFO logging level */
export declare const info: {
    (...text: string[]): void;
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    group(text: string, collapsed?: boolean): void;
    /** End the group at the LOG_LEVEL. */
    groupEnd(): void;
};
/** Write to the console for at ERROR logging level */
export declare const error: {
    (...text: string[]): void;
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    group(text: string, collapsed?: boolean): void;
    /** End the group at the LOG_LEVEL. */
    groupEnd(): void;
};
/** Write to the console for at DEBUG logging level */
export declare const debug: {
    (...text: string[]): void;
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    group(text: string, collapsed?: boolean): void;
    /** End the group at the LOG_LEVEL. */
    groupEnd(): void;
};
/** Write to the console for at LOG logging level */
export declare const log: {
    (...text: string[]): void;
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    group(text: string, collapsed?: boolean): void;
    /** End the group at the LOG_LEVEL. */
    groupEnd(): void;
};
/** Write to the console for at WARN logging level */
export declare const warn: {
    (...text: string[]): void;
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    group(text: string, collapsed?: boolean): void;
    /** End the group at the LOG_LEVEL. */
    groupEnd(): void;
};
/**
 * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
 * command execution, containing information about the timing and command parameters.
 *
 * This is expected to be called only once during a command run, and should be called by the
 * middleware of yargs to enable the file logging before the rest of the command parsing and
 * response is executed.
 */
export declare function captureLogOutputForCommand(argv: Arguments): void;
