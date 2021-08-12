/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClient } from '../../../utils/git/git-client';
import { CommitFromGitLog } from '../../../commit-message/parse';
/**
 * Gets all commits the head branch contains, but the base branch does not include.
 * This follows the same semantics as Git's double-dot revision range.
 *
 * i.e. `<baseRef>..<headRef>` revision range as per Git.
 * https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection.
 *
 * Branches in the Angular organization are diverging quickly due to multiple factors
 * concerning the versioning and merging. i.e. Commits are cherry-picked into branches,
 * resulting in different SHAs for each branch. Additionally, branches diverge quickly
 * because changes can be made only for specific branches (e.g. a master-only change).
 *
 * In order to allow for comparisons that follow similar semantics as Git's double-dot
 * revision range syntax, the logic re-implementing the semantics need to account for
 * the mentioned semi-diverged branches. We achieve this by excluding commits in the
 * head branch which have a similarly-named commit in the base branch. We cannot rely on
 * SHAs for determining common commits between the two branches (as explained above).
 *
 * More details can be found in the `get-commits-in-range.png` file which illustrates a
 * scenario where commits from the patch branch need to be excluded from the main branch.
 */
export declare function getCommitsForRangeWithDeduping(client: GitClient, baseRef: string, headRef: string): CommitFromGitLog[];
/** Fetches commits for the given revision range using `git log`. */
export declare function fetchCommitsForRevisionRange(client: GitClient, revisionRange: string): CommitFromGitLog[];
