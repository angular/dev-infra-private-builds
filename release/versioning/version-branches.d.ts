/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/version-branches" />
import * as semver from 'semver';
import { GithubClient, GithubRepo } from '../../utils/git/github';
/** Type describing a Github repository with corresponding API client. */
export interface GithubRepoWithApi extends GithubRepo {
    /** API client that can access the repository. */
    api: GithubClient;
}
/** Type describing a version-branch. */
export interface VersionBranch {
    /** Name of the branch in Git. e.g. `10.0.x`. */
    name: string;
    /**
     * Parsed SemVer version for the version-branch. Version branches technically do
     * not follow the SemVer format, but we can have representative SemVer versions
     * that can be used for comparisons, sorting and other checks.
     */
    parsed: semver.SemVer;
}
/** Gets the version of a given branch by reading the `package.json` upstream. */
export declare function getVersionOfBranch(repo: GithubRepoWithApi, branchName: string): Promise<semver.SemVer>;
/** Whether the given branch corresponds to a version branch. */
export declare function isVersionBranch(branchName: string): boolean;
/**
 * Converts a given version-branch into a SemVer version that can be used with SemVer
 * utilities. e.g. to determine semantic order, extract major digit, compare.
 *
 * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
 * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
 */
export declare function getVersionForVersionBranch(branchName: string): semver.SemVer | null;
/**
 * Gets the version branches for the specified major versions in descending
 * order. i.e. latest version branches first.
 */
export declare function getBranchesForMajorVersions(repo: GithubRepoWithApi, majorVersions: number[]): Promise<VersionBranch[]>;
