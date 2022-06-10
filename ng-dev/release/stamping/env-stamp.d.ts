/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare type EnvStampMode = 'snapshot' | 'release';
/** Log the environment variables expected by Bazel for stamping. */
export declare function buildEnvStamp(mode: EnvStampMode, includeVersion: boolean): Promise<void>;
