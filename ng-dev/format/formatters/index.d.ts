/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Buildifier } from './buildifier.js';
import { ClangFormat } from './clang-format.js';
import { Prettier } from './prettier.js';
/**
 * Get all defined formatters which are active based on the current loaded config.
 */
export declare function getActiveFormatters(): Promise<(Buildifier | ClangFormat | Prettier)[]>;
export { Formatter, FormatterAction } from './base-formatter.js';
