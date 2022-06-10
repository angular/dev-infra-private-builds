import { CommitFromGitLog } from './parse.js';
/**
 * Find all commits within the given range and return an object describing those.
 */
export declare function getCommitsInRange(from: string, to?: string): Promise<CommitFromGitLog[]>;
