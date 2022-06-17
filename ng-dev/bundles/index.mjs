
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);

import {
  ActiveReleaseTrains,
  AuthenticatedGitClient,
  COMMIT_TYPES,
  ReleaseNotesLevel,
  ReleasePrecheckError,
  ReleaseTrain,
  ScopeRequirement,
  _npmPackageInfoCache,
  assertValidCaretakerConfig,
  assertValidCommitMessageConfig,
  assertValidFormatConfig,
  assertValidPullRequestConfig,
  breakingChangeLabel,
  computeLtsEndDateOfMajor,
  deprecationLabel,
  fetchLongTermSupportBranchesFromNpm,
  fetchProjectNpmPackageInfo,
  getBranchesForMajorVersions,
  getLtsNpmDistTagOfMajor,
  getNextBranchName,
  getVersionForVersionBranch,
  getVersionOfBranch,
  isLtsDistTag,
  isVersionBranch,
  isVersionPublishedToNpm
} from "./chunk-SGHQTWKI.mjs";
import {
  AuthenticatedGithubClient,
  ConfigValidationError,
  DEFAULT_LOG_LEVEL,
  GitClient,
  GitCommandError,
  GithubClient,
  Log,
  LogLevel,
  assertValidGithubConfig,
  assertValidReleaseConfig,
  blue,
  bold,
  captureLogOutputForCommand,
  determineRepoBaseDirFromCwd,
  getConfig,
  getUserConfig,
  green,
  import_request_error,
  red,
  reset,
  setConfig,
  yellow
} from "./chunk-OSP5ZQZ2.mjs";
import "./chunk-TD4KPB7G.mjs";
import "./chunk-YUSEAZDH.mjs";
var export_GithubApiRequestError = import_request_error.RequestError;
export {
  ActiveReleaseTrains,
  AuthenticatedGitClient,
  AuthenticatedGithubClient,
  COMMIT_TYPES,
  ConfigValidationError,
  DEFAULT_LOG_LEVEL,
  GitClient,
  GitCommandError,
  export_GithubApiRequestError as GithubApiRequestError,
  GithubClient,
  Log,
  LogLevel,
  ReleaseNotesLevel,
  ReleasePrecheckError,
  ReleaseTrain,
  ScopeRequirement,
  _npmPackageInfoCache,
  assertValidCaretakerConfig,
  assertValidCommitMessageConfig,
  assertValidFormatConfig,
  assertValidGithubConfig,
  assertValidPullRequestConfig,
  assertValidReleaseConfig,
  blue,
  bold,
  breakingChangeLabel,
  captureLogOutputForCommand,
  computeLtsEndDateOfMajor,
  deprecationLabel,
  determineRepoBaseDirFromCwd,
  fetchLongTermSupportBranchesFromNpm,
  fetchProjectNpmPackageInfo,
  getBranchesForMajorVersions,
  getConfig,
  getLtsNpmDistTagOfMajor,
  getNextBranchName,
  getUserConfig,
  getVersionForVersionBranch,
  getVersionOfBranch,
  green,
  isLtsDistTag,
  isVersionBranch,
  isVersionPublishedToNpm,
  red,
  reset,
  setConfig,
  yellow
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=index.mjs.map
