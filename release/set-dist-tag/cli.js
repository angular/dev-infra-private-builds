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
    var ora = require("ora");
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
                            console_1.error(console_1.red("Invalid version specified (" + rawVersion + "). Unable to set NPM dist tag."));
                            process.exit(1);
                        }
                        spinner = ora.call(undefined).start();
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
    /** CLI command module for setting an NPM dist tag. */
    exports.ReleaseSetDistTagCommand = {
        builder: builder,
        handler: handler,
        command: 'set-dist-tag <tag-name> <target-version>',
        describe: 'Sets a given NPM dist tag for all release packages.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJCO0lBQzNCLCtCQUFpQztJQUdqQyxvRUFBeUU7SUFDekUsbUVBQWlEO0lBQ2pELHlGQUE4RDtJQVM5RCxTQUFTLE9BQU8sQ0FBQyxJQUFVO1FBQ3pCLE9BQU8sSUFBSTthQUNOLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDckIsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixXQUFXLEVBQUUsMkJBQTJCO1NBQ3pDLENBQUM7YUFDRCxVQUFVLENBQUMsZUFBZSxFQUFFO1lBQzNCLElBQUksRUFBRSxRQUFRO1lBQ2QsWUFBWSxFQUFFLElBQUk7WUFDbEIsV0FBVyxFQUFFLDhDQUE4QztTQUM1RCxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELFNBQWUsT0FBTyxDQUFDLElBQXlDOzs7Ozs7O3dCQUN4QyxVQUFVLEdBQWEsSUFBSSxjQUFqQixFQUFFLE9BQU8sR0FBSSxJQUFJLFFBQVIsQ0FBUzt3QkFDNUMsS0FBaUMsd0JBQWdCLEVBQUUsRUFBbEQsV0FBVyxpQkFBQSxFQUFFLGVBQWUscUJBQUEsQ0FBdUI7d0JBQ3BELE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUV6QyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7NEJBQ3BCLGVBQUssQ0FBQyxhQUFHLENBQUMsZ0NBQThCLFVBQVUsbUNBQWdDLENBQUMsQ0FBQyxDQUFDOzRCQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFSyxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDNUMsZUFBSyxDQUFDLGVBQVksT0FBTyxpREFBMkMsT0FBTyxNQUFHLENBQUMsQ0FBQzs7Ozt3QkFFMUQsZ0JBQUEsaUJBQUEsV0FBVyxDQUFBOzs7O3dCQUF0QixPQUFPO3dCQUNoQixPQUFPLENBQUMsSUFBSSxHQUFHLGdDQUE2QixPQUFPLE9BQUcsQ0FBQzt3QkFDdkQsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDOzs7O3dCQUdmLHFCQUFNLGlDQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBUSxFQUFFLGVBQWUsQ0FBQyxFQUFBOzt3QkFBdEUsU0FBc0UsQ0FBQzt3QkFDdkUsZUFBSyxDQUFDLHdCQUFxQixPQUFPLDhCQUF1QixPQUFPLFFBQUksQ0FBQyxDQUFDOzs7O3dCQUV0RSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsdUVBQStELE9BQU8sUUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDdkYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBSXBCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDZixjQUFJLENBQUMsZUFBSyxDQUFDLHVEQUFrRCxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsY0FBSSxDQUFDLGVBQUssQ0FBQyxXQUFTLGNBQUksQ0FBQyxPQUFPLENBQUMsMkJBQXNCLGNBQUksQ0FBQyxNQUFJLE9BQVMsQ0FBQyxNQUFHLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqRjtJQUVELHNEQUFzRDtJQUN6QyxRQUFBLHdCQUF3QixHQUFnRDtRQUNuRixPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsMENBQTBDO1FBQ25ELFFBQVEsRUFBRSxxREFBcUQ7S0FDaEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtzZXROcG1UYWdGb3JQYWNrYWdlfSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIHNldHRpbmcgYW4gTlBNIGRpc3QgdGFnLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnMge1xuICB0YWdOYW1lOiBzdHJpbmc7XG4gIHRhcmdldFZlcnNpb246IHN0cmluZztcbn1cblxuZnVuY3Rpb24gYnVpbGRlcihhcmdzOiBBcmd2KTogQXJndjxSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3NcbiAgICAgIC5wb3NpdGlvbmFsKCd0YWdOYW1lJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgdGhlIE5QTSBkaXN0IHRhZy4nLFxuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCd0YXJnZXRWZXJzaW9uJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1ZlcnNpb24gdG8gd2hpY2ggdGhlIGRpc3QgdGFnIHNob3VsZCBiZSBzZXQuJ1xuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWV9ID0gYXJncztcbiAgY29uc3Qge25wbVBhY2thZ2VzLCBwdWJsaXNoUmVnaXN0cnl9ID0gZ2V0UmVsZWFzZUNvbmZpZygpO1xuICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKHJhd1ZlcnNpb24pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGBJbnZhbGlkIHZlcnNpb24gc3BlY2lmaWVkICgke3Jhd1ZlcnNpb259KS4gVW5hYmxlIHRvIHNldCBOUE0gZGlzdCB0YWcuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KCk7XG4gIGRlYnVnKGBTZXR0aW5nIFwiJHt0YWdOYW1lfVwiIE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKTtcblxuICBmb3IgKGNvbnN0IHBrZ05hbWUgb2YgbnBtUGFja2FnZXMpIHtcbiAgICBzcGlubmVyLnRleHQgPSBgU2V0dGluZyBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiYDtcbiAgICBzcGlubmVyLnJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldE5wbVRhZ0ZvclBhY2thZ2UocGtnTmFtZSwgdGFnTmFtZSwgdmVyc2lvbiEsIHB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBkZWJ1ZyhgU3VjY2Vzc2Z1bGx5IHNldCBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiLmApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9XG5cbiAgc3Bpbm5lci5zdG9wKCk7XG4gIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuYCkpO1xuICBpbmZvKGdyZWVuKGAgICAgICAke2JvbGQodGFnTmFtZSl9IHdpbGwgbm93IHBvaW50IHRvICR7Ym9sZChgdiR7dmVyc2lvbn1gKX0uYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQ6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdzZXQtZGlzdC10YWcgPHRhZy1uYW1lPiA8dGFyZ2V0LXZlcnNpb24+JyxcbiAgZGVzY3JpYmU6ICdTZXRzIGEgZ2l2ZW4gTlBNIGRpc3QgdGFnIGZvciBhbGwgcmVsZWFzZSBwYWNrYWdlcy4nLFxufTtcbiJdfQ==