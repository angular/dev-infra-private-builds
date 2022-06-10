/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReleaseConfig } from '../config/index.js';
import { ActiveReleaseTrains } from './active-release-trains.js';
/**
 * Prints the active release trains to the console.
 * @params active Active release trains that should be printed.
 * @params config Release configuration used for querying NPM on published versions.
 */
export declare function printActiveReleaseTrains(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<void>;
