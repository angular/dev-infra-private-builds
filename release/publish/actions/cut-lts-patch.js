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
        define("@angular/dev-infra-private/release/publish/actions/cut-lts-patch", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/release/versioning/inc-semver", "@angular/dev-infra-private/release/versioning/long-term-support", "@angular/dev-infra-private/release/publish/actions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutLongTermSupportPatchAction = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var inc_semver_1 = require("@angular/dev-infra-private/release/versioning/inc-semver");
    var long_term_support_1 = require("@angular/dev-infra-private/release/versioning/long-term-support");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    /**
     * Release action that cuts a new patch release for an active release-train in the long-term
     * support phase. The patch segment is incremented. The changelog is generated for the new
     * patch version, but also needs to be cherry-picked into the next development branch.
     */
    var CutLongTermSupportPatchAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutLongTermSupportPatchAction, _super);
        function CutLongTermSupportPatchAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** Promise resolving an object describing long-term support branches. */
            _this.ltsBranches = long_term_support_1.fetchLongTermSupportBranchesFromNpm(_this.config);
            return _this;
        }
        CutLongTermSupportPatchAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var active;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ltsBranches];
                        case 1:
                            active = (_a.sent()).active;
                            return [2 /*return*/, "Cut a new release for an active LTS branch (" + active.length + " active)."];
                    }
                });
            });
        };
        CutLongTermSupportPatchAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var ltsBranch, newVersion, _a, id, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._promptForTargetLtsBranch()];
                        case 1:
                            ltsBranch = _b.sent();
                            newVersion = inc_semver_1.semverInc(ltsBranch.version, 'patch');
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name)];
                        case 2:
                            _a = _b.sent(), id = _a.pullRequest.id, releaseNotes = _a.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, ltsBranch.name, ltsBranch.npmDistTag)];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(releaseNotes, ltsBranch.name)];
                        case 5:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Prompts the user to select an LTS branch for which a patch should but cut. */
        CutLongTermSupportPatchAction.prototype._promptForTargetLtsBranch = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, active, inactive, activeBranchChoices, _b, activeLtsBranch, inactiveLtsBranch;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.ltsBranches];
                        case 1:
                            _a = _c.sent(), active = _a.active, inactive = _a.inactive;
                            activeBranchChoices = active.map(function (branch) { return _this._getChoiceForLtsBranch(branch); });
                            // If there are inactive LTS branches, we allow them to be selected. In some situations,
                            // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
                            // has been increased due to exceptional events ()
                            if (inactive.length !== 0) {
                                activeBranchChoices.push({ name: 'Inactive LTS versions (not recommended)', value: null });
                            }
                            return [4 /*yield*/, inquirer_1.prompt([
                                    {
                                        name: 'activeLtsBranch',
                                        type: 'list',
                                        message: 'Please select a version for which you want to cut an LTS patch',
                                        choices: activeBranchChoices,
                                    },
                                    {
                                        name: 'inactiveLtsBranch',
                                        type: 'list',
                                        when: function (o) { return o.activeLtsBranch === null; },
                                        message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
                                        choices: inactive.map(function (branch) { return _this._getChoiceForLtsBranch(branch); }),
                                    }
                                ])];
                        case 2:
                            _b = _c.sent(), activeLtsBranch = _b.activeLtsBranch, inactiveLtsBranch = _b.inactiveLtsBranch;
                            return [2 /*return*/, activeLtsBranch !== null && activeLtsBranch !== void 0 ? activeLtsBranch : inactiveLtsBranch];
                    }
                });
            });
        };
        /** Gets an inquirer choice for the given LTS branch. */
        CutLongTermSupportPatchAction.prototype._getChoiceForLtsBranch = function (branch) {
            return { name: "v" + branch.version.major + " (from " + branch.name + ")", value: branch };
        };
        CutLongTermSupportPatchAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // LTS patch versions can be only cut if there are release trains in LTS phase.
                    // This action is always selectable as we support publishing of old LTS branches,
                    // and have prompt for selecting an LTS branch when the action performs.
                    return [2 /*return*/, true];
                });
            });
        };
        return CutLongTermSupportPatchAction;
    }(actions_1.ReleaseAction));
    exports.CutLongTermSupportPatchAction = CutLongTermSupportPatchAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFJbkQsdUZBQXNEO0lBQ3RELHFHQUF1RjtJQUN2Riw4RUFBeUM7SUFZekM7Ozs7T0FJRztJQUNIO1FBQW1ELHlEQUFhO1FBQWhFO1lBQUEscUVBOERDO1lBN0RDLHlFQUF5RTtZQUN6RSxpQkFBVyxHQUFHLHVEQUFtQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7UUE0RGpFLENBQUM7UUExRE8sc0RBQWMsR0FBcEI7Ozs7O2dDQUNtQixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFBOzs0QkFBaEMsTUFBTSxHQUFJLENBQUEsU0FBc0IsQ0FBQSxPQUExQjs0QkFDYixzQkFBTyxpREFBK0MsTUFBTSxDQUFDLE1BQU0sY0FBVyxFQUFDOzs7O1NBQ2hGO1FBRUssK0NBQU8sR0FBYjs7Ozs7Z0NBQ29CLHFCQUFNLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFBOzs0QkFBbEQsU0FBUyxHQUFHLFNBQXNDOzRCQUNsRCxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzRCQUVyRCxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQTs7NEJBRGxFLEtBQ0YsU0FBb0UsRUFEbkQsRUFBRSxvQkFBQSxFQUFHLFlBQVksa0JBQUE7NEJBR3RDLHFCQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsRUFBQTs7NEJBQTNDLFNBQTJDLENBQUM7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBOUUsU0FBOEUsQ0FBQzs0QkFDL0UscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUE7OzRCQUExRSxTQUEwRSxDQUFDOzs7OztTQUM1RTtRQUVELGlGQUFpRjtRQUNuRSxpRUFBeUIsR0FBdkM7Ozs7OztnQ0FDNkIscUJBQU0sSUFBSSxDQUFDLFdBQVcsRUFBQTs7NEJBQTNDLEtBQXFCLFNBQXNCLEVBQTFDLE1BQU0sWUFBQSxFQUFFLFFBQVEsY0FBQTs0QkFDakIsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDOzRCQUV0Rix3RkFBd0Y7NEJBQ3hGLHFGQUFxRjs0QkFDckYsa0RBQWtEOzRCQUNsRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dDQUN6QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUseUNBQXlDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7NkJBQzFGOzRCQUdHLHFCQUFNLGlCQUFNLENBQW9FO29DQUM5RTt3Q0FDRSxJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsTUFBTTt3Q0FDWixPQUFPLEVBQUUsZ0VBQWdFO3dDQUN6RSxPQUFPLEVBQUUsbUJBQW1CO3FDQUM3QjtvQ0FDRDt3Q0FDRSxJQUFJLEVBQUUsbUJBQW1CO3dDQUN6QixJQUFJLEVBQUUsTUFBTTt3Q0FDWixJQUFJLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksRUFBMUIsQ0FBMEI7d0NBQ3JDLE9BQU8sRUFBRSw4RUFBOEU7d0NBQ3ZGLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsS0FBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUFuQyxDQUFtQyxDQUFDO3FDQUNyRTtpQ0FDRixDQUFDLEVBQUE7OzRCQWZBLEtBQ0YsU0FjRSxFQWZDLGVBQWUscUJBQUEsRUFBRSxpQkFBaUIsdUJBQUE7NEJBZ0J6QyxzQkFBTyxlQUFlLGFBQWYsZUFBZSxjQUFmLGVBQWUsR0FBSSxpQkFBaUIsRUFBQzs7OztTQUM3QztRQUVELHdEQUF3RDtRQUNoRCw4REFBc0IsR0FBOUIsVUFBK0IsTUFBaUI7WUFDOUMsT0FBTyxFQUFDLElBQUksRUFBRSxNQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxlQUFVLE1BQU0sQ0FBQyxJQUFJLE1BQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7UUFDakYsQ0FBQztRQUVZLHNDQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLCtFQUErRTtvQkFDL0UsaUZBQWlGO29CQUNqRix3RUFBd0U7b0JBQ3hFLHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFDSCxvQ0FBQztJQUFELENBQUMsQUE5REQsQ0FBbUQsdUJBQWEsR0E4RC9EO0lBOURZLHNFQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbX0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYW4gTFRTIHZlcnNpb24gYnJhbmNoLiAqL1xuaW50ZXJmYWNlIEx0c0JyYW5jaCB7XG4gIC8qKiBOYW1lIG9mIHRoZSBicmFuY2guICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIE1vc3QgcmVjZW50IHZlcnNpb24gZm9yIHRoZSBnaXZlbiBMVFMgYnJhbmNoLiAqL1xuICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyO1xuICAvKiogTlBNIGRpc3QgdGFnIGZvciB0aGUgTFRTIHZlcnNpb24uICovXG4gIG5wbURpc3RUYWc6IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBuZXcgcGF0Y2ggcmVsZWFzZSBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIGxvbmctdGVybVxuICogc3VwcG9ydCBwaGFzZS4gVGhlIHBhdGNoIHNlZ21lbnQgaXMgaW5jcmVtZW50ZWQuIFRoZSBjaGFuZ2Vsb2cgaXMgZ2VuZXJhdGVkIGZvciB0aGUgbmV3XG4gKiBwYXRjaCB2ZXJzaW9uLCBidXQgYWxzbyBuZWVkcyB0byBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIG5leHQgZGV2ZWxvcG1lbnQgYnJhbmNoLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0TG9uZ1Rlcm1TdXBwb3J0UGF0Y2hBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFByb21pc2UgcmVzb2x2aW5nIGFuIG9iamVjdCBkZXNjcmliaW5nIGxvbmctdGVybSBzdXBwb3J0IGJyYW5jaGVzLiAqL1xuICBsdHNCcmFuY2hlcyA9IGZldGNoTG9uZ1Rlcm1TdXBwb3J0QnJhbmNoZXNGcm9tTnBtKHRoaXMuY29uZmlnKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YWN0aXZlfSA9IGF3YWl0IHRoaXMubHRzQnJhbmNoZXM7XG4gICAgcmV0dXJuIGBDdXQgYSBuZXcgcmVsZWFzZSBmb3IgYW4gYWN0aXZlIExUUyBicmFuY2ggKCR7YWN0aXZlLmxlbmd0aH0gYWN0aXZlKS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCBsdHNCcmFuY2ggPSBhd2FpdCB0aGlzLl9wcm9tcHRGb3JUYXJnZXRMdHNCcmFuY2goKTtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gc2VtdmVySW5jKGx0c0JyYW5jaC52ZXJzaW9uLCAncGF0Y2gnKTtcbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGx0c0JyYW5jaC5uYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSwgbHRzQnJhbmNoLm5wbURpc3RUYWcpO1xuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgbHRzQnJhbmNoLm5hbWUpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIHVzZXIgdG8gc2VsZWN0IGFuIExUUyBicmFuY2ggZm9yIHdoaWNoIGEgcGF0Y2ggc2hvdWxkIGJ1dCBjdXQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpOiBQcm9taXNlPEx0c0JyYW5jaD4ge1xuICAgIGNvbnN0IHthY3RpdmUsIGluYWN0aXZlfSA9IGF3YWl0IHRoaXMubHRzQnJhbmNoZXM7XG4gICAgY29uc3QgYWN0aXZlQnJhbmNoQ2hvaWNlcyA9IGFjdGl2ZS5tYXAoYnJhbmNoID0+IHRoaXMuX2dldENob2ljZUZvckx0c0JyYW5jaChicmFuY2gpKTtcblxuICAgIC8vIElmIHRoZXJlIGFyZSBpbmFjdGl2ZSBMVFMgYnJhbmNoZXMsIHdlIGFsbG93IHRoZW0gdG8gYmUgc2VsZWN0ZWQuIEluIHNvbWUgc2l0dWF0aW9ucyxcbiAgICAvLyBwYXRjaCByZWxlYXNlcyBhcmUgc3RpbGwgY3V0IGZvciBpbmFjdGl2ZSBMVFMgYnJhbmNoZXMuIGUuZy4gd2hlbiB0aGUgTFRTIGR1cmF0aW9uXG4gICAgLy8gaGFzIGJlZW4gaW5jcmVhc2VkIGR1ZSB0byBleGNlcHRpb25hbCBldmVudHMgKClcbiAgICBpZiAoaW5hY3RpdmUubGVuZ3RoICE9PSAwKSB7XG4gICAgICBhY3RpdmVCcmFuY2hDaG9pY2VzLnB1c2goe25hbWU6ICdJbmFjdGl2ZSBMVFMgdmVyc2lvbnMgKG5vdCByZWNvbW1lbmRlZCknLCB2YWx1ZTogbnVsbH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHthY3RpdmVMdHNCcmFuY2gsIGluYWN0aXZlTHRzQnJhbmNofSA9XG4gICAgICAgIGF3YWl0IHByb21wdDx7YWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2ggfCBudWxsLCBpbmFjdGl2ZUx0c0JyYW5jaDogTHRzQnJhbmNofT4oW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdhY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYSB2ZXJzaW9uIGZvciB3aGljaCB5b3Ugd2FudCB0byBjdXQgYW4gTFRTIHBhdGNoJyxcbiAgICAgICAgICAgIGNob2ljZXM6IGFjdGl2ZUJyYW5jaENob2ljZXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnaW5hY3RpdmVMdHNCcmFuY2gnLFxuICAgICAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICAgICAgd2hlbjogbyA9PiBvLmFjdGl2ZUx0c0JyYW5jaCA9PT0gbnVsbCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGluYWN0aXZlIExUUyB2ZXJzaW9uIGZvciB3aGljaCB5b3Ugd2FudCB0byBjdXQgYW4gTFRTIHBhdGNoJyxcbiAgICAgICAgICAgIGNob2ljZXM6IGluYWN0aXZlLm1hcChicmFuY2ggPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpLFxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgcmV0dXJuIGFjdGl2ZUx0c0JyYW5jaCA/PyBpbmFjdGl2ZUx0c0JyYW5jaDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIGlucXVpcmVyIGNob2ljZSBmb3IgdGhlIGdpdmVuIExUUyBicmFuY2guICovXG4gIHByaXZhdGUgX2dldENob2ljZUZvckx0c0JyYW5jaChicmFuY2g6IEx0c0JyYW5jaCk6IExpc3RDaG9pY2VPcHRpb25zIHtcbiAgICByZXR1cm4ge25hbWU6IGB2JHticmFuY2gudmVyc2lvbi5tYWpvcn0gKGZyb20gJHticmFuY2gubmFtZX0pYCwgdmFsdWU6IGJyYW5jaH07XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gTFRTIHBhdGNoIHZlcnNpb25zIGNhbiBiZSBvbmx5IGN1dCBpZiB0aGVyZSBhcmUgcmVsZWFzZSB0cmFpbnMgaW4gTFRTIHBoYXNlLlxuICAgIC8vIFRoaXMgYWN0aW9uIGlzIGFsd2F5cyBzZWxlY3RhYmxlIGFzIHdlIHN1cHBvcnQgcHVibGlzaGluZyBvZiBvbGQgTFRTIGJyYW5jaGVzLFxuICAgIC8vIGFuZCBoYXZlIHByb21wdCBmb3Igc2VsZWN0aW5nIGFuIExUUyBicmFuY2ggd2hlbiB0aGUgYWN0aW9uIHBlcmZvcm1zLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=