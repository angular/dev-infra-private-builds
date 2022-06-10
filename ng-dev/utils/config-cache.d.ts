/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Set the cached configuration object to be loaded later. Only to be used on
 * CI and test situations in which loading from the `.ng-dev/` directory is not possible.
 */
export declare function setCachedConfig(config: {}): void;
/** Gets the cached configuration, or `null` if not set. */
export declare function getCachedConfig(): {} | null;
