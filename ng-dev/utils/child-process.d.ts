/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import { SpawnOptions as _SpawnOptions, SpawnSyncOptions as _SpawnSyncOptions } from 'child_process';
/** Interface describing the options for spawning a process synchronously. */
export interface SpawnSyncOptions extends Omit<_SpawnSyncOptions, 'shell' | 'stdio'> {
    /** Whether to prevent exit codes being treated as failures. */
    suppressErrorOnFailingExitCode?: boolean;
}
/** Interface describing the options for spawning a process. */
export interface SpawnOptions extends Omit<_SpawnOptions, 'shell' | 'stdio'> {
    /** Console output mode. Defaults to "enabled". */
    mode?: 'enabled' | 'silent' | 'on-error';
    /** Whether to prevent exit codes being treated as failures. */
    suppressErrorOnFailingExitCode?: boolean;
}
/** Interface describing the options for spawning an interactive process. */
export declare type SpawnInteractiveCommandOptions = Omit<_SpawnOptions, 'shell' | 'stdio'>;
/** Interface describing the result of a spawned process. */
export interface SpawnResult {
    /** Captured stdout in string format. */
    stdout: string;
    /** Captured stderr in string format. */
    stderr: string;
    /** The exit code or signal of the process. */
    status: number | NodeJS.Signals;
}
/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
export declare function spawnInteractive(command: string, args: string[], options?: SpawnInteractiveCommandOptions): Promise<void>;
/**
 * Spawns a given command with the specified arguments inside a shell. All process stdout
 * output is captured and returned as resolution on completion. Depending on the chosen
 * output mode, stdout/stderr output is also printed to the console, or only on error.
 *
 * @returns a Promise resolving with captured stdout and stderr on success. The promise
 *   rejects on command failure.
 */
export declare function spawn(command: string, args: string[], options?: SpawnOptions): Promise<SpawnResult>;
/**
 * Spawns a given command with the specified arguments inside a shell synchronously.
 *
 * @returns The command's stdout and stderr.
 */
export declare function spawnSync(command: string, args: string[], options?: SpawnSyncOptions): SpawnResult;
