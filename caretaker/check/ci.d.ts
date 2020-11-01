/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/ci" />
import { GitClient } from '../../utils/git/index';
/** Retrieve and log status of CI for the project. */
export declare function printCiStatus(git: GitClient): Promise<void>;
