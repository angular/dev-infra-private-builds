/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/cli" />
import { CommandModule } from 'yargs';
/** Command line options for publishing a release. */
export interface ReleasePublishOptions {
    githubToken: string;
}
/** CLI command module for publishing a release. */
export declare const ReleasePublishCommandModule: CommandModule<{}, ReleasePublishOptions>;
