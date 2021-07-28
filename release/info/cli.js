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
        define("@angular/dev-infra-private/release/info/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/print-active-trains"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseInfoCommandModule = void 0;
    var tslib_1 = require("tslib");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var active_release_trains_1 = require("@angular/dev-infra-private/release/versioning/active-release-trains");
    var print_active_trains_1 = require("@angular/dev-infra-private/release/versioning/print-active-trains");
    /** Yargs command handler for printing release information. */
    function handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git, gitRepoWithApi, releaseTrains;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        git = git_client_1.GitClient.get();
                        gitRepoWithApi = tslib_1.__assign({ api: git.github }, git.remoteConfig);
                        return [4 /*yield*/, active_release_trains_1.fetchActiveReleaseTrains(gitRepoWithApi)];
                    case 1:
                        releaseTrains = _a.sent();
                        // Print the active release trains.
                        return [4 /*yield*/, print_active_trains_1.printActiveReleaseTrains(releaseTrains, index_1.getReleaseConfig())];
                    case 2:
                        // Print the active release trains.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for retrieving release information. */
    exports.ReleaseInfoCommandModule = {
        handler: handler,
        command: 'info',
        describe: 'Prints active release trains to the console.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvaW5mby9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUtILDhFQUFxRDtJQUNyRCxtRUFBaUQ7SUFDakQsNkdBQTZFO0lBQzdFLHlHQUEyRTtJQUUzRSw4REFBOEQ7SUFDOUQsU0FBZSxPQUFPOzs7Ozs7d0JBQ2QsR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ3RCLGNBQWMsc0JBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLElBQUssR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUN4QyxxQkFBTSxnREFBd0IsQ0FBQyxjQUFjLENBQUMsRUFBQTs7d0JBQTlELGFBQWEsR0FBRyxTQUE4Qzt3QkFFcEUsbUNBQW1DO3dCQUNuQyxxQkFBTSw4Q0FBd0IsQ0FBQyxhQUFhLEVBQUUsd0JBQWdCLEVBQUUsQ0FBQyxFQUFBOzt3QkFEakUsbUNBQW1DO3dCQUNuQyxTQUFpRSxDQUFDOzs7OztLQUNuRTtJQUVELDZEQUE2RDtJQUNoRCxRQUFBLHdCQUF3QixHQUFrQjtRQUNyRCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsTUFBTTtRQUNmLFFBQVEsRUFBRSw4Q0FBOEM7S0FDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge2ZldGNoQWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHByaW50aW5nIHJlbGVhc2UgaW5mb3JtYXRpb24uICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIGNvbnN0IGdpdFJlcG9XaXRoQXBpID0ge2FwaTogZ2l0LmdpdGh1YiwgLi4uZ2l0LnJlbW90ZUNvbmZpZ307XG4gIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMoZ2l0UmVwb1dpdGhBcGkpO1xuXG4gIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMuXG4gIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCBnZXRSZWxlYXNlQ29uZmlnKCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciByZXRyaWV2aW5nIHJlbGVhc2UgaW5mb3JtYXRpb24uICovXG5leHBvcnQgY29uc3QgUmVsZWFzZUluZm9Db21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlID0ge1xuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnaW5mbycsXG4gIGRlc2NyaWJlOiAnUHJpbnRzIGFjdGl2ZSByZWxlYXNlIHRyYWlucyB0byB0aGUgY29uc29sZS4nLFxufTtcbiJdfQ==