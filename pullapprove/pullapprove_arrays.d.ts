/// <amd-module name="@angular/dev-infra-private/pullapprove/pullapprove_arrays" />
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PullApproveGroup } from './group';
export declare class PullApproveGroupStateDependencyError extends Error {
    constructor(message?: string);
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for files in conditions.
 */
export declare class PullApproveStringArray extends Array<string> {
    constructor(...elements: string[]);
    /** Returns a new array which only includes files that match the given pattern. */
    include(pattern: string): PullApproveStringArray;
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern: string): PullApproveStringArray;
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for groups in conditions.
 */
export declare class PullApproveGroupArray extends Array<PullApproveGroup> {
    constructor(...elements: PullApproveGroup[]);
    include(pattern: string): PullApproveGroupArray;
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern: string): PullApproveGroupArray;
    get pending(): void;
    get active(): void;
    get inactive(): void;
    get rejected(): void;
    get names(): string[];
}
