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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFDeEMsb0VBQTZEO0lBRTdELHdFQUFrQztJQVVsQztRQUE4QixvQ0FBNEI7UUFBMUQ7O1FBbUlBLENBQUM7UUFsSU8sK0JBQVksR0FBbEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO29CQUNwRCxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUV2QyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTt3QkFDN0Msc0JBQU87cUJBQ1I7b0JBRUQsc0JBQU8sSUFBSSxDQUFDLFlBQVksQ0FDcEIsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFDOzs7U0FDN0U7UUFFSyxrQ0FBZSxHQUFyQjs7Ozs7Z0NBQ2dCLHFCQUFNLElBQUksQ0FBQyxJQUFJLEVBQUE7OzRCQUF2QixLQUFLLEdBQUcsU0FBZTs0QkFDN0IsSUFBSSxDQUFDLEtBQUssRUFBRTtnQ0FDVixzQkFBTzs2QkFDUjs0QkFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7NEJBQ3BDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0NBQ3JCLGNBQUksQ0FBSSxLQUFLLENBQUMsT0FBTyxtQ0FBZ0MsQ0FBQyxDQUFDO2dDQUN2RCxjQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs2QkFDM0M7aUNBQU07Z0NBQ0ws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QUFXLHVCQUFYLFdBQVcsQ0FBRSxLQUFLLDBDQUFFLFFBQVEsMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQztZQUV0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoRCxlQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztnQkFDN0YsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sRUFBQyxPQUFPLFNBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO1FBQzVCLENBQUM7UUFFTyxnQ0FBYSxHQUFyQjtZQUNFLHdDQUF3QztZQUN4QyxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsNENBQTRDO1lBQzVDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVwRCxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDbEMsZUFBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLEVBQUMsRUFBRSxJQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQztRQUN0QixDQUFDO1FBQ0gsZUFBQztJQUFELENBQUMsQUFuSUQsQ0FBOEIsaUJBQVUsR0FtSXZDO0lBbklZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG4vKiogSW5mb3JtYXRpb24gZXhwcmVzc2luZyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXN0ZXIgYW5kIGczIGJyYW5jaGVzICovXG5leHBvcnQgaW50ZXJmYWNlIEczU3RhdHNEYXRhIHtcbiAgaW5zZXJ0aW9uczogbnVtYmVyO1xuICBkZWxldGlvbnM6IG51bWJlcjtcbiAgZmlsZXM6IG51bWJlcjtcbiAgY29tbWl0czogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRzNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPEczU3RhdHNEYXRhfHZvaWQ+IHtcbiAgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIGNvbnN0IHRvQ29weVRvRzMgPSB0aGlzLmdldEczRmlsZUluY2x1ZGVBbmRFeGNsdWRlTGlzdHMoKTtcbiAgICBjb25zdCBsYXRlc3RTaGEgPSB0aGlzLmdldExhdGVzdFNoYXMoKTtcblxuICAgIGlmICh0b0NvcHlUb0czID09PSBudWxsIHx8IGxhdGVzdFNoYSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldERpZmZTdGF0cyhcbiAgICAgICAgbGF0ZXN0U2hhLmczLCBsYXRlc3RTaGEubWFzdGVyLCB0b0NvcHlUb0czLmluY2x1ZGUsIHRvQ29weVRvRzMuZXhjbHVkZSk7XG4gIH1cblxuICBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgaWYgKCFzdGF0cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwKGJvbGQoJ2czIGJyYW5jaCBjaGVjaycpKTtcbiAgICBpZiAoc3RhdHMuZmlsZXMgPT09IDApIHtcbiAgICAgIGluZm8oYCR7c3RhdHMuY29tbWl0c30gY29tbWl0cyBiZXR3ZWVuIGczIGFuZCBtYXN0ZXJgKTtcbiAgICAgIGluZm8oJ+KchSAgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZm8oXG4gICAgICAgICAgYCR7c3RhdHMuZmlsZXN9IGZpbGVzIGNoYW5nZWQsICR7c3RhdHMuaW5zZXJ0aW9uc30gaW5zZXJ0aW9ucygrKSwgJHtzdGF0cy5kZWxldGlvbnN9IGAgK1xuICAgICAgICAgIGBkZWxldGlvbnMoLSkgZnJvbSAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgd2lsbCBiZSBpbmNsdWRlZCBpbiB0aGUgbmV4dCBzeW5jYCk7XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cblxuICAvKiogRmV0Y2ggYW5kIHJldHJpZXZlIHRoZSBsYXRlc3Qgc2hhIGZvciBhIHNwZWNpZmljIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBnZXRTaGFGb3JCcmFuY2hMYXRlc3QoYnJhbmNoOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIC8qKiBUaGUgcmVzdWx0IGZvIHRoZSBmZXRjaCBjb21tYW5kLiAqL1xuICAgIGNvbnN0IGZldGNoUmVzdWx0ID1cbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydmZXRjaCcsICctcScsIGBodHRwczovL2dpdGh1Yi5jb20vJHtvd25lcn0vJHtuYW1lfS5naXRgLCBicmFuY2hdKTtcblxuICAgIGlmIChmZXRjaFJlc3VsdC5zdGF0dXMgIT09IDAgJiZcbiAgICAgICAgZmV0Y2hSZXN1bHQuc3RkZXJyLmluY2x1ZGVzKGBjb3VsZG4ndCBmaW5kIHJlbW90ZSByZWYgJHticmFuY2h9YCkpIHtcbiAgICAgIGRlYnVnKGBObyAnJHticmFuY2h9JyBicmFuY2ggZXhpc3RzIG9uIHVwc3RyZWFtLCBza2lwcGluZy5gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5naXQucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnaXQgZGlmZiBzdGF0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMsIGZvciBhbGwgZmlsZXMgYW5kIGZpbHRlcmVkIHRvIG9ubHkgZzMgYWZmZWN0aW5nXG4gICAqIGZpbGVzLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXREaWZmU3RhdHMoXG4gICAgICBnM1JlZjogc3RyaW5nLCBtYXN0ZXJSZWY6IHN0cmluZywgaW5jbHVkZUZpbGVzOiBzdHJpbmdbXSwgZXhjbHVkZUZpbGVzOiBzdHJpbmdbXSkge1xuICAgIC8qKiBUaGUgZGlmZiBzdGF0cyB0byBiZSByZXR1cm5lZC4gKi9cbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIGluc2VydGlvbnM6IDAsXG4gICAgICBkZWxldGlvbnM6IDAsXG4gICAgICBmaWxlczogMCxcbiAgICAgIGNvbW1pdHM6IDAsXG4gICAgfTtcblxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgYmV0d2VlbiBtYXN0ZXIgYW5kIGczIHJlZnMuICovXG4gICAgc3RhdHMuY29tbWl0cyA9XG4gICAgICAgIHBhcnNlSW50KHRoaXMuZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFzdGVyUmVmfWBdKS5zdGRvdXQsIDEwKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1hc3RlciBhbmQgZzNcbiAgICB0aGlzLmdpdC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYXN0ZXJSZWZ9YCwgJy0tbnVtc3RhdCddKVxuICAgICAgICAuc3Rkb3V0XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXh0cmEgc3BhY2UgYWZ0ZXIgZ2l0J3Mgb3V0cHV0LlxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBvZiBnaXQgb3V0cHV0IGludG8gYXJyYXlcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAgIC8vIGRlbGV0aW9ucyBhbmQgZmlsZSBuYW1lIHJlc3BlY3RpdmVseVxuICAgICAgICAubWFwKGxpbmUgPT4gbGluZS50cmltKCkuc3BsaXQoJ1xcdCcpKVxuICAgICAgICAvLyBQYXJzZSBudW1iZXIgdmFsdWUgZnJvbSB0aGUgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIHZhbHVlc1xuICAgICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgICAvLyAgIDEwXFx0NVxcdHNyYy9maWxlL25hbWUudHNcbiAgICAgICAgLm1hcChsaW5lID0+IFtOdW1iZXIobGluZVswXSksIE51bWJlcihsaW5lWzFdKSwgbGluZVsyXV0gYXMgW251bWJlciwgbnVtYmVyLCBzdHJpbmddKVxuICAgICAgICAvLyBBZGQgZWFjaCBsaW5lJ3MgdmFsdWUgdG8gdGhlIGRpZmYgc3RhdHMsIGFuZCBjb25kaXRpb25hbGx5IHRvIHRoZSBnM1xuICAgICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgICAgLmZvckVhY2goKFtpbnNlcnRpb25zLCBkZWxldGlvbnMsIGZpbGVOYW1lXSkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZU5hbWUsIGluY2x1ZGVGaWxlcywgZXhjbHVkZUZpbGVzKSkge1xuICAgICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgICAgc3RhdHMuZGVsZXRpb25zICs9IGRlbGV0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmZpbGVzICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cbiAgLyoqIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWxlIG5hbWUgcGFzc2VzIGJvdGggaW5jbHVkZSBhbmQgZXhjbHVkZSBjaGVja3MuICovXG4gIHByaXZhdGUgY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlOiBzdHJpbmcsIGluY2x1ZGVzOiBzdHJpbmdbXSwgZXhjbHVkZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgbXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgZmlsZSwgaW5jbHVkZXMpLmxlbmd0aCA+PSAxICYmXG4gICAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGV4Y2x1ZGVzKS5sZW5ndGggPT09IDApO1xuICB9XG5cblxuICBwcml2YXRlIGdldEczRmlsZUluY2x1ZGVBbmRFeGNsdWRlTGlzdHMoKSB7XG4gICAgY29uc3QgYW5ndWxhclJvYm90RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG4gICAgaWYgKCFleGlzdHNTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKSkge1xuICAgICAgZGVidWcoJ05vIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiBmaWxlIGV4aXN0cywgc2tpcHBpbmcuJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIHRoZSBhbmd1bGFyIHJvYm90LiAqL1xuICAgIGNvbnN0IHJvYm90Q29uZmlnID0gcGFyc2VZYW1sKHJlYWRGaWxlU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkudG9TdHJpbmcoKSk7XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBpbmNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmluY2x1ZGUgfHwgW107XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBleHBlY3RlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBleGNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmV4Y2x1ZGUgfHwgW107XG5cbiAgICBpZiAoaW5jbHVkZS5sZW5ndGggPT09IDAgJiYgZXhjbHVkZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlYnVnKCdObyBnM1N0YXR1cyBpbmNsdWRlIG9yIGV4Y2x1ZGUgbGlzdHMgYXJlIGRlZmluZWQgaW4gdGhlIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtpbmNsdWRlLCBleGNsdWRlfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGF0ZXN0U2hhcygpIHtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBnMyBicmFuY2guICovXG4gICAgY29uc3QgZzMgPSB0aGlzLmdldFNoYUZvckJyYW5jaExhdGVzdCgnZzMnKTtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBtYXN0ZXIgYnJhbmNoLiAqL1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMuZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KCdtYXN0ZXInKTtcblxuICAgIGlmIChnMyA9PT0gbnVsbCB8fCBtYXN0ZXIgPT09IG51bGwpIHtcbiAgICAgIGRlYnVnKCdFaXRoZXIgdGhlIGczIG9yIG1hc3RlciB3YXMgdW5hYmxlIHRvIGJlIHJldHJpZXZlZCcpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtnMywgbWFzdGVyfTtcbiAgfVxufVxuIl19