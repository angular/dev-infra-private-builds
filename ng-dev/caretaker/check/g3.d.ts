/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseModule } from './base';
/** Information expressing the difference between the main and g3 branches */
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
     * Get git diff stats between main and g3, for all files and filtered to only g3 affecting
     * files.
     */
    private getDiffStats;
    /** Determine whether the file name passes both include and exclude checks. */
    private checkMatchAgainstIncludeAndExclude;
    private getG3FileIncludeAndExcludeLists;
    private getLatestShas;
}
