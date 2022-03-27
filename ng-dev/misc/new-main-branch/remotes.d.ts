/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClient } from '../../utils/git/git-client';
/** Type describing extracted remotes, mapping remote name to its URL. */
export declare type Remotes = Map<string, string>;
/**
 * Gets all remotes for the repository associated with the given Git client.
 *
 * Assumes that both `fetch` and `push` mirrors of a remote have the same URL.
 */
export declare function getRemotesForRepo(git: GitClient): Remotes;
/** Gets whether the given remote URL refers to an Angular-owned repository. */
export declare function isAngularOwnedRemote(url: string): boolean;
