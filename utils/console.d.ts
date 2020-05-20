/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/console" />
import chalk from 'chalk';
/** Reexport of chalk colors for convenient access. */
export declare const red: typeof chalk;
export declare const green: typeof chalk;
export declare const yellow: typeof chalk;
/** Prompts the user with a confirmation question and a specified message. */
export declare function promptConfirm(message: string, defaultValue?: boolean): Promise<boolean>;
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
export declare function info(...text: string[]): void;
export declare function info(color: typeof chalk, ...text: string[]): void;
/** Write to the console for at ERROR logging level */
export declare function error(...text: string[]): void;
export declare function error(color: typeof chalk, ...text: string[]): void;
/** Write to the console for at DEBUG logging level */
export declare function debug(...text: string[]): void;
export declare function debug(color: typeof chalk, ...text: string[]): void;
/** Write to the console for at LOG logging level */
export declare function log(...text: string[]): void;
export declare function log(color: typeof chalk, ...text: string[]): void;
/** Write to the console for at WARN logging level */
export declare function warn(...text: string[]): void;
export declare function warn(color: typeof chalk, ...text: string[]): void;
