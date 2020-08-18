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
    'github-token'?: string;
}
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
/** yargs command module for checking out a PR  */
export declare const CheckoutCommandModule: CommandModule<{}, CheckoutOptions>;
