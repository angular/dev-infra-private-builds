/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/format/formatters/prettier" />
import { Formatter } from './base-formatter';
/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
export declare class Prettier extends Formatter {
    name: string;
    binaryFilePath: string;
    defaultFileMatcher: string[];
    /**
     * The configuration path of the prettier config, obtained during construction to prevent needing
     * to discover it repeatedly for each execution.
     */
    private configPath;
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
