/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/versioning/print-active-trains", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/versioning/long-term-support", "@angular/dev-infra-private/release/versioning/npm-registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printActiveReleaseTrains = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var long_term_support_1 = require("@angular/dev-infra-private/release/versioning/long-term-support");
    var npm_registry_1 = require("@angular/dev-infra-private/release/versioning/npm-registry");
    /**
     * Prints the active release trains to the console.
     * @params active Active release trains that should be printed.
     * @params config Release configuration used for querying NPM on published versions.
     */
    function printActiveReleaseTrains(active, config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var releaseCandidate, next, latest, isNextPublishedToNpm, nextTrainType, ltsBranches, rcVersion, rcTrainType, rcTrainPhase, _a, _b, ltsBranch;
            var e_1, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        releaseCandidate = active.releaseCandidate, next = active.next, latest = active.latest;
                        return [4 /*yield*/, npm_registry_1.isVersionPublishedToNpm(next.version, config)];
                    case 1:
                        isNextPublishedToNpm = _d.sent();
                        nextTrainType = next.isMajor ? 'major' : 'minor';
                        return [4 /*yield*/, long_term_support_1.fetchLongTermSupportBranchesFromNpm(config)];
                    case 2:
                        ltsBranches = _d.sent();
                        console_1.info();
                        console_1.info(console_1.blue('Current version branches in the project:'));
                        // Print information for release trains in the feature-freeze/release-candidate phase.
                        if (releaseCandidate !== null) {
                            rcVersion = releaseCandidate.version;
                            rcTrainType = releaseCandidate.isMajor ? 'major' : 'minor';
                            rcTrainPhase = rcVersion.prerelease[0] === 'next' ? 'feature-freeze' : 'release-candidate';
                            console_1.info(" \u2022 " + console_1.bold(releaseCandidate.branchName) + " contains changes for an upcoming " +
                                (rcTrainType + " that is currently in " + console_1.bold(rcTrainPhase) + " phase."));
                            console_1.info("   Most recent pre-release for this branch is \"" + console_1.bold("v" + rcVersion) + "\".");
                        }
                        // Print information about the release-train in the latest phase. i.e. the patch branch.
                        console_1.info(" \u2022 " + console_1.bold(latest.branchName) + " contains changes for the most recent patch.");
                        console_1.info("   Most recent patch version for this branch is \"" + console_1.bold("v" + latest.version) + "\".");
                        // Print information about the release-train in the next phase.
                        console_1.info(" \u2022 " + console_1.bold(next.branchName) + " contains changes for a " + nextTrainType + " " +
                            "currently in active development.");
                        // Note that there is a special case for versions in the next release-train. The version in
                        // the next branch is not always published to NPM. This can happen when we recently branched
                        // off for a feature-freeze release-train. More details are in the next pre-release action.
                        if (isNextPublishedToNpm) {
                            console_1.info("   Most recent pre-release version for this branch is \"" + console_1.bold("v" + next.version) + "\".");
                        }
                        else {
                            console_1.info("   Version is currently set to \"" + console_1.bold("v" + next.version) + "\", but has not been " +
                                "published yet.");
                        }
                        // If no release-train in release-candidate or feature-freeze phase is active,
                        // we print a message as last bullet point to make this clear.
                        if (releaseCandidate === null) {
                            console_1.info(' • No release-candidate or feature-freeze branch currently active.');
                        }
                        console_1.info();
                        console_1.info(console_1.blue('Current active LTS version branches:'));
                        // Print all active LTS branches (each branch as own bullet point).
                        if (ltsBranches.active.length !== 0) {
                            try {
                                for (_a = tslib_1.__values(ltsBranches.active), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    ltsBranch = _b.value;
                                    console_1.info(" \u2022 " + console_1.bold(ltsBranch.name) + " is currently in active long-term support phase.");
                                    console_1.info("   Most recent patch version for this branch is \"" + console_1.bold("v" + ltsBranch.version) + "\".");
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                        console_1.info();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printActiveReleaseTrains = printActiveReleaseTrains;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtYWN0aXZlLXRyYWlucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXFEO0lBSXJELHFHQUF3RTtJQUN4RSwyRkFBdUQ7SUFFdkQ7Ozs7T0FJRztJQUNILFNBQXNCLHdCQUF3QixDQUMxQyxNQUEyQixFQUFFLE1BQXFCOzs7Ozs7O3dCQUM3QyxnQkFBZ0IsR0FBa0IsTUFBTSxpQkFBeEIsRUFBRSxJQUFJLEdBQVksTUFBTSxLQUFsQixFQUFFLE1BQU0sR0FBSSxNQUFNLE9BQVYsQ0FBVzt3QkFDbkIscUJBQU0sc0NBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBQTs7d0JBQTFFLG9CQUFvQixHQUFHLFNBQW1EO3dCQUMxRSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7d0JBQ25DLHFCQUFNLHVEQUFtQyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBL0QsV0FBVyxHQUFHLFNBQWlEO3dCQUVyRSxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsY0FBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQzt3QkFFdkQsc0ZBQXNGO3dCQUN0RixJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTs0QkFDdkIsU0FBUyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQzs0QkFDckMsV0FBVyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7NEJBQzNELFlBQVksR0FDZCxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDOzRCQUNoRixjQUFJLENBQ0EsYUFBTSxjQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLHVDQUFvQztpQ0FDeEUsV0FBVyw4QkFBeUIsY0FBSSxDQUFDLFlBQVksQ0FBQyxZQUFTLENBQUEsQ0FBQyxDQUFDOzRCQUN4RSxjQUFJLENBQUMscURBQWtELGNBQUksQ0FBQyxNQUFJLFNBQVcsQ0FBQyxRQUFJLENBQUMsQ0FBQzt5QkFDbkY7d0JBRUQsd0ZBQXdGO3dCQUN4RixjQUFJLENBQUMsYUFBTSxjQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxpREFBOEMsQ0FBQyxDQUFDO3dCQUNsRixjQUFJLENBQUMsdURBQW9ELGNBQUksQ0FBQyxNQUFJLE1BQU0sQ0FBQyxPQUFTLENBQUMsUUFBSSxDQUFDLENBQUM7d0JBRXpGLCtEQUErRDt3QkFDL0QsY0FBSSxDQUNBLGFBQU0sY0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0NBQTJCLGFBQWEsTUFBRzs0QkFDdEUsa0NBQWtDLENBQUMsQ0FBQzt3QkFDeEMsMkZBQTJGO3dCQUMzRiw0RkFBNEY7d0JBQzVGLDJGQUEyRjt3QkFDM0YsSUFBSSxvQkFBb0IsRUFBRTs0QkFDeEIsY0FBSSxDQUFDLDZEQUEwRCxjQUFJLENBQUMsTUFBSSxJQUFJLENBQUMsT0FBUyxDQUFDLFFBQUksQ0FBQyxDQUFDO3lCQUM5Rjs2QkFBTTs0QkFDTCxjQUFJLENBQ0Esc0NBQW1DLGNBQUksQ0FBQyxNQUFJLElBQUksQ0FBQyxPQUFTLENBQUMsMEJBQXNCO2dDQUNqRixnQkFBZ0IsQ0FBQyxDQUFDO3lCQUN2Qjt3QkFFRCw4RUFBOEU7d0JBQzlFLDhEQUE4RDt3QkFDOUQsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7NEJBQzdCLGNBQUksQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO3lCQUM1RTt3QkFFRCxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsY0FBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQzt3QkFFbkQsbUVBQW1FO3dCQUNuRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7Z0NBQ25DLEtBQXdCLEtBQUEsaUJBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQSw0Q0FBRTtvQ0FBakMsU0FBUztvQ0FDbEIsY0FBSSxDQUFDLGFBQU0sY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscURBQWtELENBQUMsQ0FBQztvQ0FDbkYsY0FBSSxDQUFDLHVEQUFvRCxjQUFJLENBQUMsTUFBSSxTQUFTLENBQUMsT0FBUyxDQUFDLFFBQUksQ0FBQyxDQUFDO2lDQUM3Rjs7Ozs7Ozs7O3lCQUNGO3dCQUVELGNBQUksRUFBRSxDQUFDOzs7OztLQUNSO0lBM0RELDREQTJEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2JsdWUsIGJvbGQsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4vYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG19IGZyb20gJy4vbG9uZy10ZXJtLXN1cHBvcnQnO1xuaW1wb3J0IHtpc1ZlcnNpb25QdWJsaXNoZWRUb05wbX0gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKipcbiAqIFByaW50cyB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRvIHRoZSBjb25zb2xlLlxuICogQHBhcmFtcyBhY3RpdmUgQWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRoYXQgc2hvdWxkIGJlIHByaW50ZWQuXG4gKiBAcGFyYW1zIGNvbmZpZyBSZWxlYXNlIGNvbmZpZ3VyYXRpb24gdXNlZCBmb3IgcXVlcnlpbmcgTlBNIG9uIHB1Ymxpc2hlZCB2ZXJzaW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhcbiAgICBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7cmVsZWFzZUNhbmRpZGF0ZSwgbmV4dCwgbGF0ZXN0fSA9IGFjdGl2ZTtcbiAgY29uc3QgaXNOZXh0UHVibGlzaGVkVG9OcG0gPSBhd2FpdCBpc1ZlcnNpb25QdWJsaXNoZWRUb05wbShuZXh0LnZlcnNpb24sIGNvbmZpZyk7XG4gIGNvbnN0IG5leHRUcmFpblR5cGUgPSBuZXh0LmlzTWFqb3IgPyAnbWFqb3InIDogJ21pbm9yJztcbiAgY29uc3QgbHRzQnJhbmNoZXMgPSBhd2FpdCBmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbShjb25maWcpO1xuXG4gIGluZm8oKTtcbiAgaW5mbyhibHVlKCdDdXJyZW50IHZlcnNpb24gYnJhbmNoZXMgaW4gdGhlIHByb2plY3Q6JykpO1xuXG4gIC8vIFByaW50IGluZm9ybWF0aW9uIGZvciByZWxlYXNlIHRyYWlucyBpbiB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuXG4gIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgY29uc3QgcmNWZXJzaW9uID0gcmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uO1xuICAgIGNvbnN0IHJjVHJhaW5UeXBlID0gcmVsZWFzZUNhbmRpZGF0ZS5pc01ham9yID8gJ21ham9yJyA6ICdtaW5vcic7XG4gICAgY29uc3QgcmNUcmFpblBoYXNlID1cbiAgICAgICAgcmNWZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JyA/ICdmZWF0dXJlLWZyZWV6ZScgOiAncmVsZWFzZS1jYW5kaWRhdGUnO1xuICAgIGluZm8oXG4gICAgICAgIGAg4oCiICR7Ym9sZChyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhbiB1cGNvbWluZyBgICtcbiAgICAgICAgYCR7cmNUcmFpblR5cGV9IHRoYXQgaXMgY3VycmVudGx5IGluICR7Ym9sZChyY1RyYWluUGhhc2UpfSBwaGFzZS5gKTtcbiAgICBpbmZvKGAgICBNb3N0IHJlY2VudCBwcmUtcmVsZWFzZSBmb3IgdGhpcyBicmFuY2ggaXMgXCIke2JvbGQoYHYke3JjVmVyc2lvbn1gKX1cIi5gKTtcbiAgfVxuXG4gIC8vIFByaW50IGluZm9ybWF0aW9uIGFib3V0IHRoZSByZWxlYXNlLXRyYWluIGluIHRoZSBsYXRlc3QgcGhhc2UuIGkuZS4gdGhlIHBhdGNoIGJyYW5jaC5cbiAgaW5mbyhgIOKAoiAke2JvbGQobGF0ZXN0LmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciB0aGUgbW9zdCByZWNlbnQgcGF0Y2guYCk7XG4gIGluZm8oYCAgIE1vc3QgcmVjZW50IHBhdGNoIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtsYXRlc3QudmVyc2lvbn1gKX1cIi5gKTtcblxuICAvLyBQcmludCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBwaGFzZS5cbiAgaW5mbyhcbiAgICAgIGAg4oCiICR7Ym9sZChuZXh0LmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhICR7bmV4dFRyYWluVHlwZX0gYCArXG4gICAgICBgY3VycmVudGx5IGluIGFjdGl2ZSBkZXZlbG9wbWVudC5gKTtcbiAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB2ZXJzaW9ucyBpbiB0aGUgbmV4dCByZWxlYXNlLXRyYWluLiBUaGUgdmVyc2lvbiBpblxuICAvLyB0aGUgbmV4dCBicmFuY2ggaXMgbm90IGFsd2F5cyBwdWJsaXNoZWQgdG8gTlBNLiBUaGlzIGNhbiBoYXBwZW4gd2hlbiB3ZSByZWNlbnRseSBicmFuY2hlZFxuICAvLyBvZmYgZm9yIGEgZmVhdHVyZS1mcmVlemUgcmVsZWFzZS10cmFpbi4gTW9yZSBkZXRhaWxzIGFyZSBpbiB0aGUgbmV4dCBwcmUtcmVsZWFzZSBhY3Rpb24uXG4gIGlmIChpc05leHRQdWJsaXNoZWRUb05wbSkge1xuICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHByZS1yZWxlYXNlIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtuZXh0LnZlcnNpb259YCl9XCIuYCk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhcbiAgICAgICAgYCAgIFZlcnNpb24gaXMgY3VycmVudGx5IHNldCB0byBcIiR7Ym9sZChgdiR7bmV4dC52ZXJzaW9ufWApfVwiLCBidXQgaGFzIG5vdCBiZWVuIGAgK1xuICAgICAgICBgcHVibGlzaGVkIHlldC5gKTtcbiAgfVxuXG4gIC8vIElmIG5vIHJlbGVhc2UtdHJhaW4gaW4gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgcGhhc2UgaXMgYWN0aXZlLFxuICAvLyB3ZSBwcmludCBhIG1lc3NhZ2UgYXMgbGFzdCBidWxsZXQgcG9pbnQgdG8gbWFrZSB0aGlzIGNsZWFyLlxuICBpZiAocmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgIGluZm8oJyDigKIgTm8gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgYnJhbmNoIGN1cnJlbnRseSBhY3RpdmUuJyk7XG4gIH1cblxuICBpbmZvKCk7XG4gIGluZm8oYmx1ZSgnQ3VycmVudCBhY3RpdmUgTFRTIHZlcnNpb24gYnJhbmNoZXM6JykpO1xuXG4gIC8vIFByaW50IGFsbCBhY3RpdmUgTFRTIGJyYW5jaGVzIChlYWNoIGJyYW5jaCBhcyBvd24gYnVsbGV0IHBvaW50KS5cbiAgaWYgKGx0c0JyYW5jaGVzLmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICBmb3IgKGNvbnN0IGx0c0JyYW5jaCBvZiBsdHNCcmFuY2hlcy5hY3RpdmUpIHtcbiAgICAgIGluZm8oYCDigKIgJHtib2xkKGx0c0JyYW5jaC5uYW1lKX0gaXMgY3VycmVudGx5IGluIGFjdGl2ZSBsb25nLXRlcm0gc3VwcG9ydCBwaGFzZS5gKTtcbiAgICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHBhdGNoIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtsdHNCcmFuY2gudmVyc2lvbn1gKX1cIi5gKTtcbiAgICB9XG4gIH1cblxuICBpbmZvKCk7XG59XG4iXX0=