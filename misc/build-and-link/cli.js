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
        define("@angular/dev-infra-private/misc/build-and-link/cli", ["require", "exports", "tslib", "chalk", "fs", "path", "@angular/dev-infra-private/release/build", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildAndLinkCommandModule = void 0;
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var index_1 = require("@angular/dev-infra-private/release/build");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Yargs command builder for the command. */
    function builder(argv) {
        return argv.positional('projectRoot', {
            type: 'string',
            normalize: true,
            coerce: function (path) { return path_1.resolve(path); },
            demandOption: true,
        });
    }
    /** Yargs command handler for the command. */
    function handler(_a) {
        var projectRoot = _a.projectRoot;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var releaseOutputs, releaseOutputs_1, releaseOutputs_1_1, _b, outputPath, name_1, e_1_1;
            var e_1, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        try {
                            if (!fs_1.lstatSync(projectRoot).isDirectory()) {
                                console_1.error(console_1.red("  \u2718   The 'projectRoot' must be a directory: " + projectRoot));
                                process.exit(1);
                            }
                        }
                        catch (_e) {
                            console_1.error(console_1.red("  \u2718   Could not find the 'projectRoot' provided: " + projectRoot));
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.buildReleaseOutput(false)];
                    case 1:
                        releaseOutputs = _d.sent();
                        if (releaseOutputs === null) {
                            console_1.error(console_1.red("  \u2718   Could not build release output. Please check output above."));
                            process.exit(1);
                        }
                        console_1.info(chalk_1.green(" \u2713  Built release output."));
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 8, 9, 10]);
                        releaseOutputs_1 = tslib_1.__values(releaseOutputs), releaseOutputs_1_1 = releaseOutputs_1.next();
                        _d.label = 3;
                    case 3:
                        if (!!releaseOutputs_1_1.done) return [3 /*break*/, 7];
                        _b = releaseOutputs_1_1.value, outputPath = _b.outputPath, name_1 = _b.name;
                        return [4 /*yield*/, child_process_1.spawn('yarn', ['link', '--cwd', outputPath])];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, child_process_1.spawn('yarn', ['link', '--cwd', projectRoot, name_1])];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        releaseOutputs_1_1 = releaseOutputs_1.next();
                        return [3 /*break*/, 3];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (releaseOutputs_1_1 && !releaseOutputs_1_1.done && (_c = releaseOutputs_1.return)) _c.call(releaseOutputs_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        console_1.info(chalk_1.green(" \u2713  Linked release packages in provided project."));
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module. */
    exports.BuildAndLinkCommandModule = {
        builder: builder,
        handler: handler,
        command: 'build-and-link <projectRoot>',
        describe: 'Builds the release output, registers the outputs as linked, and links via yarn to the provided project',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBNEI7SUFDNUIseUJBQTZCO0lBQzdCLDZCQUE2QjtJQUc3QixrRUFBNkQ7SUFDN0QsZ0ZBQWdEO0lBQ2hELG9FQUFxRDtJQVFyRCw2Q0FBNkM7SUFDN0MsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFO1lBQ3BDLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsVUFBQyxJQUFZLElBQUssT0FBQSxjQUFPLENBQUMsSUFBSSxDQUFDLEVBQWIsQ0FBYTtZQUN2QyxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWUsT0FBTyxDQUFDLEVBQTZDO1lBQTVDLFdBQVcsaUJBQUE7Ozs7Ozs7d0JBQ2pDLElBQUk7NEJBQ0YsSUFBSSxDQUFDLGNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQ0FDekMsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1REFBZ0QsV0FBYSxDQUFDLENBQUMsQ0FBQztnQ0FDMUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDakI7eUJBQ0Y7d0JBQUMsV0FBTTs0QkFDTixlQUFLLENBQUMsYUFBRyxDQUFDLDJEQUFvRCxXQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUM5RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFc0IscUJBQU0sMEJBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUFoRCxjQUFjLEdBQUcsU0FBK0I7d0JBRXRELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTs0QkFDM0IsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1RUFBa0UsQ0FBQyxDQUFDLENBQUM7NEJBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyxhQUFLLENBQUMsZ0NBQTJCLENBQUMsQ0FBQyxDQUFDOzs7O3dCQUVSLG1CQUFBLGlCQUFBLGNBQWMsQ0FBQTs7Ozt3QkFBcEMsNkJBQWtCLEVBQWpCLFVBQVUsZ0JBQUEsRUFBRSxnQkFBSTt3QkFDMUIscUJBQU0scUJBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUE7O3dCQUFsRCxTQUFrRCxDQUFDO3dCQUNuRCxxQkFBTSxxQkFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQUksQ0FBQyxDQUFDLEVBQUE7O3dCQUF6RCxTQUF5RCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFHNUQsY0FBSSxDQUFDLGFBQUssQ0FBQyx1REFBa0QsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pFO0lBRUQsMEJBQTBCO0lBQ2IsUUFBQSx5QkFBeUIsR0FBMkM7UUFDL0UsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLDhCQUE4QjtRQUN2QyxRQUFRLEVBQ0osd0dBQXdHO0tBQzdHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmVlbn0gZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtsc3RhdFN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi4vLi4vcmVsZWFzZS9idWlsZC9pbmRleCc7XG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdWlsZEFuZExpbmtPcHRpb25zIHtcbiAgcHJvamVjdFJvb3Q6IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PEJ1aWxkQW5kTGlua09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3YucG9zaXRpb25hbCgncHJvamVjdFJvb3QnLCB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgbm9ybWFsaXplOiB0cnVlLFxuICAgIGNvZXJjZTogKHBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShwYXRoKSxcbiAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3Byb2plY3RSb290fTogQXJndW1lbnRzPEJ1aWxkQW5kTGlua09wdGlvbnM+KSB7XG4gIHRyeSB7XG4gICAgaWYgKCFsc3RhdFN5bmMocHJvamVjdFJvb3QpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBUaGUgJ3Byb2plY3RSb290JyBtdXN0IGJlIGEgZGlyZWN0b3J5OiAke3Byb2plY3RSb290fWApKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgZmluZCB0aGUgJ3Byb2plY3RSb290JyBwcm92aWRlZDogJHtwcm9qZWN0Um9vdH1gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcmVsZWFzZU91dHB1dHMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQoZmFsc2UpO1xuXG4gIGlmIChyZWxlYXNlT3V0cHV0cyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBpbmZvKGdyZWVuKGAg4pyTICBCdWlsdCByZWxlYXNlIG91dHB1dC5gKSk7XG5cbiAgZm9yIChjb25zdCB7b3V0cHV0UGF0aCwgbmFtZX0gb2YgcmVsZWFzZU91dHB1dHMpIHtcbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnbGluaycsICctLWN3ZCcsIG91dHB1dFBhdGhdKTtcbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnbGluaycsICctLWN3ZCcsIHByb2plY3RSb290LCBuYW1lXSk7XG4gIH1cblxuICBpbmZvKGdyZWVuKGAg4pyTICBMaW5rZWQgcmVsZWFzZSBwYWNrYWdlcyBpbiBwcm92aWRlZCBwcm9qZWN0LmApKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBCdWlsZEFuZExpbmtDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBCdWlsZEFuZExpbmtPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2J1aWxkLWFuZC1saW5rIDxwcm9qZWN0Um9vdD4nLFxuICBkZXNjcmliZTpcbiAgICAgICdCdWlsZHMgdGhlIHJlbGVhc2Ugb3V0cHV0LCByZWdpc3RlcnMgdGhlIG91dHB1dHMgYXMgbGlua2VkLCBhbmQgbGlua3MgdmlhIHlhcm4gdG8gdGhlIHByb3ZpZGVkIHByb2plY3QnLFxufTtcbiJdfQ==