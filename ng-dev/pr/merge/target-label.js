"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesFromTargetLabel = exports.getTargetBranchesForPullRequest = exports.getMatchingTargetLabelForPullRequest = exports.InvalidTargetLabelError = exports.InvalidTargetBranchError = exports.TargetLabelName = void 0;
const defaults_1 = require("./defaults");
const validations_1 = require("./validations");
const failures_1 = require("./failures");
/**
 * Enum capturing available target label names in the Angular organization. A target
 * label is set on a pull request to specify where its changes should land.
 *
 * More details can be found here:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU#heading=h.lkuypj38h15d
 */
var TargetLabelName;
(function (TargetLabelName) {
    TargetLabelName["MAJOR"] = "target: major";
    TargetLabelName["MINOR"] = "target: minor";
    TargetLabelName["PATCH"] = "target: patch";
    TargetLabelName["RELEASE_CANDIDATE"] = "target: rc";
    TargetLabelName["LONG_TERM_SUPPORT"] = "target: lts";
})(TargetLabelName = exports.TargetLabelName || (exports.TargetLabelName = {}));
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
class InvalidTargetBranchError {
    constructor(failureMessage) {
        this.failureMessage = failureMessage;
    }
}
exports.InvalidTargetBranchError = InvalidTargetBranchError;
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
class InvalidTargetLabelError {
    constructor(failureMessage) {
        this.failureMessage = failureMessage;
    }
}
exports.InvalidTargetLabelError = InvalidTargetLabelError;
/** Gets the target label from the specified pull request labels. */
async function getMatchingTargetLabelForPullRequest(config, labelsOnPullRequest, allTargetLabels) {
    if (config.noTargetLabeling) {
        throw Error('This repository does not use target labels');
    }
    const matches = [];
    for (const label of labelsOnPullRequest) {
        const match = allTargetLabels.find(({ name }) => label === name);
        if (match !== undefined) {
            matches.push(match);
        }
    }
    if (matches.length === 1) {
        return matches[0];
    }
    if (matches.length === 0) {
        throw new InvalidTargetLabelError('Unable to determine target for the PR as it has no target label.');
    }
    throw new InvalidTargetLabelError('Unable to determine target for the PR as it has multiple target labels.');
}
exports.getMatchingTargetLabelForPullRequest = getMatchingTargetLabelForPullRequest;
/** Get the branches the pull request should be merged into. */
async function getTargetBranchesForPullRequest(config, labelsOnPullRequest, githubTargetBranch, commits) {
    if (config.merge.noTargetLabeling) {
        return [config.github.mainBranchName];
    }
    // If branches are determined for a given target label, capture errors that are
    // thrown as part of branch computation. This is expected because a merge configuration
    // can lazily compute branches for a target label and throw. e.g. if an invalid target
    // label is applied, we want to exit the script gracefully with an error message.
    try {
        const targetLabels = await (0, defaults_1.getTargetLabelsForActiveReleaseTrains)();
        const matchingLabel = await getMatchingTargetLabelForPullRequest(config.merge, labelsOnPullRequest, targetLabels);
        const targetBranches = await getBranchesFromTargetLabel(matchingLabel, githubTargetBranch);
        (0, validations_1.assertChangesAllowForTargetLabel)(commits, matchingLabel, config.merge);
        return targetBranches;
    }
    catch (error) {
        if (error instanceof InvalidTargetBranchError || error instanceof InvalidTargetLabelError) {
            throw new failures_1.PullRequestFailure(error.failureMessage);
        }
        throw error;
    }
}
exports.getTargetBranchesForPullRequest = getTargetBranchesForPullRequest;
/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
async function getBranchesFromTargetLabel(label, githubTargetBranch) {
    return typeof label.branches === 'function'
        ? await label.branches(githubTargetBranch)
        : await label.branches;
}
exports.getBranchesFromTargetLabel = getBranchesFromTargetLabel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFHSCx5Q0FBaUU7QUFHakUsK0NBQStEO0FBQy9ELHlDQUE4QztBQUU5Qzs7Ozs7O0dBTUc7QUFDSCxJQUFZLGVBTVg7QUFORCxXQUFZLGVBQWU7SUFDekIsMENBQXVCLENBQUE7SUFDdkIsMENBQXVCLENBQUE7SUFDdkIsMENBQXVCLENBQUE7SUFDdkIsbURBQWdDLENBQUE7SUFDaEMsb0RBQWlDLENBQUE7QUFDbkMsQ0FBQyxFQU5XLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBTTFCO0FBb0JEOzs7R0FHRztBQUNILE1BQWEsd0JBQXdCO0lBQ25DLFlBQW1CLGNBQXNCO1FBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO0lBQUcsQ0FBQztDQUM5QztBQUZELDREQUVDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBYSx1QkFBdUI7SUFDbEMsWUFBbUIsY0FBc0I7UUFBdEIsbUJBQWMsR0FBZCxjQUFjLENBQVE7SUFBRyxDQUFDO0NBQzlDO0FBRkQsMERBRUM7QUFFRCxvRUFBb0U7QUFDN0QsS0FBSyxVQUFVLG9DQUFvQyxDQUN4RCxNQUE2QyxFQUM3QyxtQkFBNkIsRUFDN0IsZUFBOEI7SUFFOUIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7UUFDM0IsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztLQUMzRDtJQUVELE1BQU0sT0FBTyxHQUFrQixFQUFFLENBQUM7SUFFbEMsS0FBSyxNQUFNLEtBQUssSUFBSSxtQkFBbUIsRUFBRTtRQUN2QyxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQy9ELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JCO0tBQ0Y7SUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25CO0lBQ0QsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN4QixNQUFNLElBQUksdUJBQXVCLENBQy9CLGtFQUFrRSxDQUNuRSxDQUFDO0tBQ0g7SUFDRCxNQUFNLElBQUksdUJBQXVCLENBQy9CLHlFQUF5RSxDQUMxRSxDQUFDO0FBQ0osQ0FBQztBQTVCRCxvRkE0QkM7QUFFRCwrREFBK0Q7QUFDeEQsS0FBSyxVQUFVLCtCQUErQixDQUNuRCxNQUFrRCxFQUNsRCxtQkFBNkIsRUFDN0Isa0JBQTBCLEVBQzFCLE9BQWlCO0lBRWpCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN2QztJQUVELCtFQUErRTtJQUMvRSx1RkFBdUY7SUFDdkYsc0ZBQXNGO0lBQ3RGLGlGQUFpRjtJQUNqRixJQUFJO1FBQ0YsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGdEQUFxQyxHQUFFLENBQUM7UUFDbkUsTUFBTSxhQUFhLEdBQUcsTUFBTSxvQ0FBb0MsQ0FDOUQsTUFBTSxDQUFDLEtBQUssRUFDWixtQkFBbUIsRUFDbkIsWUFBWSxDQUNiLENBQUM7UUFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTNGLElBQUEsOENBQWdDLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdkUsT0FBTyxjQUFjLENBQUM7S0FDdkI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLElBQUksS0FBSyxZQUFZLHdCQUF3QixJQUFJLEtBQUssWUFBWSx1QkFBdUIsRUFBRTtZQUN6RixNQUFNLElBQUksNkJBQWtCLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3BEO1FBQ0QsTUFBTSxLQUFLLENBQUM7S0FDYjtBQUNILENBQUM7QUFoQ0QsMEVBZ0NDO0FBRUQ7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsMEJBQTBCLENBQzlDLEtBQWtCLEVBQ2xCLGtCQUEwQjtJQUUxQixPQUFPLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxVQUFVO1FBQ3pDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7UUFDMUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUMzQixDQUFDO0FBUEQsZ0VBT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNZXJnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtnZXRUYXJnZXRMYWJlbHNGb3JBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuL2RlZmF1bHRzJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7YXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWx9IGZyb20gJy4vdmFsaWRhdGlvbnMnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuXG4vKipcbiAqIEVudW0gY2FwdHVyaW5nIGF2YWlsYWJsZSB0YXJnZXQgbGFiZWwgbmFtZXMgaW4gdGhlIEFuZ3VsYXIgb3JnYW5pemF0aW9uLiBBIHRhcmdldFxuICogbGFiZWwgaXMgc2V0IG9uIGEgcHVsbCByZXF1ZXN0IHRvIHNwZWNpZnkgd2hlcmUgaXRzIGNoYW5nZXMgc2hvdWxkIGxhbmQuXG4gKlxuICogTW9yZSBkZXRhaWxzIGNhbiBiZSBmb3VuZCBoZXJlOlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVSNoZWFkaW5nPWgubGt1eXBqMzhoMTVkXG4gKi9cbmV4cG9ydCBlbnVtIFRhcmdldExhYmVsTmFtZSB7XG4gIE1BSk9SID0gJ3RhcmdldDogbWFqb3InLFxuICBNSU5PUiA9ICd0YXJnZXQ6IG1pbm9yJyxcbiAgUEFUQ0ggPSAndGFyZ2V0OiBwYXRjaCcsXG4gIFJFTEVBU0VfQ0FORElEQVRFID0gJ3RhcmdldDogcmMnLFxuICBMT05HX1RFUk1fU1VQUE9SVCA9ICd0YXJnZXQ6IGx0cycsXG59XG5cbi8qKlxuICogRGVzY3JpYmVzIGEgbGFiZWwgdGhhdCBjYW4gYmUgYXBwbGllZCB0byBhIHB1bGwgcmVxdWVzdCB0byBtYXJrIGludG9cbiAqIHdoaWNoIGJyYW5jaGVzIGl0IHNob3VsZCBiZSBtZXJnZWQgaW50by5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJnZXRMYWJlbCB7XG4gIC8qKiBOYW1lIG9mIHRoZSB0YXJnZXQgbGFiZWwuIE5lZWRzIHRvIG1hdGNoIHdpdGggdGhlIG5hbWUgb2YgdGhlIGxhYmVsIG9uIEdpdGh1Yi4gKi9cbiAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lO1xuICAvKipcbiAgICogTGlzdCBvZiBicmFuY2hlcyBhIHB1bGwgcmVxdWVzdCB3aXRoIHRoaXMgdGFyZ2V0IGxhYmVsIHNob3VsZCBiZSBtZXJnZWQgaW50by5cbiAgICogQ2FuIGFsc28gYmUgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB0aGUgdGFyZ2V0IGJyYW5jaCBzcGVjaWZpZWQgaW4gdGhlXG4gICAqIEdpdGh1YiBXZWIgVUkuIFRoaXMgaXMgdXNlZnVsIGZvciBzdXBwb3J0aW5nIGxhYmVscyBsaWtlIGB0YXJnZXQ6IGRldmVsb3BtZW50LWJyYW5jaGAuXG4gICAqXG4gICAqIEB0aHJvd3Mge0ludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBJbnZhbGlkIGxhYmVsIGhhcyBiZWVuIGFwcGxpZWQgdG8gcHVsbCByZXF1ZXN0LlxuICAgKiBAdGhyb3dzIHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3J9IEludmFsaWQgR2l0aHViIHRhcmdldCBicmFuY2ggaGFzIGJlZW4gc2VsZWN0ZWQuXG4gICAqL1xuICBicmFuY2hlczogKGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nKSA9PiBzdHJpbmdbXSB8IFByb21pc2U8c3RyaW5nW10+O1xufVxuXG4vKipcbiAqIFVuaXF1ZSBlcnJvciB0aGF0IGNhbiBiZSB0aHJvd24gaW4gdGhlIG1lcmdlIGNvbmZpZ3VyYXRpb24gaWYgYW5cbiAqIGludmFsaWQgYnJhbmNoIGlzIHRhcmdldGVkLlxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZhaWx1cmVNZXNzYWdlOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogVW5pcXVlIGVycm9yIHRoYXQgY2FuIGJlIHRocm93biBpbiB0aGUgbWVyZ2UgY29uZmlndXJhdGlvbiBpZiBhblxuICogaW52YWxpZCBsYWJlbCBoYXMgYmVlbiBhcHBsaWVkIHRvIGEgcHVsbCByZXF1ZXN0LlxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFRhcmdldExhYmVsRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmFpbHVyZU1lc3NhZ2U6IHN0cmluZykge31cbn1cblxuLyoqIEdldHMgdGhlIHRhcmdldCBsYWJlbCBmcm9tIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGxhYmVscy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNYXRjaGluZ1RhcmdldExhYmVsRm9yUHVsbFJlcXVlc3QoXG4gIGNvbmZpZzogUGljazxNZXJnZUNvbmZpZywgJ25vVGFyZ2V0TGFiZWxpbmcnPixcbiAgbGFiZWxzT25QdWxsUmVxdWVzdDogc3RyaW5nW10sXG4gIGFsbFRhcmdldExhYmVsczogVGFyZ2V0TGFiZWxbXSxcbik6IFByb21pc2U8VGFyZ2V0TGFiZWw+IHtcbiAgaWYgKGNvbmZpZy5ub1RhcmdldExhYmVsaW5nKSB7XG4gICAgdGhyb3cgRXJyb3IoJ1RoaXMgcmVwb3NpdG9yeSBkb2VzIG5vdCB1c2UgdGFyZ2V0IGxhYmVscycpO1xuICB9XG5cbiAgY29uc3QgbWF0Y2hlczogVGFyZ2V0TGFiZWxbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgbGFiZWwgb2YgbGFiZWxzT25QdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IG1hdGNoID0gYWxsVGFyZ2V0TGFiZWxzLmZpbmQoKHtuYW1lfSkgPT4gbGFiZWwgPT09IG5hbWUpO1xuICAgIGlmIChtYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXRjaGVzLnB1c2gobWF0Y2gpO1xuICAgIH1cbiAgfVxuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgfVxuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAnVW5hYmxlIHRvIGRldGVybWluZSB0YXJnZXQgZm9yIHRoZSBQUiBhcyBpdCBoYXMgbm8gdGFyZ2V0IGxhYmVsLicsXG4gICAgKTtcbiAgfVxuICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgJ1VuYWJsZSB0byBkZXRlcm1pbmUgdGFyZ2V0IGZvciB0aGUgUFIgYXMgaXQgaGFzIG11bHRpcGxlIHRhcmdldCBsYWJlbHMuJyxcbiAgKTtcbn1cblxuLyoqIEdldCB0aGUgYnJhbmNoZXMgdGhlIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgbWVyZ2VkIGludG8uICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFyZ2V0QnJhbmNoZXNGb3JQdWxsUmVxdWVzdChcbiAgY29uZmlnOiB7bWVyZ2U6IE1lcmdlQ29uZmlnOyBnaXRodWI6IEdpdGh1YkNvbmZpZ30sXG4gIGxhYmVsc09uUHVsbFJlcXVlc3Q6IHN0cmluZ1tdLFxuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZyxcbiAgY29tbWl0czogQ29tbWl0W10sXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGlmIChjb25maWcubWVyZ2Uubm9UYXJnZXRMYWJlbGluZykge1xuICAgIHJldHVybiBbY29uZmlnLmdpdGh1Yi5tYWluQnJhbmNoTmFtZV07XG4gIH1cblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICBjb25zdCB0YXJnZXRMYWJlbHMgPSBhd2FpdCBnZXRUYXJnZXRMYWJlbHNGb3JBY3RpdmVSZWxlYXNlVHJhaW5zKCk7XG4gICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9IGF3YWl0IGdldE1hdGNoaW5nVGFyZ2V0TGFiZWxGb3JQdWxsUmVxdWVzdChcbiAgICAgIGNvbmZpZy5tZXJnZSxcbiAgICAgIGxhYmVsc09uUHVsbFJlcXVlc3QsXG4gICAgICB0YXJnZXRMYWJlbHMsXG4gICAgKTtcbiAgICBjb25zdCB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKG1hdGNoaW5nTGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG5cbiAgICBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChjb21taXRzLCBtYXRjaGluZ0xhYmVsLCBjb25maWcubWVyZ2UpO1xuXG4gICAgcmV0dXJuIHRhcmdldEJyYW5jaGVzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBicmFuY2hlcyBmcm9tIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGxhYmVsLlxuICpcbiAqIEB0aHJvd3Mge0ludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBJbnZhbGlkIGxhYmVsIGhhcyBiZWVuIGFwcGxpZWQgdG8gcHVsbCByZXF1ZXN0LlxuICogQHRocm93cyB7SW52YWxpZFRhcmdldEJyYW5jaEVycm9yfSBJbnZhbGlkIEdpdGh1YiB0YXJnZXQgYnJhbmNoIGhhcyBiZWVuIHNlbGVjdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwoXG4gIGxhYmVsOiBUYXJnZXRMYWJlbCxcbiAgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIHJldHVybiB0eXBlb2YgbGFiZWwuYnJhbmNoZXMgPT09ICdmdW5jdGlvbidcbiAgICA/IGF3YWl0IGxhYmVsLmJyYW5jaGVzKGdpdGh1YlRhcmdldEJyYW5jaClcbiAgICA6IGF3YWl0IGxhYmVsLmJyYW5jaGVzO1xufVxuIl19