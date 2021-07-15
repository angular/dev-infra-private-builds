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
        define("@angular/dev-infra-private/caretaker/handoff/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/caretaker/handoff/update-github-team"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HandoffModule = void 0;
    var tslib_1 = require("tslib");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var update_github_team_1 = require("@angular/dev-infra-private/caretaker/handoff/update-github-team");
    /** Builds the command. */
    function builder(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs);
    }
    /** Handles the command. */
    function handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, update_github_team_1.updateCaretakerTeamViaPrompt()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module for assisting in handing off caretaker.  */
    exports.HandoffModule = {
        handler: handler,
        builder: builder,
        command: 'handoff',
        describe: 'Run a handoff assistant to aide in moving to the next caretaker',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9oYW5kb2ZmL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsa0ZBQWtFO0lBRWxFLHNHQUFrRTtJQU9sRSwwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPOzs7OzRCQUNwQixxQkFBTSxpREFBNEIsRUFBRSxFQUFBOzt3QkFBcEMsU0FBb0MsQ0FBQzs7Ozs7S0FDdEM7SUFFRCxvRUFBb0U7SUFDdkQsUUFBQSxhQUFhLEdBQStDO1FBQ3ZFLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFFBQVEsRUFBRSxpRUFBaUU7S0FDNUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5cbmltcG9ydCB7dXBkYXRlQ2FyZXRha2VyVGVhbVZpYVByb21wdH0gZnJvbSAnLi91cGRhdGUtZ2l0aHViLXRlYW0nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FyZXRha2VySGFuZG9mZk9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3MpO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gIGF3YWl0IHVwZGF0ZUNhcmV0YWtlclRlYW1WaWFQcm9tcHQoKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGZvciBhc3Npc3RpbmcgaW4gaGFuZGluZyBvZmYgY2FyZXRha2VyLiAgKi9cbmV4cG9ydCBjb25zdCBIYW5kb2ZmTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBDYXJldGFrZXJIYW5kb2ZmT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdoYW5kb2ZmJyxcbiAgZGVzY3JpYmU6ICdSdW4gYSBoYW5kb2ZmIGFzc2lzdGFudCB0byBhaWRlIGluIG1vdmluZyB0byB0aGUgbmV4dCBjYXJldGFrZXInLFxufTtcbiJdfQ==