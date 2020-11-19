/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/print-active-trains" />
import { ReleaseConfig } from '../config/index';
import { ActiveReleaseTrains } from './active-release-trains';
/**
 * Prints the active release trains to the console.
 * @params active Active release trains that should be printed.
 * @params config Release configuration used for querying NPM on published versions.
 */
export declare function printActiveReleaseTrains(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<void>;
