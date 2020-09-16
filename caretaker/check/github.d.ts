/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/github" />
import { GitClient } from '../../utils/git';
import { CaretakerConfig } from '../config';
/** Retrieve the number of matching issues for each github query. */
export declare function printGithubTasks(git: GitClient, config?: CaretakerConfig): Promise<void>;
