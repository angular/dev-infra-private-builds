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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LWx0cy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbHRzLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFHbkQsdUZBQXNEO0lBQ3RELHFHQUFrRztJQUNsRyw4RUFBeUM7SUFFekM7Ozs7T0FJRztJQUNIO1FBQW1ELHlEQUFhO1FBQWhFO1lBQUEscUVBOERDO1lBN0RDLHlFQUF5RTtZQUN6RSxpQkFBVyxHQUFHLHVEQUFtQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7UUE0RGpFLENBQUM7UUExRE8sc0RBQWMsR0FBcEI7Ozs7O2dDQUNtQixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFBOzs0QkFBaEMsTUFBTSxHQUFJLENBQUEsU0FBc0IsQ0FBQSxPQUExQjs0QkFDYixzQkFBTyxpREFBK0MsTUFBTSxDQUFDLE1BQU0sY0FBVyxFQUFDOzs7O1NBQ2hGO1FBRUssK0NBQU8sR0FBYjs7Ozs7Z0NBQ29CLHFCQUFNLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFBOzs0QkFBbEQsU0FBUyxHQUFHLFNBQXNDOzRCQUNsRCxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzRCQUVyRCxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQTs7NEJBRGxFLEtBQ0YsU0FBb0UsRUFEbkQsRUFBRSxvQkFBQSxFQUFHLFlBQVksa0JBQUE7NEJBR3RDLHFCQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsRUFBQTs7NEJBQTNDLFNBQTJDLENBQUM7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBOUUsU0FBOEUsQ0FBQzs0QkFDL0UscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUE7OzRCQUExRSxTQUEwRSxDQUFDOzs7OztTQUM1RTtRQUVELGlGQUFpRjtRQUNuRSxpRUFBeUIsR0FBdkM7Ozs7OztnQ0FDNkIscUJBQU0sSUFBSSxDQUFDLFdBQVcsRUFBQTs7NEJBQTNDLEtBQXFCLFNBQXNCLEVBQTFDLE1BQU0sWUFBQSxFQUFFLFFBQVEsY0FBQTs0QkFDakIsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDOzRCQUV0Rix3RkFBd0Y7NEJBQ3hGLHFGQUFxRjs0QkFDckYsa0RBQWtEOzRCQUNsRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dDQUN6QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUseUNBQXlDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7NkJBQzFGOzRCQUdHLHFCQUFNLGlCQUFNLENBQW9FO29DQUM5RTt3Q0FDRSxJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsTUFBTTt3Q0FDWixPQUFPLEVBQUUsZ0VBQWdFO3dDQUN6RSxPQUFPLEVBQUUsbUJBQW1CO3FDQUM3QjtvQ0FDRDt3Q0FDRSxJQUFJLEVBQUUsbUJBQW1CO3dDQUN6QixJQUFJLEVBQUUsTUFBTTt3Q0FDWixJQUFJLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksRUFBMUIsQ0FBMEI7d0NBQ3JDLE9BQU8sRUFBRSw4RUFBOEU7d0NBQ3ZGLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsS0FBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUFuQyxDQUFtQyxDQUFDO3FDQUNyRTtpQ0FDRixDQUFDLEVBQUE7OzRCQWZBLEtBQ0YsU0FjRSxFQWZDLGVBQWUscUJBQUEsRUFBRSxpQkFBaUIsdUJBQUE7NEJBZ0J6QyxzQkFBTyxlQUFlLGFBQWYsZUFBZSxjQUFmLGVBQWUsR0FBSSxpQkFBaUIsRUFBQzs7OztTQUM3QztRQUVELHdEQUF3RDtRQUNoRCw4REFBc0IsR0FBOUIsVUFBK0IsTUFBaUI7WUFDOUMsT0FBTyxFQUFDLElBQUksRUFBRSxNQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxlQUFVLE1BQU0sQ0FBQyxJQUFJLE1BQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7UUFDakYsQ0FBQztRQUVZLHNDQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLCtFQUErRTtvQkFDL0UsaUZBQWlGO29CQUNqRix3RUFBd0U7b0JBQ3hFLHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFDSCxvQ0FBQztJQUFELENBQUMsQUE5REQsQ0FBbUQsdUJBQWEsR0E4RC9EO0lBOURZLHNFQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0sIEx0c0JyYW5jaH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIG5ldyBwYXRjaCByZWxlYXNlIGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbG9uZy10ZXJtXG4gKiBzdXBwb3J0IHBoYXNlLiBUaGUgcGF0Y2ggc2VnbWVudCBpcyBpbmNyZW1lbnRlZC4gVGhlIGNoYW5nZWxvZyBpcyBnZW5lcmF0ZWQgZm9yIHRoZSBuZXdcbiAqIHBhdGNoIHZlcnNpb24sIGJ1dCBhbHNvIG5lZWRzIHRvIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgbmV4dCBkZXZlbG9wbWVudCBicmFuY2guXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgYW4gb2JqZWN0IGRlc2NyaWJpbmcgbG9uZy10ZXJtIHN1cHBvcnQgYnJhbmNoZXMuICovXG4gIGx0c0JyYW5jaGVzID0gZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0odGhpcy5jb25maWcpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHthY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICByZXR1cm4gYEN1dCBhIG5ldyByZWxlYXNlIGZvciBhbiBhY3RpdmUgTFRTIGJyYW5jaCAoJHthY3RpdmUubGVuZ3RofSBhY3RpdmUpLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IGx0c0JyYW5jaCA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclRhcmdldEx0c0JyYW5jaCgpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBzZW12ZXJJbmMobHRzQnJhbmNoLnZlcnNpb24sICdwYXRjaCcpO1xuICAgIGNvbnN0IHtwdWxsUmVxdWVzdDoge2lkfSwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgbHRzQnJhbmNoLm5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGx0c0JyYW5jaC5uYW1lLCBsdHNCcmFuY2gubnBtRGlzdFRhZyk7XG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBsdHNCcmFuY2gubmFtZSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gTFRTIGJyYW5jaCBmb3Igd2hpY2ggYSBwYXRjaCBzaG91bGQgYnV0IGN1dC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yVGFyZ2V0THRzQnJhbmNoKCk6IFByb21pc2U8THRzQnJhbmNoPiB7XG4gICAgY29uc3Qge2FjdGl2ZSwgaW5hY3RpdmV9ID0gYXdhaXQgdGhpcy5sdHNCcmFuY2hlcztcbiAgICBjb25zdCBhY3RpdmVCcmFuY2hDaG9pY2VzID0gYWN0aXZlLm1hcChicmFuY2ggPT4gdGhpcy5fZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaCkpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGluYWN0aXZlIExUUyBicmFuY2hlcywgd2UgYWxsb3cgdGhlbSB0byBiZSBzZWxlY3RlZC4gSW4gc29tZSBzaXR1YXRpb25zLFxuICAgIC8vIHBhdGNoIHJlbGVhc2VzIGFyZSBzdGlsbCBjdXQgZm9yIGluYWN0aXZlIExUUyBicmFuY2hlcy4gZS5nLiB3aGVuIHRoZSBMVFMgZHVyYXRpb25cbiAgICAvLyBoYXMgYmVlbiBpbmNyZWFzZWQgZHVlIHRvIGV4Y2VwdGlvbmFsIGV2ZW50cyAoKVxuICAgIGlmIChpbmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIGFjdGl2ZUJyYW5jaENob2ljZXMucHVzaCh7bmFtZTogJ0luYWN0aXZlIExUUyB2ZXJzaW9ucyAobm90IHJlY29tbWVuZGVkKScsIHZhbHVlOiBudWxsfSk7XG4gICAgfVxuXG4gICAgY29uc3Qge2FjdGl2ZUx0c0JyYW5jaCwgaW5hY3RpdmVMdHNCcmFuY2h9ID1cbiAgICAgICAgYXdhaXQgcHJvbXB0PHthY3RpdmVMdHNCcmFuY2g6IEx0c0JyYW5jaCB8IG51bGwsIGluYWN0aXZlTHRzQnJhbmNoOiBMdHNCcmFuY2h9PihbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2FjdGl2ZUx0c0JyYW5jaCcsXG4gICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICAgICAgY2hvaWNlczogYWN0aXZlQnJhbmNoQ2hvaWNlcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdpbmFjdGl2ZUx0c0JyYW5jaCcsXG4gICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICB3aGVuOiBvID0+IG8uYWN0aXZlTHRzQnJhbmNoID09PSBudWxsLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gaW5hY3RpdmUgTFRTIHZlcnNpb24gZm9yIHdoaWNoIHlvdSB3YW50IHRvIGN1dCBhbiBMVFMgcGF0Y2gnLFxuICAgICAgICAgICAgY2hvaWNlczogaW5hY3RpdmUubWFwKGJyYW5jaCA9PiB0aGlzLl9nZXRDaG9pY2VGb3JMdHNCcmFuY2goYnJhbmNoKSksXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICByZXR1cm4gYWN0aXZlTHRzQnJhbmNoID8/IGluYWN0aXZlTHRzQnJhbmNoO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gaW5xdWlyZXIgY2hvaWNlIGZvciB0aGUgZ2l2ZW4gTFRTIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2hvaWNlRm9yTHRzQnJhbmNoKGJyYW5jaDogTHRzQnJhbmNoKTogTGlzdENob2ljZU9wdGlvbnMge1xuICAgIHJldHVybiB7bmFtZTogYHYke2JyYW5jaC52ZXJzaW9uLm1ham9yfSAoZnJvbSAke2JyYW5jaC5uYW1lfSlgLCB2YWx1ZTogYnJhbmNofTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBMVFMgcGF0Y2ggdmVyc2lvbnMgY2FuIGJlIG9ubHkgY3V0IGlmIHRoZXJlIGFyZSByZWxlYXNlIHRyYWlucyBpbiBMVFMgcGhhc2UuXG4gICAgLy8gVGhpcyBhY3Rpb24gaXMgYWx3YXlzIHNlbGVjdGFibGUgYXMgd2Ugc3VwcG9ydCBwdWJsaXNoaW5nIG9mIG9sZCBMVFMgYnJhbmNoZXMsXG4gICAgLy8gYW5kIGhhdmUgcHJvbXB0IGZvciBzZWxlY3RpbmcgYW4gTFRTIGJyYW5jaCB3aGVuIHRoZSBhY3Rpb24gcGVyZm9ybXMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==