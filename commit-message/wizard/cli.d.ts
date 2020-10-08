/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/wizard/cli" />
import { CommandModule } from 'yargs';
import { CommitMsgSource } from '../commit-message-source';
export interface WizardOptions {
    filePath: string;
    commitSha: string | undefined;
    source: CommitMsgSource | undefined;
}
/** yargs command module describing the command.  */
export declare const WizardModule: CommandModule<{}, WizardOptions>;
