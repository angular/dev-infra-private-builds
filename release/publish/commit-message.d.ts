/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/commit-message" />
import * as semver from 'semver';
/** Gets the commit message for a new release point in the project. */
export declare function getCommitMessageForRelease(newVersion: semver.SemVer): string;
/**
 * Gets the commit message for an exceptional version bump in the next branch. The next
 * branch version will be bumped without the release being published in some situations.
 * More details can be found in the `MoveNextIntoFeatureFreeze` release action and in:
 * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
 */
export declare function getCommitMessageForExceptionalNextVersionBump(newVersion: semver.SemVer): string;
/**
 * Gets the commit message for a version update in the next branch to a major version. The next
 * branch version will be updated without the release being published if the branch is configured
 * as a major. More details can be found in the `ConfigureNextAsMajor` release action and in:
 * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
 */
export declare function getCommitMessageForNextBranchMajorSwitch(newVersion: semver.SemVer): string;
/** Gets the commit message for a release notes cherry-pick commit */
export declare function getReleaseNoteCherryPickCommitMessage(newVersion: semver.SemVer): string;
