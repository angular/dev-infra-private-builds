/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/config" />
import { NgDevConfig } from '../utils/config';
export interface CommitMessageConfig {
    maxLineLength: number;
    minBodyLength: number;
    types: string[];
    scopes: string[];
}
/** Retrieve and validate the config as `CommitMessageConfig`. */
export declare function getCommitMessageConfig(): Required<Partial<NgDevConfig<{
    commitMessage: CommitMessageConfig;
}>>>;
