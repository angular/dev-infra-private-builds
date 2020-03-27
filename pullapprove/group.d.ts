/// <amd-module name="@angular/dev-infra-private/pullapprove/group" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { IMinimatch } from 'minimatch';
import { PullApproveGroupConfig } from './parse-yaml';
/** A condition for a group. */
interface GroupCondition {
    glob: string;
    matcher: IMinimatch;
    matchedFiles: Set<string>;
}
/** Result of testing files against the group. */
export interface PullApproveGroupResult {
    groupName: string;
    matchedIncludes: GroupCondition[];
    matchedExcludes: GroupCondition[];
    matchedCount: number;
    unmatchedIncludes: GroupCondition[];
    unmatchedExcludes: GroupCondition[];
    unmatchedCount: number;
}
/** A PullApprove group to be able to test files against. */
export declare class PullApproveGroup {
    groupName: string;
    private misconfiguredLines;
    private includeConditions;
    private excludeConditions;
    hasMatchers: boolean;
    constructor(groupName: string, group: PullApproveGroupConfig);
    /** Retrieve all of the lines which were not able to be parsed. */
    getBadLines(): string[];
    /** Retrieve the results for the Group, all matched and unmatched conditions. */
    getResults(): PullApproveGroupResult;
    /**
     * Tests a provided file path to determine if it would be considered matched by
     * the pull approve group's conditions.
     */
    testFile(file: string): boolean;
}
export {};
