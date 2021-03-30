/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/shelljs" />
import { ExecOptions, ShellString } from 'shelljs';
export declare function exec(cmd: string, opts?: ExecOptions & {
    async?: false;
}): ShellString;
