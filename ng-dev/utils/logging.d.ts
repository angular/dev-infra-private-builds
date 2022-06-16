/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChalkInstance } from 'chalk';
import { Arguments } from 'yargs';
/**
 * Supported levels for logging functions. Levels are mapped to
 * numbers to represent a hierarchy of logging levels.
 */
export declare enum LogLevel {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    LOG = 3,
    INFO = 4,
    DEBUG = 5
}
/** Default log level for the tool. */
export declare const DEFAULT_LOG_LEVEL = LogLevel.INFO;
/** Reexport of chalk colors for convenient access. */
export declare const red: ChalkInstance;
export declare const reset: ChalkInstance;
export declare const green: ChalkInstance;
export declare const yellow: ChalkInstance;
export declare const bold: ChalkInstance;
export declare const blue: ChalkInstance;
/** Class used for logging to the console and to a ng-dev log file. */
export declare abstract class Log {
    /** Write to the console for at INFO logging level */
    static info: {
        (...values: unknown[]): void;
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        group(label: string, collapsed?: boolean): void;
        /** End the group at the LOG_LEVEL. */
        groupEnd(): void;
    };
    /** Write to the console for at ERROR logging level */
    static error: {
        (...values: unknown[]): void;
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        group(label: string, collapsed?: boolean): void;
        /** End the group at the LOG_LEVEL. */
        groupEnd(): void;
    };
    /** Write to the console for at DEBUG logging level */
    static debug: {
        (...values: unknown[]): void;
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        group(label: string, collapsed?: boolean): void;
        /** End the group at the LOG_LEVEL. */
        groupEnd(): void;
    };
    /** Write to the console for at LOG logging level */
    static log: {
        (...values: unknown[]): void;
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        group(label: string, collapsed?: boolean): void;
        /** End the group at the LOG_LEVEL. */
        groupEnd(): void;
    };
    /** Write to the console for at WARN logging level */
    static warn: {
        (...values: unknown[]): void;
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        group(label: string, collapsed?: boolean): void;
        /** End the group at the LOG_LEVEL. */
        groupEnd(): void;
    };
}
/**
 * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
 * command execution, containing information about the timing and command parameters.
 *
 * This is expected to be called only once during a command run, and should be called by the
 * middleware of yargs to enable the file logging before the rest of the command parsing and
 * response is executed.
 */
export declare function captureLogOutputForCommand(argv: Arguments): Promise<void>;
