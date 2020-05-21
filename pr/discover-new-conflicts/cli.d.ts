/// <amd-module name="@angular/dev-infra-private/pr/discover-new-conflicts/cli" />
import { Arguments, Argv } from 'yargs';
/** Builds the discover-new-conflicts pull request command. */
export declare function buildDiscoverNewConflictsCommand(yargs: Argv): Argv;
/** Handles the discover-new-conflicts pull request command. */
export declare function handleDiscoverNewConflictsCommand({ prNumber, date }: Arguments): Promise<void>;
