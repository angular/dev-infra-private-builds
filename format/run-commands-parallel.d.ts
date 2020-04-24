/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/run-commands-parallel" />
declare type CallbackFunction = (file: string, code?: number, stdout?: string, stderr?: string) => void;
/**
 * Run the provided commands in parallel for each provided file.
 *
 * A promise is returned, completed when the command has completed running for each file.
 */
export declare function runInParallel(providedFiles: string[], cmd: string, callback: CallbackFunction): Promise<void>;
export {};
