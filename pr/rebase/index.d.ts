/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/rebase" />
import { NgDevConfig } from '../../utils/config';
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export declare function rebasePr(prNumber: number, githubToken: string, config?: Pick<NgDevConfig, 'github'>): Promise<void>;
