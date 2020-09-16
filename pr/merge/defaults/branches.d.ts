/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/defaults/branches" />
import * as semver from 'semver';
import { GithubClient } from '../../../utils/git/github';
/** Type describing a Github repository with corresponding API client. */
export interface GithubRepo {
    /** API client that can access the repository. */
    api: GithubClient;
    /** Owner login of the repository. */
    owner: string;
    /** Name of the repository. */
    repo: string;
    /**
     * NPM package representing this repository. Angular repositories usually contain
     * multiple packages in a monorepo scheme, but packages commonly are released with
     * the same versions. This means that a single package can be used for querying
     * NPM about previously published versions (e.g. to determine active LTS versions).
     * */
    npmPackageName: string;
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
/** Branch name for the `next` branch. */
export declare const nextBranchName = "master";
/**
 * Fetches the active release train and its branches for the specified major version. i.e.
 * the latest active release-train branch name is resolved and an optional version-branch for
 * a currently active feature-freeze/release-candidate release-train.
 */
export declare function fetchActiveReleaseTrainBranches(repo: GithubRepo, nextVersion: semver.SemVer): Promise<{
    /**
     * Name of the currently active release-candidate branch. Null if no
     * feature-freeze/release-candidate is currently active.
     */
    releaseCandidateBranch: string | null;
    /** Name of the latest non-prerelease version branch (i.e. the patch branch). */
    latestVersionBranch: string;
}>;
/** Gets the version of a given branch by reading the `package.json` upstream. */
export declare function getVersionOfBranch(repo: GithubRepo, branchName: string): Promise<semver.SemVer>;
/** Whether the given branch corresponds to a release-train branch. */
export declare function isReleaseTrainBranch(branchName: string): boolean;
/**
 * Converts a given version-branch into a SemVer version that can be used with SemVer
 * utilities. e.g. to determine semantic order, extract major digit, compare.
 *
 * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
 * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
 */
export declare function getVersionForReleaseTrainBranch(branchName: string): semver.SemVer | null;
/**
 * Gets the version branches for the specified major versions in descending
 * order. i.e. latest version branches first.
 */
export declare function getBranchesForMajorVersions(repo: GithubRepo, majorVersions: number[]): Promise<VersionBranch[]>;
export declare function findActiveVersionBranches(repo: GithubRepo, nextVersion: semver.SemVer, branches: VersionBranch[], expectedReleaseCandidateMajor: number): Promise<{
    latestVersionBranch: string | null;
    releaseCandidateBranch: string | null;
}>;
