/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/check-target-branches/cli" />
import { CommandModule } from 'yargs';
export interface CheckTargetBranchesOptions {
    pr: number;
}
/** yargs command module describing the command.  */
export declare const CheckTargetBranchesModule: CommandModule<{}, CheckTargetBranchesOptions>;
