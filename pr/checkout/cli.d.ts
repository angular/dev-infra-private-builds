/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/checkout/cli" />
import { CommandModule } from 'yargs';
export interface CheckoutOptions {
    prNumber: number;
    githubToken: string;
}
/** yargs command module for checking out a PR  */
export declare const CheckoutCommandModule: CommandModule<{}, CheckoutOptions>;
