/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/g3" />
import { GitClient } from '../../utils/git';
/** Compare the upstream master to the upstream g3 branch, if it exists. */
export declare function printG3Comparison(git: GitClient): Promise<void>;
