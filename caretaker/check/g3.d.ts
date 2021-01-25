/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/g3" />
import { BaseModule } from './base';
/** Information expressing the difference between the master and g3 branches */
export interface G3StatsData {
    insertions: number;
    deletions: number;
    files: number;
    commits: number;
}
export declare class G3Module extends BaseModule<G3StatsData | void> {
    retrieveData(): Promise<{
        insertions: number;
        deletions: number;
        files: number;
        commits: number;
    } | undefined>;
    printToTerminal(): Promise<void>;
    /** Fetch and retrieve the latest sha for a specific branch. */
    private getShaForBranchLatest;
    /**
     * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
     * files.
     */
    private getDiffStats;
    /** Determine whether the file name passes both include and exclude checks. */
    private checkMatchAgainstIncludeAndExclude;
    private getG3FileIncludeAndExcludeLists;
    private getLatestShas;
}
