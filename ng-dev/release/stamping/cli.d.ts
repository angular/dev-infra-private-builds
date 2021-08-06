/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
import { EnvStampMode } from './env-stamp';
export interface Options {
    mode: EnvStampMode;
}
/** CLI command module for building the environment stamp. */
export declare const BuildEnvStampCommand: CommandModule<{}, Options>;
