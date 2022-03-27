/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Prompts the user whether remote forks for the current repository should be
 * updated from `master` to `main`.
 *
 * An access token for performing the Github Admin operation is demanded through
 * a prompt. This is opt-in as not every contributor may want to grant the tool a
 * Github access token/or some contributors may want to make the changes themselves.
 */
export declare function promptForRemoteForkUpdate(): Promise<void>;
