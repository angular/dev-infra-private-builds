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
        define("@angular/dev-infra-private/misc/build-and-link/cli", ["require", "exports", "tslib", "chalk", "fs", "path", "@angular/dev-infra-private/release/build", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/shelljs"], factory);
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
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
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
            var releaseOutputs, releaseOutputs_1, releaseOutputs_1_1, _b, outputPath, name_1;
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
                        try {
                            for (releaseOutputs_1 = tslib_1.__values(releaseOutputs), releaseOutputs_1_1 = releaseOutputs_1.next(); !releaseOutputs_1_1.done; releaseOutputs_1_1 = releaseOutputs_1.next()) {
                                _b = releaseOutputs_1_1.value, outputPath = _b.outputPath, name_1 = _b.name;
                                shelljs_1.exec("yarn link --cwd " + outputPath);
                                shelljs_1.exec("yarn link --cwd " + projectRoot + " " + name_1);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (releaseOutputs_1_1 && !releaseOutputs_1_1.done && (_c = releaseOutputs_1.return)) _c.call(releaseOutputs_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBNEI7SUFDNUIseUJBQTBDO0lBQzFDLDZCQUErQztJQUcvQyxrRUFBNkQ7SUFDN0Qsb0VBQXFEO0lBQ3JELG9FQUF5QztJQVF6Qyw2Q0FBNkM7SUFDN0MsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFO1lBQ3BDLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsVUFBQyxJQUFZLElBQUssT0FBQSxjQUFPLENBQUMsSUFBSSxDQUFDLEVBQWIsQ0FBYTtZQUN2QyxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWUsT0FBTyxDQUFDLEVBQTZDO1lBQTVDLFdBQVcsaUJBQUE7Ozs7Ozs7d0JBQ2pDLElBQUk7NEJBQ0YsSUFBSSxDQUFDLGNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQ0FDekMsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1REFBZ0QsV0FBYSxDQUFDLENBQUMsQ0FBQztnQ0FDMUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDakI7eUJBQ0Y7d0JBQUMsV0FBTTs0QkFDTixlQUFLLENBQUMsYUFBRyxDQUFDLDJEQUFvRCxXQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUM5RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFc0IscUJBQU0sMEJBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUFoRCxjQUFjLEdBQUcsU0FBK0I7d0JBRXRELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTs0QkFDM0IsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1RUFBa0UsQ0FBQyxDQUFDLENBQUM7NEJBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyxhQUFLLENBQUMsZ0NBQTJCLENBQUMsQ0FBQyxDQUFDOzs0QkFFekMsS0FBaUMsbUJBQUEsaUJBQUEsY0FBYyxDQUFBLHdIQUFFO2dDQUF0Qyw2QkFBa0IsRUFBakIsVUFBVSxnQkFBQSxFQUFFLGdCQUFJO2dDQUMxQixjQUFJLENBQUMscUJBQW1CLFVBQVksQ0FBQyxDQUFDO2dDQUN0QyxjQUFJLENBQUMscUJBQW1CLFdBQVcsU0FBSSxNQUFNLENBQUMsQ0FBQzs2QkFDaEQ7Ozs7Ozs7Ozt3QkFFRCxjQUFJLENBQUMsYUFBSyxDQUFDLHVEQUFrRCxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakU7SUFFRCwwQkFBMEI7SUFDYixRQUFBLHlCQUF5QixHQUEyQztRQUMvRSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsOEJBQThCO1FBQ3ZDLFFBQVEsRUFDSix3R0FBd0c7S0FDN0csQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dyZWVufSBmcm9tICdjaGFsayc7XG5pbXBvcnQge2xzdGF0U3luYywgc3RhdCwgU3RhdHN9IGZyb20gJ2ZzJztcbmltcG9ydCB7aXNBYnNvbHV0ZSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi4vLi4vcmVsZWFzZS9idWlsZC9pbmRleCc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuLi8uLi91dGlscy9zaGVsbGpzJztcblxuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkQW5kTGlua09wdGlvbnMge1xuICBwcm9qZWN0Um9vdDogc3RyaW5nO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8QnVpbGRBbmRMaW5rT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndi5wb3NpdGlvbmFsKCdwcm9qZWN0Um9vdCcsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBub3JtYWxpemU6IHRydWUsXG4gICAgY29lcmNlOiAocGF0aDogc3RyaW5nKSA9PiByZXNvbHZlKHBhdGgpLFxuICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHJvamVjdFJvb3R9OiBBcmd1bWVudHM8QnVpbGRBbmRMaW5rT3B0aW9ucz4pIHtcbiAgdHJ5IHtcbiAgICBpZiAoIWxzdGF0U3luYyhwcm9qZWN0Um9vdCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFRoZSAncHJvamVjdFJvb3QnIG11c3QgYmUgYSBkaXJlY3Rvcnk6ICR7cHJvamVjdFJvb3R9YCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBmaW5kIHRoZSAncHJvamVjdFJvb3QnIHByb3ZpZGVkOiAke3Byb2plY3RSb290fWApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCByZWxlYXNlT3V0cHV0cyA9IGF3YWl0IGJ1aWxkUmVsZWFzZU91dHB1dChmYWxzZSk7XG5cbiAgaWYgKHJlbGVhc2VPdXRwdXRzID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBidWlsZCByZWxlYXNlIG91dHB1dC4gUGxlYXNlIGNoZWNrIG91dHB1dCBhYm92ZS5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oZ3JlZW4oYCDinJMgIEJ1aWx0IHJlbGVhc2Ugb3V0cHV0LmApKTtcblxuICBmb3IgKGNvbnN0IHtvdXRwdXRQYXRoLCBuYW1lfSBvZiByZWxlYXNlT3V0cHV0cykge1xuICAgIGV4ZWMoYHlhcm4gbGluayAtLWN3ZCAke291dHB1dFBhdGh9YCk7XG4gICAgZXhlYyhgeWFybiBsaW5rIC0tY3dkICR7cHJvamVjdFJvb3R9ICR7bmFtZX1gKTtcbiAgfVxuXG4gIGluZm8oZ3JlZW4oYCDinJMgIExpbmtlZCByZWxlYXNlIHBhY2thZ2VzIGluIHByb3ZpZGVkIHByb2plY3QuYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlLiAqL1xuZXhwb3J0IGNvbnN0IEJ1aWxkQW5kTGlua0NvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIEJ1aWxkQW5kTGlua09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQtYW5kLWxpbmsgPHByb2plY3RSb290PicsXG4gIGRlc2NyaWJlOlxuICAgICAgJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQsIHJlZ2lzdGVycyB0aGUgb3V0cHV0cyBhcyBsaW5rZWQsIGFuZCBsaW5rcyB2aWEgeWFybiB0byB0aGUgcHJvdmlkZWQgcHJvamVjdCcsXG59O1xuIl19