/// <amd-module name="@angular/dev-infra-private/commit-message/utils" />
import { CommitFromGitLog } from './parse';
/**
 * Find all commits within the given range and return an object describing those.
 */
export declare function getCommitsInRange(from: string, to?: string): Promise<CommitFromGitLog[]>;
