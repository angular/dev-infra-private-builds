/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class holding methods for hashing a directory. */
export declare abstract class DirectoryHash {
    /** Computes a hash for the given directory. */
    static compute(dirPath: string): Promise<string>;
}
