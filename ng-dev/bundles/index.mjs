
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);

import {
  ActiveReleaseTrains,
  AuthenticatedGitClient,
  AuthenticatedGithubClient,
  COMMIT_TYPES,
  GitClient,
  GitCommandError,
  GithubClient,
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
  import_request_error,
  isLtsDistTag,
  isVersionBranch,
  isVersionPublishedToNpm
} from "./chunk-YEV2C36O.mjs";
import {
  ConfigValidationError,
  DEFAULT_LOG_LEVEL,
  Log,
  LogLevel,
  assertValidGithubConfig,
  assertValidReleaseConfig,
  blue,
  bold,
  captureLogOutputForCommand,
  getConfig,
  getUserConfig,
  green,
  red,
  reset,
  setConfig,
  yellow
} from "./chunk-WFLFO5HZ.mjs";
import "./chunk-KTTQTX6B.mjs";
import "./chunk-3CEJO2PC.mjs";
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
