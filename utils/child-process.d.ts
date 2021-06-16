/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/child-process" />
/// <reference types="node" />
import { SpawnOptions } from 'child_process';
/** Interface describing the options for spawning a process. */
export interface SpawnedProcessOptions extends Omit<SpawnOptions, 'stdio'> {
    /** Console output mode. Defaults to "enabled". */
    mode?: 'enabled' | 'silent' | 'on-error';
}
/** Interface describing the result of a spawned process. */
export interface SpawnedProcessResult {
    /** Captured stdout in string format. */
    stdout: string;
    /** Captured stderr in string format. */
    stderr: string;
}
/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
export declare function spawnInteractiveCommand(command: string, args: string[], options?: Omit<SpawnOptions, 'stdio'>): Promise<void>;
/**
 * Spawns a given command with the specified arguments inside a shell. All process stdout
 * output is captured and returned as resolution on completion. Depending on the chosen
 * output mode, stdout/stderr output is also printed to the console, or only on error.
 *
 * @returns a Promise resolving with captured stdout and stderr on success. The promise
 *   rejects on command failure.
 */
export declare function spawnWithDebugOutput(command: string, args: string[], options?: SpawnedProcessOptions): Promise<SpawnedProcessResult>;
