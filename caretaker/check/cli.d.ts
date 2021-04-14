/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/cli" />
import { CommandModule } from 'yargs';
export interface CaretakerCheckOptions {
    githubToken: string;
}
/** yargs command module for checking status information for the repository  */
export declare const CheckModule: CommandModule<{}, CaretakerCheckOptions>;
