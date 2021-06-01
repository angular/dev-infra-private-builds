/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/github" />
import { Octokit } from '@octokit/rest';
import { RequestParameters } from '@octokit/types';
import { query } from 'typed-graphqlify';
/**
 * An object representation of a Graphql Query to be used as a response type and
 * to generate a Graphql query string.
 */
export declare type GraphqlQueryObject = Parameters<typeof query>[1];
/** Interface describing a Github repository. */
export interface GithubRepo {
    /** Owner login of the repository. */
    owner: string;
    /** Name of the repository. */
    name: string;
}
/** Error for failed Github API requests. */
export declare class GithubApiRequestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/** Error for failed Github API requests. */
export declare class GithubGraphqlClientError extends Error {
}
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export declare class GithubClient {
    private token?;
    /** The graphql instance with authentication set during construction. */
    private _graphql;
    /** The Octokit instance actually performing API requests. */
    private _octokit;
    /**
     * @param token The github authentication token for Github Rest and Graphql API requests.
     */
    constructor(token?: string | undefined);
    /** Perform a query using Github's Graphql API. */
    graphql<T extends GraphqlQueryObject>(queryObject: T, params?: RequestParameters): Promise<T>;
    pulls: {
        checkIfMerged: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCheckIfMergedParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCheckIfMergedParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        create: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createComment: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentParamsDeprecatedInReplyTo) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createCommentReply: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentReplyParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentReplyResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentReplyParamsDeprecatedInReplyTo) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentReplyResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateCommentReplyParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateCommentReplyResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createFromIssue: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateFromIssueParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateFromIssueResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsCreateReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createReviewCommentReply: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateReviewCommentReplyParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateReviewCommentReplyResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createReviewRequest: {
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateReviewRequestParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsCreateReviewRequestResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsCreateReviewRequestParams) | undefined): Promise<Octokit.Response<Octokit.PullsCreateReviewRequestResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteComment: {
            (params?: (Octokit.RequestOptions & Octokit.PullsDeleteCommentParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deletePendingReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsDeletePendingReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsDeletePendingReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsDeletePendingReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsDeletePendingReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteReviewRequest: {
            (params?: (Octokit.RequestOptions & Octokit.PullsDeleteReviewRequestParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.PullsDeleteReviewRequestParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        dismissReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsDismissReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsDismissReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsDismissReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsDismissReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        get: {
            (params?: (Octokit.RequestOptions & Octokit.PullsGetParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsGetResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsGetParams) | undefined): Promise<Octokit.Response<Octokit.PullsGetResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getComment: {
            (params?: (Octokit.RequestOptions & Octokit.PullsGetCommentParams) | undefined): Promise<Octokit.Response<Octokit.PullsGetCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommentsForReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsGetCommentsForReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsGetCommentsForReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsGetCommentsForReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsGetCommentsForReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsGetReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsGetReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsGetReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsGetReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        list: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListParams) | undefined): Promise<Octokit.Response<Octokit.PullsListResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listComments: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListCommentsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsListCommentsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsListCommentsParams) | undefined): Promise<Octokit.Response<Octokit.PullsListCommentsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommentsForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListCommentsForRepoParams) | undefined): Promise<Octokit.Response<Octokit.PullsListCommentsForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommits: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListCommitsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsListCommitsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsListCommitsParams) | undefined): Promise<Octokit.Response<Octokit.PullsListCommitsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listFiles: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListFilesParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsListFilesResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsListFilesParams) | undefined): Promise<Octokit.Response<Octokit.PullsListFilesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listReviewRequests: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListReviewRequestsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsListReviewRequestsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsListReviewRequestsParams) | undefined): Promise<Octokit.Response<Octokit.PullsListReviewRequestsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listReviews: {
            (params?: (Octokit.RequestOptions & Octokit.PullsListReviewsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsListReviewsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsListReviewsParams) | undefined): Promise<Octokit.Response<Octokit.PullsListReviewsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        merge: {
            (params?: (Octokit.RequestOptions & Octokit.PullsMergeParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsMergeResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsMergeParams) | undefined): Promise<Octokit.Response<Octokit.PullsMergeResponse>>;
            endpoint: Octokit.Endpoint;
        };
        submitReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsSubmitReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsSubmitReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsSubmitReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsSubmitReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
        update: {
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateParams) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateBranch: {
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateBranchParams) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateComment: {
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateCommentParams) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateReview: {
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateReviewParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateReviewResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.PullsUpdateReviewParams) | undefined): Promise<Octokit.Response<Octokit.PullsUpdateReviewResponse>>;
            endpoint: Octokit.Endpoint;
        };
    };
    repos: {
        acceptInvitation: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAcceptInvitationParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        addCollaborator: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddCollaboratorParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddCollaboratorResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addDeployKey: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddDeployKeyParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddDeployKeyResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchAdminEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchAdminEnforcementParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchAdminEnforcementResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchAppRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchAppRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchAppRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchRequiredSignatures: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchRequiredSignaturesParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchRequiredSignaturesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchRequiredStatusChecksContexts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchRequiredStatusChecksContextsParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchRequiredStatusChecksContextsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchTeamRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchTeamRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchTeamRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addProtectedBranchUserRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposAddProtectedBranchUserRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposAddProtectedBranchUserRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        checkCollaborator: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCheckCollaboratorParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        checkVulnerabilityAlerts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCheckVulnerabilityAlertsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        compareCommits: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCompareCommitsParams) | undefined): Promise<Octokit.Response<Octokit.ReposCompareCommitsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createCommitComment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateCommitCommentParamsDeprecatedSha) | undefined): Promise<Octokit.Response<Octokit.ReposCreateCommitCommentResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateCommitCommentParamsDeprecatedLine) | undefined): Promise<Octokit.Response<Octokit.ReposCreateCommitCommentResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateCommitCommentParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateCommitCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createDeployment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateDeploymentParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateDeploymentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createDeploymentStatus: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateDeploymentStatusParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateDeploymentStatusResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createDispatchEvent: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateDispatchEventParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        createFile: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateFileParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateFileResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createForAuthenticatedUser: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateForAuthenticatedUserParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateForAuthenticatedUserResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createFork: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateForkParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateForkResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateHookParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateHookResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createInOrg: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateInOrgParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateInOrgResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createOrUpdateFile: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateOrUpdateFileParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateOrUpdateFileResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateReleaseParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateReleaseResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createStatus: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateStatusParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateStatusResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createUsingTemplate: {
            (params?: (Octokit.RequestOptions & Octokit.ReposCreateUsingTemplateParams) | undefined): Promise<Octokit.Response<Octokit.ReposCreateUsingTemplateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        declineInvitation: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeclineInvitationParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        delete: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteParams) | undefined): Promise<Octokit.Response<Octokit.ReposDeleteResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteCommitComment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteCommitCommentParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteDownload: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteDownloadParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteFile: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteFileParams) | undefined): Promise<Octokit.Response<Octokit.ReposDeleteFileResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteHookParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteInvitation: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteInvitationParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteReleaseParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteReleaseAsset: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDeleteReleaseAssetParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        disableAutomatedSecurityFixes: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDisableAutomatedSecurityFixesParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        disablePagesSite: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDisablePagesSiteParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        disableVulnerabilityAlerts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposDisableVulnerabilityAlertsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        enableAutomatedSecurityFixes: {
            (params?: (Octokit.RequestOptions & Octokit.ReposEnableAutomatedSecurityFixesParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        enablePagesSite: {
            (params?: (Octokit.RequestOptions & Octokit.ReposEnablePagesSiteParams) | undefined): Promise<Octokit.Response<Octokit.ReposEnablePagesSiteResponse>>;
            endpoint: Octokit.Endpoint;
        };
        enableVulnerabilityAlerts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposEnableVulnerabilityAlertsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        get: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getAppsWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetAppsWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetAppsWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getArchiveLink: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetArchiveLinkParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        getBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getBranchProtection: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetBranchProtectionParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetBranchProtectionResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getClones: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetClonesParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetClonesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCodeFrequencyStats: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCodeFrequencyStatsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCodeFrequencyStatsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCollaboratorPermissionLevel: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCollaboratorPermissionLevelParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCollaboratorPermissionLevelResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCombinedStatusForRef: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCombinedStatusForRefParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCombinedStatusForRefResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommit: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitParamsDeprecatedSha) | undefined): Promise<Octokit.Response<Octokit.ReposGetCommitResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitParamsDeprecatedCommitSha) | undefined): Promise<Octokit.Response<Octokit.ReposGetCommitResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommitActivityStats: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitActivityStatsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCommitActivityStatsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommitComment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitCommentParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetCommitCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommitRefSha: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetCommitRefShaParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        getContents: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetContentsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetContentsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getContributorsStats: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetContributorsStatsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetContributorsStatsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getDeployKey: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetDeployKeyParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetDeployKeyResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getDeployment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetDeploymentParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetDeploymentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getDeploymentStatus: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetDeploymentStatusParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetDeploymentStatusResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getDownload: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetDownloadParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetDownloadResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetHookParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetHookResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getLatestPagesBuild: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetLatestPagesBuildParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetLatestPagesBuildResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getLatestRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetLatestReleaseParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetLatestReleaseResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getPages: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetPagesParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetPagesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getPagesBuild: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetPagesBuildParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetPagesBuildResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getParticipationStats: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetParticipationStatsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetParticipationStatsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getProtectedBranchAdminEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetProtectedBranchAdminEnforcementParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetProtectedBranchAdminEnforcementResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getProtectedBranchPullRequestReviewEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetProtectedBranchPullRequestReviewEnforcementParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetProtectedBranchPullRequestReviewEnforcementResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getProtectedBranchRequiredSignatures: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetProtectedBranchRequiredSignaturesParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetProtectedBranchRequiredSignaturesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getProtectedBranchRequiredStatusChecks: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetProtectedBranchRequiredStatusChecksParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetProtectedBranchRequiredStatusChecksResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getProtectedBranchRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetProtectedBranchRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetProtectedBranchRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getPunchCardStats: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetPunchCardStatsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetPunchCardStatsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getReadme: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetReadmeParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetReadmeResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetReleaseParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetReleaseResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getReleaseAsset: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetReleaseAssetParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetReleaseAssetResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getReleaseByTag: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetReleaseByTagParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetReleaseByTagResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getTeamsWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetTeamsWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetTeamsWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getTopPaths: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetTopPathsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetTopPathsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getTopReferrers: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetTopReferrersParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetTopReferrersResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getUsersWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetUsersWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetUsersWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getViews: {
            (params?: (Octokit.RequestOptions & Octokit.ReposGetViewsParams) | undefined): Promise<Octokit.Response<Octokit.ReposGetViewsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        list: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        listAppsWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListAppsWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposListAppsWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listAssetsForRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListAssetsForReleaseParams) | undefined): Promise<Octokit.Response<Octokit.ReposListAssetsForReleaseResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listBranches: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListBranchesParams) | undefined): Promise<Octokit.Response<Octokit.ReposListBranchesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listBranchesForHeadCommit: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListBranchesForHeadCommitParams) | undefined): Promise<Octokit.Response<Octokit.ReposListBranchesForHeadCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCollaborators: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListCollaboratorsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListCollaboratorsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommentsForCommit: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListCommentsForCommitParamsDeprecatedRef) | undefined): Promise<Octokit.Response<Octokit.ReposListCommentsForCommitResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposListCommentsForCommitParams) | undefined): Promise<Octokit.Response<Octokit.ReposListCommentsForCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommitComments: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListCommitCommentsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListCommitCommentsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommits: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListCommitsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListCommitsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listContributors: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListContributorsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListContributorsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listDeployKeys: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListDeployKeysParams) | undefined): Promise<Octokit.Response<Octokit.ReposListDeployKeysResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listDeploymentStatuses: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListDeploymentStatusesParams) | undefined): Promise<Octokit.Response<Octokit.ReposListDeploymentStatusesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listDeployments: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListDeploymentsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListDeploymentsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listDownloads: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListDownloadsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListDownloadsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listForOrg: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListForOrgParams) | undefined): Promise<Octokit.Response<Octokit.ReposListForOrgResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listForUser: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListForUserParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        listForks: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListForksParams) | undefined): Promise<Octokit.Response<Octokit.ReposListForksResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listHooks: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListHooksParams) | undefined): Promise<Octokit.Response<Octokit.ReposListHooksResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listInvitations: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListInvitationsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListInvitationsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listInvitationsForAuthenticatedUser: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListInvitationsForAuthenticatedUserParams) | undefined): Promise<Octokit.Response<Octokit.ReposListInvitationsForAuthenticatedUserResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listLanguages: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListLanguagesParams) | undefined): Promise<Octokit.Response<Octokit.ReposListLanguagesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listPagesBuilds: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListPagesBuildsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListPagesBuildsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listProtectedBranchRequiredStatusChecksContexts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListProtectedBranchRequiredStatusChecksContextsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListProtectedBranchRequiredStatusChecksContextsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listProtectedBranchTeamRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListProtectedBranchTeamRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListProtectedBranchTeamRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listProtectedBranchUserRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListProtectedBranchUserRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListProtectedBranchUserRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listPublic: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListPublicParams) | undefined): Promise<Octokit.Response<Octokit.ReposListPublicResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listPullRequestsAssociatedWithCommit: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListPullRequestsAssociatedWithCommitParams) | undefined): Promise<Octokit.Response<Octokit.ReposListPullRequestsAssociatedWithCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listReleases: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListReleasesParams) | undefined): Promise<Octokit.Response<Octokit.ReposListReleasesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listStatusesForRef: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListStatusesForRefParams) | undefined): Promise<Octokit.Response<Octokit.ReposListStatusesForRefResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listTags: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListTagsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListTagsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listTeams: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListTeamsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListTeamsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listTeamsWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListTeamsWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposListTeamsWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listTopics: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListTopicsParams) | undefined): Promise<Octokit.Response<Octokit.ReposListTopicsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listUsersWithAccessToProtectedBranch: {
            (params?: (Octokit.RequestOptions & Octokit.ReposListUsersWithAccessToProtectedBranchParams) | undefined): Promise<Octokit.Response<Octokit.ReposListUsersWithAccessToProtectedBranchResponse>>;
            endpoint: Octokit.Endpoint;
        };
        merge: {
            (params?: (Octokit.RequestOptions & Octokit.ReposMergeParams) | undefined): Promise<Octokit.Response<Octokit.ReposMergeResponse>>;
            endpoint: Octokit.Endpoint;
        };
        pingHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposPingHookParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeBranchProtection: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveBranchProtectionParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeCollaborator: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveCollaboratorParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeDeployKey: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveDeployKeyParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchAdminEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchAdminEnforcementParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchAppRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchAppRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposRemoveProtectedBranchAppRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchPullRequestReviewEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchPullRequestReviewEnforcementParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchRequiredSignatures: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchRequiredSignaturesParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchRequiredStatusChecks: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchRequiredStatusChecksParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchRequiredStatusChecksContexts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchRequiredStatusChecksContextsParams) | undefined): Promise<Octokit.Response<Octokit.ReposRemoveProtectedBranchRequiredStatusChecksContextsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchRestrictionsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchTeamRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchTeamRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposRemoveProtectedBranchTeamRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        removeProtectedBranchUserRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRemoveProtectedBranchUserRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposRemoveProtectedBranchUserRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        replaceProtectedBranchAppRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposReplaceProtectedBranchAppRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposReplaceProtectedBranchAppRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        replaceProtectedBranchRequiredStatusChecksContexts: {
            (params?: (Octokit.RequestOptions & Octokit.ReposReplaceProtectedBranchRequiredStatusChecksContextsParams) | undefined): Promise<Octokit.Response<Octokit.ReposReplaceProtectedBranchRequiredStatusChecksContextsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        replaceProtectedBranchTeamRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposReplaceProtectedBranchTeamRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposReplaceProtectedBranchTeamRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        replaceProtectedBranchUserRestrictions: {
            (params?: (Octokit.RequestOptions & Octokit.ReposReplaceProtectedBranchUserRestrictionsParams) | undefined): Promise<Octokit.Response<Octokit.ReposReplaceProtectedBranchUserRestrictionsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        replaceTopics: {
            (params?: (Octokit.RequestOptions & Octokit.ReposReplaceTopicsParams) | undefined): Promise<Octokit.Response<Octokit.ReposReplaceTopicsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        requestPageBuild: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRequestPageBuildParams) | undefined): Promise<Octokit.Response<Octokit.ReposRequestPageBuildResponse>>;
            endpoint: Octokit.Endpoint;
        };
        retrieveCommunityProfileMetrics: {
            (params?: (Octokit.RequestOptions & Octokit.ReposRetrieveCommunityProfileMetricsParams) | undefined): Promise<Octokit.Response<Octokit.ReposRetrieveCommunityProfileMetricsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        testPushHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposTestPushHookParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        transfer: {
            (params?: (Octokit.RequestOptions & Octokit.ReposTransferParams) | undefined): Promise<Octokit.Response<Octokit.ReposTransferResponse>>;
            endpoint: Octokit.Endpoint;
        };
        update: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateBranchProtection: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateBranchProtectionParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateBranchProtectionResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateCommitComment: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateCommitCommentParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateCommitCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateFile: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateFileParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateFileResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateHook: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateHookParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateHookResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateInformationAboutPagesSite: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateInformationAboutPagesSiteParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        updateInvitation: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateInvitationParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateInvitationResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateProtectedBranchPullRequestReviewEnforcement: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateProtectedBranchPullRequestReviewEnforcementParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateProtectedBranchPullRequestReviewEnforcementResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateProtectedBranchRequiredStatusChecks: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateProtectedBranchRequiredStatusChecksParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateProtectedBranchRequiredStatusChecksResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateRelease: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateReleaseParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateReleaseResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateReleaseAsset: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUpdateReleaseAssetParams) | undefined): Promise<Octokit.Response<Octokit.ReposUpdateReleaseAssetResponse>>;
            endpoint: Octokit.Endpoint;
        };
        uploadReleaseAsset: {
            (params?: (Octokit.RequestOptions & Octokit.ReposUploadReleaseAssetParamsDeprecatedFile) | undefined): Promise<Octokit.Response<Octokit.ReposUploadReleaseAssetResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.ReposUploadReleaseAssetParams) | undefined): Promise<Octokit.Response<Octokit.ReposUploadReleaseAssetResponse>>;
            endpoint: Octokit.Endpoint;
        };
    };
    issues: {
        addAssignees: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesAddAssigneesParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesAddAssigneesResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesAddAssigneesParams) | undefined): Promise<Octokit.Response<Octokit.IssuesAddAssigneesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        addLabels: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesAddLabelsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesAddLabelsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesAddLabelsParams) | undefined): Promise<Octokit.Response<Octokit.IssuesAddLabelsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        checkAssignee: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesCheckAssigneeParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        create: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateParamsDeprecatedAssignee) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateParams) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createComment: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateCommentParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateCommentResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateCommentParams) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createLabel: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateLabelParams) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateLabelResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createMilestone: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesCreateMilestoneParams) | undefined): Promise<Octokit.Response<Octokit.IssuesCreateMilestoneResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteComment: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesDeleteCommentParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteLabel: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesDeleteLabelParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        deleteMilestone: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesDeleteMilestoneParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesDeleteMilestoneParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        get: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesGetResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetParams) | undefined): Promise<Octokit.Response<Octokit.IssuesGetResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getComment: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetCommentParams) | undefined): Promise<Octokit.Response<Octokit.IssuesGetCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getEvent: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetEventParams) | undefined): Promise<Octokit.Response<Octokit.IssuesGetEventResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getLabel: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetLabelParams) | undefined): Promise<Octokit.Response<Octokit.IssuesGetLabelResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getMilestone: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetMilestoneParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesGetMilestoneResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesGetMilestoneParams) | undefined): Promise<Octokit.Response<Octokit.IssuesGetMilestoneResponse>>;
            endpoint: Octokit.Endpoint;
        };
        list: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listAssignees: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListAssigneesParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListAssigneesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listComments: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListCommentsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesListCommentsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesListCommentsParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListCommentsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listCommentsForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListCommentsForRepoParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListCommentsForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listEvents: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListEventsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesListEventsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesListEventsParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListEventsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listEventsForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListEventsForRepoParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListEventsForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listEventsForTimeline: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListEventsForTimelineParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesListEventsForTimelineResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesListEventsForTimelineParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListEventsForTimelineResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listForAuthenticatedUser: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListForAuthenticatedUserParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListForAuthenticatedUserResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listForOrg: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListForOrgParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListForOrgResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListForRepoParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listLabelsForMilestone: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListLabelsForMilestoneParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesListLabelsForMilestoneResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesListLabelsForMilestoneParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListLabelsForMilestoneResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listLabelsForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListLabelsForRepoParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListLabelsForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listLabelsOnIssue: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListLabelsOnIssueParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesListLabelsOnIssueResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesListLabelsOnIssueParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListLabelsOnIssueResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listMilestonesForRepo: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesListMilestonesForRepoParams) | undefined): Promise<Octokit.Response<Octokit.IssuesListMilestonesForRepoResponse>>;
            endpoint: Octokit.Endpoint;
        };
        lock: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesLockParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesLockParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        removeAssignees: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveAssigneesParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesRemoveAssigneesResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveAssigneesParams) | undefined): Promise<Octokit.Response<Octokit.IssuesRemoveAssigneesResponse>>;
            endpoint: Octokit.Endpoint;
        };
        removeLabel: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveLabelParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesRemoveLabelResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveLabelParams) | undefined): Promise<Octokit.Response<Octokit.IssuesRemoveLabelResponse>>;
            endpoint: Octokit.Endpoint;
        };
        removeLabels: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveLabelsParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesRemoveLabelsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        replaceLabels: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesReplaceLabelsParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesReplaceLabelsResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesReplaceLabelsParams) | undefined): Promise<Octokit.Response<Octokit.IssuesReplaceLabelsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        unlock: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesUnlockParamsDeprecatedNumber) | undefined): Promise<Octokit.AnyResponse>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesUnlockParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        update: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateParamsDeprecatedAssignee) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateParams) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateComment: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateCommentParams) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateCommentResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateLabel: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateLabelParams) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateLabelResponse>>;
            endpoint: Octokit.Endpoint;
        };
        updateMilestone: {
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateMilestoneParamsDeprecatedNumber) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateMilestoneResponse>>;
            (params?: (Octokit.RequestOptions & Octokit.IssuesUpdateMilestoneParams) | undefined): Promise<Octokit.Response<Octokit.IssuesUpdateMilestoneResponse>>;
            endpoint: Octokit.Endpoint;
        };
    };
    git: {
        createBlob: {
            (params?: (Octokit.RequestOptions & Octokit.GitCreateBlobParams) | undefined): Promise<Octokit.Response<Octokit.GitCreateBlobResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createCommit: {
            (params?: (Octokit.RequestOptions & Octokit.GitCreateCommitParams) | undefined): Promise<Octokit.Response<Octokit.GitCreateCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createRef: {
            (params?: (Octokit.RequestOptions & Octokit.GitCreateRefParams) | undefined): Promise<Octokit.Response<Octokit.GitCreateRefResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createTag: {
            (params?: (Octokit.RequestOptions & Octokit.GitCreateTagParams) | undefined): Promise<Octokit.Response<Octokit.GitCreateTagResponse>>;
            endpoint: Octokit.Endpoint;
        };
        createTree: {
            (params?: (Octokit.RequestOptions & Octokit.GitCreateTreeParams) | undefined): Promise<Octokit.Response<Octokit.GitCreateTreeResponse>>;
            endpoint: Octokit.Endpoint;
        };
        deleteRef: {
            (params?: (Octokit.RequestOptions & Octokit.GitDeleteRefParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        getBlob: {
            (params?: (Octokit.RequestOptions & Octokit.GitGetBlobParams) | undefined): Promise<Octokit.Response<Octokit.GitGetBlobResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getCommit: {
            (params?: (Octokit.RequestOptions & Octokit.GitGetCommitParams) | undefined): Promise<Octokit.Response<Octokit.GitGetCommitResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getRef: {
            (params?: (Octokit.RequestOptions & Octokit.GitGetRefParams) | undefined): Promise<Octokit.Response<Octokit.GitGetRefResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getTag: {
            (params?: (Octokit.RequestOptions & Octokit.GitGetTagParams) | undefined): Promise<Octokit.Response<Octokit.GitGetTagResponse>>;
            endpoint: Octokit.Endpoint;
        };
        getTree: {
            (params?: (Octokit.RequestOptions & Octokit.GitGetTreeParams) | undefined): Promise<Octokit.Response<Octokit.GitGetTreeResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listMatchingRefs: {
            (params?: (Octokit.RequestOptions & Octokit.GitListMatchingRefsParams) | undefined): Promise<Octokit.Response<Octokit.GitListMatchingRefsResponse>>;
            endpoint: Octokit.Endpoint;
        };
        listRefs: {
            (params?: (Octokit.RequestOptions & Octokit.GitListRefsParams) | undefined): Promise<Octokit.AnyResponse>;
            endpoint: Octokit.Endpoint;
        };
        updateRef: {
            (params?: (Octokit.RequestOptions & Octokit.GitUpdateRefParams) | undefined): Promise<Octokit.Response<Octokit.GitUpdateRefResponse>>;
            endpoint: Octokit.Endpoint;
        };
    };
    paginate: Octokit.Paginate;
    rateLimit: {
        get: {
            (params?: (Octokit.RequestOptions & Octokit.EmptyParams) | undefined): Promise<Octokit.Response<Octokit.RateLimitGetResponse>>;
            endpoint: Octokit.Endpoint;
        };
    };
}
