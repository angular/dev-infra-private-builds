/// <amd-module name="@angular/dev-infra-private/commit-message/wizard/wizard" />
import { CommitMsgSource } from '../commit-message-source';
export declare function runWizard(args: {
    filePath: string;
    source?: CommitMsgSource;
    commitSha?: string;
}): Promise<void>;
