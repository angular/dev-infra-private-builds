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
        define("@angular/dev-infra-private/release/set-dist-tag/cli", ["require", "exports", "tslib", "ora", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/versioning/npm-publish"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseSetDistTagCommand = void 0;
    var tslib_1 = require("tslib");
    var Ora = require("ora");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var npm_publish_1 = require("@angular/dev-infra-private/release/versioning/npm-publish");
    function builder(args) {
        return args
            .positional('tagName', {
            type: 'string',
            demandOption: true,
            description: 'Name of the NPM dist tag.',
        })
            .positional('targetVersion', {
            type: 'string',
            demandOption: true,
            description: 'Version to which the dist tag should be set.'
        });
    }
    /** Yargs command handler for building a release. */
    function handler(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rawVersion, tagName, _a, npmPackages, publishRegistry, version, spinner, npmPackages_1, npmPackages_1_1, pkgName, e_1, e_2_1;
            var e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        rawVersion = args.targetVersion, tagName = args.tagName;
                        _a = index_1.getReleaseConfig(), npmPackages = _a.npmPackages, publishRegistry = _a.publishRegistry;
                        version = semver.parse(rawVersion);
                        if (version === null) {
                            console_1.error(console_1.red("Invalid version specified. Unable to set NPM dist tag."));
                            process.exit(1);
                        }
                        spinner = Ora().start();
                        console_1.debug("Setting \"" + tagName + "\" NPM dist tag for release packages to v" + version + ".");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, 9, 10]);
                        npmPackages_1 = tslib_1.__values(npmPackages), npmPackages_1_1 = npmPackages_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!npmPackages_1_1.done) return [3 /*break*/, 7];
                        pkgName = npmPackages_1_1.value;
                        spinner.text = "Setting NPM dist tag for \"" + pkgName + "\"";
                        spinner.render();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, npm_publish_1.setNpmTagForPackage(pkgName, tagName, version, publishRegistry)];
                    case 4:
                        _c.sent();
                        console_1.debug("Successfully set \"" + tagName + "\" NPM dist tag for \"" + pkgName + "\".");
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _c.sent();
                        spinner.stop();
                        console_1.error(e_1);
                        console_1.error(console_1.red("  \u2718   An error occurred while setting the NPM dist tag for \"" + pkgName + "\"."));
                        process.exit(1);
                        return [3 /*break*/, 6];
                    case 6:
                        npmPackages_1_1 = npmPackages_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (npmPackages_1_1 && !npmPackages_1_1.done && (_b = npmPackages_1.return)) _b.call(npmPackages_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        spinner.stop();
                        console_1.info(console_1.green("  \u2713   Set NPM dist tag for all release packages."));
                        console_1.info(console_1.green("      " + console_1.bold(tagName) + " will now point to " + console_1.bold("v" + version) + "."));
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for setting a NPM dist tag. */
    exports.ReleaseSetDistTagCommand = {
        builder: builder,
        handler: handler,
        command: 'set-dist-tag <tag-name> <target-version>',
        describe: 'Sets a given NPM dist tag for all release packages.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJCO0lBQzNCLCtCQUFpQztJQUdqQyxvRUFBeUU7SUFDekUsbUVBQWlEO0lBQ2pELHlGQUE4RDtJQVM5RCxTQUFTLE9BQU8sQ0FBQyxJQUFVO1FBQ3pCLE9BQU8sSUFBSTthQUNOLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDckIsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixXQUFXLEVBQUUsMkJBQTJCO1NBQ3pDLENBQUM7YUFDRCxVQUFVLENBQUMsZUFBZSxFQUFFO1lBQzNCLElBQUksRUFBRSxRQUFRO1lBQ2QsWUFBWSxFQUFFLElBQUk7WUFDbEIsV0FBVyxFQUFFLDhDQUE4QztTQUM1RCxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELFNBQWUsT0FBTyxDQUFDLElBQXlDOzs7Ozs7O3dCQUN4QyxVQUFVLEdBQWEsSUFBSSxjQUFqQixFQUFFLE9BQU8sR0FBSSxJQUFJLFFBQVIsQ0FBUzt3QkFDNUMsS0FBaUMsd0JBQWdCLEVBQUUsRUFBbEQsV0FBVyxpQkFBQSxFQUFFLGVBQWUscUJBQUEsQ0FBdUI7d0JBQ3BELE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUV6QyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7NEJBQ3BCLGVBQUssQ0FBQyxhQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDOzRCQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFSyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQzlCLGVBQUssQ0FBQyxlQUFZLE9BQU8saURBQTJDLE9BQU8sTUFBRyxDQUFDLENBQUM7Ozs7d0JBRTFELGdCQUFBLGlCQUFBLFdBQVcsQ0FBQTs7Ozt3QkFBdEIsT0FBTzt3QkFDaEIsT0FBTyxDQUFDLElBQUksR0FBRyxnQ0FBNkIsT0FBTyxPQUFHLENBQUM7d0JBQ3ZELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Ozt3QkFHZixxQkFBTSxpQ0FBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQVEsRUFBRSxlQUFlLENBQUMsRUFBQTs7d0JBQXRFLFNBQXNFLENBQUM7d0JBQ3ZFLGVBQUssQ0FBQyx3QkFBcUIsT0FBTyw4QkFBdUIsT0FBTyxRQUFJLENBQUMsQ0FBQzs7Ozt3QkFFdEUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNmLGVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQzt3QkFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLHVFQUErRCxPQUFPLFFBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3ZGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUlwQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsY0FBSSxDQUFDLGVBQUssQ0FBQyx1REFBa0QsQ0FBQyxDQUFDLENBQUM7d0JBQ2hFLGNBQUksQ0FBQyxlQUFLLENBQUMsV0FBUyxjQUFJLENBQUMsT0FBTyxDQUFDLDJCQUFzQixjQUFJLENBQUMsTUFBSSxPQUFTLENBQUMsTUFBRyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakY7SUFFRCxxREFBcUQ7SUFDeEMsUUFBQSx3QkFBd0IsR0FBZ0Q7UUFDbkYsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLDBDQUEwQztRQUNuRCxRQUFRLEVBQUUscURBQXFEO0tBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgT3JhIGZyb20gJ29yYSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7c2V0TnBtVGFnRm9yUGFja2FnZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGEgTlBNIGRpc3QgdGFnLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnMge1xuICB0YWdOYW1lOiBzdHJpbmc7XG4gIHRhcmdldFZlcnNpb246IHN0cmluZztcbn1cblxuZnVuY3Rpb24gYnVpbGRlcihhcmdzOiBBcmd2KTogQXJndjxSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3NcbiAgICAgIC5wb3NpdGlvbmFsKCd0YWdOYW1lJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgdGhlIE5QTSBkaXN0IHRhZy4nLFxuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCd0YXJnZXRWZXJzaW9uJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1ZlcnNpb24gdG8gd2hpY2ggdGhlIGRpc3QgdGFnIHNob3VsZCBiZSBzZXQuJ1xuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWV9ID0gYXJncztcbiAgY29uc3Qge25wbVBhY2thZ2VzLCBwdWJsaXNoUmVnaXN0cnl9ID0gZ2V0UmVsZWFzZUNvbmZpZygpO1xuICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKHJhd1ZlcnNpb24pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGBJbnZhbGlkIHZlcnNpb24gc3BlY2lmaWVkLiBVbmFibGUgdG8gc2V0IE5QTSBkaXN0IHRhZy5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3Qgc3Bpbm5lciA9IE9yYSgpLnN0YXJ0KCk7XG4gIGRlYnVnKGBTZXR0aW5nIFwiJHt0YWdOYW1lfVwiIE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKTtcblxuICBmb3IgKGNvbnN0IHBrZ05hbWUgb2YgbnBtUGFja2FnZXMpIHtcbiAgICBzcGlubmVyLnRleHQgPSBgU2V0dGluZyBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiYDtcbiAgICBzcGlubmVyLnJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldE5wbVRhZ0ZvclBhY2thZ2UocGtnTmFtZSwgdGFnTmFtZSwgdmVyc2lvbiEsIHB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBkZWJ1ZyhgU3VjY2Vzc2Z1bGx5IHNldCBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiLmApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9XG5cbiAgc3Bpbm5lci5zdG9wKCk7XG4gIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuYCkpO1xuICBpbmZvKGdyZWVuKGAgICAgICAke2JvbGQodGFnTmFtZSl9IHdpbGwgbm93IHBvaW50IHRvICR7Ym9sZChgdiR7dmVyc2lvbn1gKX0uYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBzZXR0aW5nIGEgTlBNIGRpc3QgdGFnLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VTZXREaXN0VGFnQ29tbWFuZDogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3NldC1kaXN0LXRhZyA8dGFnLW5hbWU+IDx0YXJnZXQtdmVyc2lvbj4nLFxuICBkZXNjcmliZTogJ1NldHMgYSBnaXZlbiBOUE0gZGlzdCB0YWcgZm9yIGFsbCByZWxlYXNlIHBhY2thZ2VzLicsXG59O1xuIl19