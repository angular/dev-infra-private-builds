/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgDevConfig } from '../utils/config.js';
/** Configuration for commit-message comands. */
export interface CommitMessageConfig {
    maxLineLength: number;
    minBodyLength: number;
    minBodyLengthTypeExcludes?: string[];
    scopes: string[];
}
/** Assert the provided config contains a `CommitMessageConfig`. */
export declare function assertValidCommitMessageConfig<T extends NgDevConfig>(config: T & Partial<{
    commitMessage: CommitMessageConfig;
}>): asserts config is T & {
    commitMessage: CommitMessageConfig;
};
/** Scope requirement level to be set for each commit type. */
export declare enum ScopeRequirement {
    Required = 0,
    Optional = 1,
    Forbidden = 2
}
export declare enum ReleaseNotesLevel {
    Hidden = 0,
    Visible = 1
}
/** A commit type */
export interface CommitType {
    description: string;
    name: string;
    scope: ScopeRequirement;
    releaseNotesLevel: ReleaseNotesLevel;
}
/** The valid commit types for Angular commit messages. */
export declare const COMMIT_TYPES: {
    [key: string]: CommitType;
};
