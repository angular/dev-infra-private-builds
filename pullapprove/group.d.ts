/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pullapprove/group" />
import { PullApproveGroupConfig } from './parse-yaml';
/** A condition for a group. */
interface GroupCondition {
    expression: string;
    checkFn: (files: string[], groups: PullApproveGroup[]) => boolean;
    matchedFiles: Set<string>;
    unverifiable: boolean;
}
interface GroupReviewers {
    users?: string[];
    teams?: string[];
}
/** Result of testing files against the group. */
export interface PullApproveGroupResult {
    groupName: string;
    matchedConditions: GroupCondition[];
    matchedCount: number;
    unmatchedConditions: GroupCondition[];
    unmatchedCount: number;
    unverifiableConditions: GroupCondition[];
}
/** A PullApprove group to be able to test files against. */
export declare class PullApproveGroup {
    groupName: string;
    readonly precedingGroups: PullApproveGroup[];
    /** List of conditions for the group. */
    readonly conditions: GroupCondition[];
    /** List of reviewers for the group. */
    readonly reviewers: GroupReviewers;
    constructor(groupName: string, config: PullApproveGroupConfig, precedingGroups?: PullApproveGroup[]);
    private _captureConditions;
    /**
     * Tests a provided file path to determine if it would be considered matched by
     * the pull approve group's conditions.
     */
    testFile(filePath: string): boolean;
    /** Retrieve the results for the Group, all matched and unmatched conditions. */
    getResults(): PullApproveGroupResult;
}
export {};
