/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/formatters/buildifier" />
import { Formatter } from './base-formatter';
/**
 * Formatter for running buildifier against bazel related files.
 */
export declare class Buildifier extends Formatter {
    name: string;
    binaryFilePath: string;
    defaultFileMatcher: string[];
    actions: {
        check: {
            commandFlags: string;
            callback: (_: string, code: number, stdout: string) => boolean;
        };
        format: {
            commandFlags: string;
            callback: (file: string, code: number, _: string, stderr: string) => boolean;
        };
    };
}
