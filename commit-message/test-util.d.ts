/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/test-util" />
/** The parts that make up a commit message for creating a commit message string. */
export interface CommitMessageParts {
    prefix: string;
    type: string;
    npmScope: string;
    scope: string;
    summary: string;
    body: string;
    footer: string;
}
/**
 * Generate a commit message builder function, using the provided defaults.
 */
export declare function commitMessageBuilder(defaults: CommitMessageParts): (params?: Partial<CommitMessageParts>) => string;
