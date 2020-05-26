/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/formatters/clang-format" />
import { Formatter } from './base-formatter';
/**
 * Formatter for running clang-format against Typescript and Javascript files
 */
export declare class ClangFormat extends Formatter {
    name: string;
    binaryFilePath: string;
    defaultFileMatcher: string[];
    actions: {
        check: {
            commandFlags: string;
            callback: (_: string, code: number) => boolean;
        };
        format: {
            commandFlags: string;
            callback: (file: string, code: number, _: string, stderr: string) => boolean;
        };
    };
}
