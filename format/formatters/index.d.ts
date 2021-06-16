/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/formatters/index" />
import { Buildifier } from './buildifier';
import { ClangFormat } from './clang-format';
import { Prettier } from './prettier';
/**
 * Get all defined formatters which are active based on the current loaded config.
 */
export declare function getActiveFormatters(): (Buildifier | ClangFormat | Prettier)[];
export { Formatter, FormatterAction } from './base-formatter';
