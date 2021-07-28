/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator, __values } from "tslib";
import { matchesPattern } from './string-pattern';
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
var InvalidTargetBranchError = /** @class */ (function () {
    function InvalidTargetBranchError(failureMessage) {
        this.failureMessage = failureMessage;
    }
    return InvalidTargetBranchError;
}());
export { InvalidTargetBranchError };
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
var InvalidTargetLabelError = /** @class */ (function () {
    function InvalidTargetLabelError(failureMessage) {
        this.failureMessage = failureMessage;
    }
    return InvalidTargetLabelError;
}());
export { InvalidTargetLabelError };
/** Gets the target label from the specified pull request labels. */
export function getTargetLabelFromPullRequest(config, labels) {
    var e_1, _a;
    /** List of discovered target labels for the PR. */
    var matches = [];
    var _loop_1 = function (label) {
        var match = config.labels.find(function (_a) {
            var pattern = _a.pattern;
            return matchesPattern(label, pattern);
        });
        if (match !== undefined) {
            matches.push(match);
        }
    };
    try {
        for (var labels_1 = __values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
            var label = labels_1_1.value;
            _loop_1(label);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (matches.length === 1) {
        return matches[0];
    }
    if (matches.length === 0) {
        throw new InvalidTargetLabelError('Unable to determine target for the PR as it has no target label.');
    }
    throw new InvalidTargetLabelError('Unable to determine target for the PR as it has multiple target labels.');
}
/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
export function getBranchesFromTargetLabel(label, githubTargetBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(typeof label.branches === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, label.branches(githubTargetBranch)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, label.branches];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWhEOzs7R0FHRztBQUNIO0lBQ0Usa0NBQW1CLGNBQXNCO1FBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO0lBQUcsQ0FBQztJQUMvQywrQkFBQztBQUFELENBQUMsQUFGRCxJQUVDOztBQUVEOzs7R0FHRztBQUNIO0lBQ0UsaUNBQW1CLGNBQXNCO1FBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO0lBQUcsQ0FBQztJQUMvQyw4QkFBQztBQUFELENBQUMsQUFGRCxJQUVDOztBQUVELG9FQUFvRTtBQUNwRSxNQUFNLFVBQVUsNkJBQTZCLENBQ3pDLE1BQW1DLEVBQUUsTUFBZ0I7O0lBQ3ZELG1EQUFtRDtJQUNuRCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7NEJBQ1IsS0FBSztRQUNkLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUztnQkFBUixPQUFPLGFBQUE7WUFBTSxPQUFBLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBQTlCLENBQThCLENBQUMsQ0FBQztRQUNoRixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQjs7O1FBSkgsS0FBb0IsSUFBQSxXQUFBLFNBQUEsTUFBTSxDQUFBLDhCQUFBO1lBQXJCLElBQU0sS0FBSyxtQkFBQTtvQkFBTCxLQUFLO1NBS2Y7Ozs7Ozs7OztJQUNELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkI7SUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE1BQU0sSUFBSSx1QkFBdUIsQ0FDN0Isa0VBQWtFLENBQUMsQ0FBQztLQUN6RTtJQUNELE1BQU0sSUFBSSx1QkFBdUIsQ0FDN0IseUVBQXlFLENBQUMsQ0FBQztBQUNqRixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQWdCLDBCQUEwQixDQUM1QyxLQUFrQixFQUFFLGtCQUEwQjs7Ozs7O3lCQUN6QyxDQUFBLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUEsRUFBcEMsd0JBQW9DO29CQUFHLHFCQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBQTs7b0JBQXhDLEtBQUEsU0FBd0MsQ0FBQTs7d0JBQ3hDLHFCQUFNLEtBQUssQ0FBQyxRQUFRLEVBQUE7O29CQUFwQixLQUFBLFNBQW9CLENBQUE7O3dCQURsRSwwQkFDbUU7Ozs7Q0FDcEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuXG4vKipcbiAqIFVuaXF1ZSBlcnJvciB0aGF0IGNhbiBiZSB0aHJvd24gaW4gdGhlIG1lcmdlIGNvbmZpZ3VyYXRpb24gaWYgYW5cbiAqIGludmFsaWQgYnJhbmNoIGlzIHRhcmdldGVkLlxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZhaWx1cmVNZXNzYWdlOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogVW5pcXVlIGVycm9yIHRoYXQgY2FuIGJlIHRocm93biBpbiB0aGUgbWVyZ2UgY29uZmlndXJhdGlvbiBpZiBhblxuICogaW52YWxpZCBsYWJlbCBoYXMgYmVlbiBhcHBsaWVkIHRvIGEgcHVsbCByZXF1ZXN0LlxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFRhcmdldExhYmVsRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmFpbHVyZU1lc3NhZ2U6IHN0cmluZykge31cbn1cblxuLyoqIEdldHMgdGhlIHRhcmdldCBsYWJlbCBmcm9tIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGxhYmVscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChcbiAgICBjb25maWc6IFBpY2s8TWVyZ2VDb25maWcsICdsYWJlbHMnPiwgbGFiZWxzOiBzdHJpbmdbXSk6IFRhcmdldExhYmVsIHtcbiAgLyoqIExpc3Qgb2YgZGlzY292ZXJlZCB0YXJnZXQgbGFiZWxzIGZvciB0aGUgUFIuICovXG4gIGNvbnN0IG1hdGNoZXMgPSBbXTtcbiAgZm9yIChjb25zdCBsYWJlbCBvZiBsYWJlbHMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGNvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PiBtYXRjaGVzUGF0dGVybihsYWJlbCwgcGF0dGVybikpO1xuICAgIGlmIChtYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXRjaGVzLnB1c2gobWF0Y2gpO1xuICAgIH1cbiAgfVxuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgfVxuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICdVbmFibGUgdG8gZGV0ZXJtaW5lIHRhcmdldCBmb3IgdGhlIFBSIGFzIGl0IGhhcyBubyB0YXJnZXQgbGFiZWwuJyk7XG4gIH1cbiAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgJ1VuYWJsZSB0byBkZXRlcm1pbmUgdGFyZ2V0IGZvciB0aGUgUFIgYXMgaXQgaGFzIG11bHRpcGxlIHRhcmdldCBsYWJlbHMuJyk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYnJhbmNoZXMgZnJvbSB0aGUgc3BlY2lmaWVkIHRhcmdldCBsYWJlbC5cbiAqXG4gKiBAdGhyb3dzIHtJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gSW52YWxpZCBsYWJlbCBoYXMgYmVlbiBhcHBsaWVkIHRvIHB1bGwgcmVxdWVzdC5cbiAqIEB0aHJvd3Mge0ludmFsaWRUYXJnZXRCcmFuY2hFcnJvcn0gSW52YWxpZCBHaXRodWIgdGFyZ2V0IGJyYW5jaCBoYXMgYmVlbiBzZWxlY3RlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKFxuICAgIGxhYmVsOiBUYXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIHJldHVybiB0eXBlb2YgbGFiZWwuYnJhbmNoZXMgPT09ICdmdW5jdGlvbicgPyBhd2FpdCBsYWJlbC5icmFuY2hlcyhnaXRodWJUYXJnZXRCcmFuY2gpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGxhYmVsLmJyYW5jaGVzO1xufVxuIl19