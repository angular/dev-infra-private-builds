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
        define("@angular/dev-infra-private/caretaker/check/g3", ["require", "exports", "tslib", "fs", "multimatch", "path", "yaml", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/caretaker/check/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.G3Module = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var multimatch = require("multimatch");
    var path_1 = require("path");
    var yaml_1 = require("yaml");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_1 = require("@angular/dev-infra-private/caretaker/check/base");
    var G3Module = /** @class */ (function (_super) {
        tslib_1.__extends(G3Module, _super);
        function G3Module() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        G3Module.prototype.retrieveData = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var toCopyToG3, latestSha;
                return tslib_1.__generator(this, function (_a) {
                    toCopyToG3 = this.getG3FileIncludeAndExcludeLists();
                    latestSha = this.getLatestShas();
                    if (toCopyToG3 === null || latestSha === null) {
                        return [2 /*return*/];
                    }
                    return [2 /*return*/, this.getDiffStats(latestSha.g3, latestSha.master, toCopyToG3.include, toCopyToG3.exclude)];
                });
            });
        };
        G3Module.prototype.printToTerminal = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var stats;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.data];
                        case 1:
                            stats = _a.sent();
                            if (!stats) {
                                return [2 /*return*/];
                            }
                            console_1.info.group(console_1.bold('g3 branch check'));
                            if (stats.files === 0) {
                                console_1.info(stats.commits + " commits between g3 and master");
                                console_1.info('✅  No sync is needed at this time');
                            }
                            else {
                                console_1.info(stats.files + " files changed, " + stats.insertions + " insertions(+), " + stats.deletions + " " +
                                    ("deletions(-) from " + stats.commits + " commits will be included in the next sync"));
                            }
                            console_1.info.groupEnd();
                            console_1.info();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Fetch and retrieve the latest sha for a specific branch. */
        G3Module.prototype.getShaForBranchLatest = function (branch) {
            var _a = this.git.remoteConfig, owner = _a.owner, name = _a.name;
            /** The result fo the fetch command. */
            var fetchResult = this.git.runGraceful(['fetch', '-q', "https://github.com/" + owner + "/" + name + ".git", branch]);
            if (fetchResult.status !== 0 &&
                fetchResult.stderr.includes("couldn't find remote ref " + branch)) {
                console_1.debug("No '" + branch + "' branch exists on upstream, skipping.");
                return null;
            }
            return this.git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
        };
        /**
         * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
         * files.
         */
        G3Module.prototype.getDiffStats = function (g3Ref, masterRef, includeFiles, excludeFiles) {
            var _this = this;
            /** The diff stats to be returned. */
            var stats = {
                insertions: 0,
                deletions: 0,
                files: 0,
                commits: 0,
            };
            // Determine the number of commits between master and g3 refs. */
            stats.commits =
                parseInt(this.git.run(['rev-list', '--count', g3Ref + ".." + masterRef]).stdout, 10);
            // Get the numstat information between master and g3
            this.git.run(['diff', g3Ref + "..." + masterRef, '--numstat'])
                .stdout
                // Remove the extra space after git's output.
                .trim()
                // Split each line of git output into array
                .split('\n')
                // Split each line from the git output into components parts: insertions,
                // deletions and file name respectively
                .map(function (line) { return line.trim().split('\t'); })
                // Parse number value from the insertions and deletions values
                // Example raw line input:
                //   10\t5\tsrc/file/name.ts
                .map(function (line) { return [Number(line[0]), Number(line[1]), line[2]]; })
                // Add each line's value to the diff stats, and conditionally to the g3
                // stats as well if the file name is included in the files synced to g3.
                .forEach(function (_a) {
                var _b = tslib_1.__read(_a, 3), insertions = _b[0], deletions = _b[1], fileName = _b[2];
                if (_this.checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
                    stats.insertions += insertions;
                    stats.deletions += deletions;
                    stats.files += 1;
                }
            });
            return stats;
        };
        /** Determine whether the file name passes both include and exclude checks. */
        G3Module.prototype.checkMatchAgainstIncludeAndExclude = function (file, includes, excludes) {
            return (multimatch.call(undefined, file, includes).length >= 1 &&
                multimatch.call(undefined, file, excludes).length === 0);
        };
        G3Module.prototype.getG3FileIncludeAndExcludeLists = function () {
            var _a, _b, _c, _d;
            var angularRobotFilePath = path_1.join(this.git.baseDir, '.github/angular-robot.yml');
            if (!fs_1.existsSync(angularRobotFilePath)) {
                console_1.debug('No angular robot configuration file exists, skipping.');
                return null;
            }
            /** The configuration defined for the angular robot. */
            var robotConfig = yaml_1.parse(fs_1.readFileSync(angularRobotFilePath).toString());
            /** The files to be included in the g3 sync. */
            var include = ((_b = (_a = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _a === void 0 ? void 0 : _a.g3Status) === null || _b === void 0 ? void 0 : _b.include) || [];
            /** The files to be expected in the g3 sync. */
            var exclude = ((_d = (_c = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _c === void 0 ? void 0 : _c.g3Status) === null || _d === void 0 ? void 0 : _d.exclude) || [];
            if (include.length === 0 && exclude.length === 0) {
                console_1.debug('No g3Status include or exclude lists are defined in the angular robot configuration');
                return null;
            }
            return { include: include, exclude: exclude };
        };
        G3Module.prototype.getLatestShas = function () {
            /** The latest sha for the g3 branch. */
            var g3 = this.getShaForBranchLatest('g3');
            /** The latest sha for the master branch. */
            var master = this.getShaForBranchLatest('master');
            if (g3 === null || master === null) {
                console_1.debug('Either the g3 or master was unable to be retrieved');
                return null;
            }
            return { g3: g3, master: master };
        };
        return G3Module;
    }(base_1.BaseModule));
    exports.G3Module = G3Module;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFDeEMsb0VBQXNEO0lBRXRELHdFQUFrQztJQVVsQztRQUE4QixvQ0FBNEI7UUFBMUQ7O1FBbUlBLENBQUM7UUFsSU8sK0JBQVksR0FBbEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO29CQUNwRCxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUV2QyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTt3QkFDN0Msc0JBQU87cUJBQ1I7b0JBRUQsc0JBQU8sSUFBSSxDQUFDLFlBQVksQ0FDcEIsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFDOzs7U0FDN0U7UUFFSyxrQ0FBZSxHQUFyQjs7Ozs7Z0NBQ2dCLHFCQUFNLElBQUksQ0FBQyxJQUFJLEVBQUE7OzRCQUF2QixLQUFLLEdBQUcsU0FBZTs0QkFDN0IsSUFBSSxDQUFDLEtBQUssRUFBRTtnQ0FDVixzQkFBTzs2QkFDUjs0QkFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7NEJBQ3BDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0NBQ3JCLGNBQUksQ0FBSSxLQUFLLENBQUMsT0FBTyxtQ0FBZ0MsQ0FBQyxDQUFDO2dDQUN2RCxjQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs2QkFDM0M7aUNBQU07Z0NBQ0ws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QUFXLHVCQUFYLFdBQVcsQ0FBRSxLQUFLLDBDQUFFLFFBQVEsMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQztZQUV0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoRCxlQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztnQkFDN0YsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sRUFBQyxPQUFPLFNBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO1FBQzVCLENBQUM7UUFFTyxnQ0FBYSxHQUFyQjtZQUNFLHdDQUF3QztZQUN4QyxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsNENBQTRDO1lBQzVDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVwRCxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDbEMsZUFBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLEVBQUMsRUFBRSxJQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQztRQUN0QixDQUFDO1FBQ0gsZUFBQztJQUFELENBQUMsQUFuSUQsQ0FBOEIsaUJBQVUsR0FtSXZDO0lBbklZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbi8qKiBJbmZvcm1hdGlvbiBleHByZXNzaW5nIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG1hc3RlciBhbmQgZzMgYnJhbmNoZXMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRzNTdGF0c0RhdGEge1xuICBpbnNlcnRpb25zOiBudW1iZXI7XG4gIGRlbGV0aW9uczogbnVtYmVyO1xuICBmaWxlczogbnVtYmVyO1xuICBjb21taXRzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBHM01vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8RzNTdGF0c0RhdGF8dm9pZD4ge1xuICBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgY29uc3QgdG9Db3B5VG9HMyA9IHRoaXMuZ2V0RzNGaWxlSW5jbHVkZUFuZEV4Y2x1ZGVMaXN0cygpO1xuICAgIGNvbnN0IGxhdGVzdFNoYSA9IHRoaXMuZ2V0TGF0ZXN0U2hhcygpO1xuXG4gICAgaWYgKHRvQ29weVRvRzMgPT09IG51bGwgfHwgbGF0ZXN0U2hhID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlmZlN0YXRzKFxuICAgICAgICBsYXRlc3RTaGEuZzMsIGxhdGVzdFNoYS5tYXN0ZXIsIHRvQ29weVRvRzMuaW5jbHVkZSwgdG9Db3B5VG9HMy5leGNsdWRlKTtcbiAgfVxuXG4gIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBzdGF0cyA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBpZiAoIXN0YXRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8uZ3JvdXAoYm9sZCgnZzMgYnJhbmNoIGNoZWNrJykpO1xuICAgIGlmIChzdGF0cy5maWxlcyA9PT0gMCkge1xuICAgICAgaW5mbyhgJHtzdGF0cy5jb21taXRzfSBjb21taXRzIGJldHdlZW4gZzMgYW5kIG1hc3RlcmApO1xuICAgICAgaW5mbygn4pyFICBObyBzeW5jIGlzIG5lZWRlZCBhdCB0aGlzIHRpbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5mbyhcbiAgICAgICAgICBgJHtzdGF0cy5maWxlc30gZmlsZXMgY2hhbmdlZCwgJHtzdGF0cy5pbnNlcnRpb25zfSBpbnNlcnRpb25zKCspLCAke3N0YXRzLmRlbGV0aW9uc30gYCArXG4gICAgICAgICAgYGRlbGV0aW9ucygtKSBmcm9tICR7c3RhdHMuY29tbWl0c30gY29tbWl0cyB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBuZXh0IHN5bmNgKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxuXG4gIC8qKiBGZXRjaCBhbmQgcmV0cmlldmUgdGhlIGxhdGVzdCBzaGEgZm9yIGEgc3BlY2lmaWMgYnJhbmNoLiAqL1xuICBwcml2YXRlIGdldFNoYUZvckJyYW5jaExhdGVzdChicmFuY2g6IHN0cmluZykge1xuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgLyoqIFRoZSByZXN1bHQgZm8gdGhlIGZldGNoIGNvbW1hbmQuICovXG4gICAgY29uc3QgZmV0Y2hSZXN1bHQgPVxuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2ZldGNoJywgJy1xJywgYGh0dHBzOi8vZ2l0aHViLmNvbS8ke293bmVyfS8ke25hbWV9LmdpdGAsIGJyYW5jaF0pO1xuXG4gICAgaWYgKGZldGNoUmVzdWx0LnN0YXR1cyAhPT0gMCAmJlxuICAgICAgICBmZXRjaFJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoYGNvdWxkbid0IGZpbmQgcmVtb3RlIHJlZiAke2JyYW5jaH1gKSkge1xuICAgICAgZGVidWcoYE5vICcke2JyYW5jaH0nIGJyYW5jaCBleGlzdHMgb24gdXBzdHJlYW0sIHNraXBwaW5nLmApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ3Jldi1wYXJzZScsICdGRVRDSF9IRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdpdCBkaWZmIHN0YXRzIGJldHdlZW4gbWFzdGVyIGFuZCBnMywgZm9yIGFsbCBmaWxlcyBhbmQgZmlsdGVyZWQgdG8gb25seSBnMyBhZmZlY3RpbmdcbiAgICogZmlsZXMuXG4gICAqL1xuICBwcml2YXRlIGdldERpZmZTdGF0cyhcbiAgICAgIGczUmVmOiBzdHJpbmcsIG1hc3RlclJlZjogc3RyaW5nLCBpbmNsdWRlRmlsZXM6IHN0cmluZ1tdLCBleGNsdWRlRmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgLyoqIFRoZSBkaWZmIHN0YXRzIHRvIGJlIHJldHVybmVkLiAqL1xuICAgIGNvbnN0IHN0YXRzID0ge1xuICAgICAgaW5zZXJ0aW9uczogMCxcbiAgICAgIGRlbGV0aW9uczogMCxcbiAgICAgIGZpbGVzOiAwLFxuICAgICAgY29tbWl0czogMCxcbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgY29tbWl0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMgcmVmcy4gKi9cbiAgICBzdGF0cy5jb21taXRzID1cbiAgICAgICAgcGFyc2VJbnQodGhpcy5naXQucnVuKFsncmV2LWxpc3QnLCAnLS1jb3VudCcsIGAke2czUmVmfS4uJHttYXN0ZXJSZWZ9YF0pLnN0ZG91dCwgMTApO1xuXG4gICAgLy8gR2V0IHRoZSBudW1zdGF0IGluZm9ybWF0aW9uIGJldHdlZW4gbWFzdGVyIGFuZCBnM1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2RpZmYnLCBgJHtnM1JlZn0uLi4ke21hc3RlclJlZn1gLCAnLS1udW1zdGF0J10pXG4gICAgICAgIC5zdGRvdXRcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBleHRyYSBzcGFjZSBhZnRlciBnaXQncyBvdXRwdXQuXG4gICAgICAgIC50cmltKClcbiAgICAgICAgLy8gU3BsaXQgZWFjaCBsaW5lIG9mIGdpdCBvdXRwdXQgaW50byBhcnJheVxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBmcm9tIHRoZSBnaXQgb3V0cHV0IGludG8gY29tcG9uZW50cyBwYXJ0czogaW5zZXJ0aW9ucyxcbiAgICAgICAgLy8gZGVsZXRpb25zIGFuZCBmaWxlIG5hbWUgcmVzcGVjdGl2ZWx5XG4gICAgICAgIC5tYXAobGluZSA9PiBsaW5lLnRyaW0oKS5zcGxpdCgnXFx0JykpXG4gICAgICAgIC8vIFBhcnNlIG51bWJlciB2YWx1ZSBmcm9tIHRoZSBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgdmFsdWVzXG4gICAgICAgIC8vIEV4YW1wbGUgcmF3IGxpbmUgaW5wdXQ6XG4gICAgICAgIC8vICAgMTBcXHQ1XFx0c3JjL2ZpbGUvbmFtZS50c1xuICAgICAgICAubWFwKGxpbmUgPT4gW051bWJlcihsaW5lWzBdKSwgTnVtYmVyKGxpbmVbMV0pLCBsaW5lWzJdXSBhcyBbbnVtYmVyLCBudW1iZXIsIHN0cmluZ10pXG4gICAgICAgIC8vIEFkZCBlYWNoIGxpbmUncyB2YWx1ZSB0byB0aGUgZGlmZiBzdGF0cywgYW5kIGNvbmRpdGlvbmFsbHkgdG8gdGhlIGczXG4gICAgICAgIC8vIHN0YXRzIGFzIHdlbGwgaWYgdGhlIGZpbGUgbmFtZSBpcyBpbmNsdWRlZCBpbiB0aGUgZmlsZXMgc3luY2VkIHRvIGczLlxuICAgICAgICAuZm9yRWFjaCgoW2luc2VydGlvbnMsIGRlbGV0aW9ucywgZmlsZU5hbWVdKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlTmFtZSwgaW5jbHVkZUZpbGVzLCBleGNsdWRlRmlsZXMpKSB7XG4gICAgICAgICAgICBzdGF0cy5pbnNlcnRpb25zICs9IGluc2VydGlvbnM7XG4gICAgICAgICAgICBzdGF0cy5kZWxldGlvbnMgKz0gZGVsZXRpb25zO1xuICAgICAgICAgICAgc3RhdHMuZmlsZXMgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBzdGF0cztcbiAgfVxuICAvKiogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGZpbGUgbmFtZSBwYXNzZXMgYm90aCBpbmNsdWRlIGFuZCBleGNsdWRlIGNoZWNrcy4gKi9cbiAgcHJpdmF0ZSBjaGVja01hdGNoQWdhaW5zdEluY2x1ZGVBbmRFeGNsdWRlKGZpbGU6IHN0cmluZywgaW5jbHVkZXM6IHN0cmluZ1tdLCBleGNsdWRlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBtdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBmaWxlLCBpbmNsdWRlcykubGVuZ3RoID49IDEgJiZcbiAgICAgICAgbXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgZmlsZSwgZXhjbHVkZXMpLmxlbmd0aCA9PT0gMCk7XG4gIH1cblxuXG4gIHByaXZhdGUgZ2V0RzNGaWxlSW5jbHVkZUFuZEV4Y2x1ZGVMaXN0cygpIHtcbiAgICBjb25zdCBhbmd1bGFyUm9ib3RGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJy5naXRodWIvYW5ndWxhci1yb2JvdC55bWwnKTtcbiAgICBpZiAoIWV4aXN0c1N5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpKSB7XG4gICAgICBkZWJ1ZygnTm8gYW5ndWxhciByb2JvdCBjb25maWd1cmF0aW9uIGZpbGUgZXhpc3RzLCBza2lwcGluZy4nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgdGhlIGFuZ3VsYXIgcm9ib3QuICovXG4gICAgY29uc3Qgcm9ib3RDb25maWcgPSBwYXJzZVlhbWwocmVhZEZpbGVTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKS50b1N0cmluZygpKTtcbiAgICAvKiogVGhlIGZpbGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBnMyBzeW5jLiAqL1xuICAgIGNvbnN0IGluY2x1ZGU6IHN0cmluZ1tdID0gcm9ib3RDb25maWc/Lm1lcmdlPy5nM1N0YXR1cz8uaW5jbHVkZSB8fCBbXTtcbiAgICAvKiogVGhlIGZpbGVzIHRvIGJlIGV4cGVjdGVkIGluIHRoZSBnMyBzeW5jLiAqL1xuICAgIGNvbnN0IGV4Y2x1ZGU6IHN0cmluZ1tdID0gcm9ib3RDb25maWc/Lm1lcmdlPy5nM1N0YXR1cz8uZXhjbHVkZSB8fCBbXTtcblxuICAgIGlmIChpbmNsdWRlLmxlbmd0aCA9PT0gMCAmJiBleGNsdWRlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVidWcoJ05vIGczU3RhdHVzIGluY2x1ZGUgb3IgZXhjbHVkZSBsaXN0cyBhcmUgZGVmaW5lZCBpbiB0aGUgYW5ndWxhciByb2JvdCBjb25maWd1cmF0aW9uJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge2luY2x1ZGUsIGV4Y2x1ZGV9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMYXRlc3RTaGFzKCkge1xuICAgIC8qKiBUaGUgbGF0ZXN0IHNoYSBmb3IgdGhlIGczIGJyYW5jaC4gKi9cbiAgICBjb25zdCBnMyA9IHRoaXMuZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KCdnMycpO1xuICAgIC8qKiBUaGUgbGF0ZXN0IHNoYSBmb3IgdGhlIG1hc3RlciBicmFuY2guICovXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5nZXRTaGFGb3JCcmFuY2hMYXRlc3QoJ21hc3RlcicpO1xuXG4gICAgaWYgKGczID09PSBudWxsIHx8IG1hc3RlciA9PT0gbnVsbCkge1xuICAgICAgZGVidWcoJ0VpdGhlciB0aGUgZzMgb3IgbWFzdGVyIHdhcyB1bmFibGUgdG8gYmUgcmV0cmlldmVkJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge2czLCBtYXN0ZXJ9O1xuICB9XG59XG4iXX0=