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
        define("@angular/dev-infra-private/caretaker/check/g3", ["require", "exports", "tslib", "fs", "multimatch", "path", "yaml", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/caretaker/check/base"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
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
            var angularRobotFilePath = path_1.join(config_1.getRepoBaseDir(), '.github/angular-robot.yml');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFDeEMsa0VBQWtEO0lBQ2xELG9FQUE2RDtJQUU3RCx3RUFBa0M7SUFVbEM7UUFBOEIsb0NBQTRCO1FBQTFEOztRQW1JQSxDQUFDO1FBbElPLCtCQUFZLEdBQWxCOzs7O29CQUNRLFVBQVUsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztvQkFDcEQsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7d0JBQzdDLHNCQUFPO3FCQUNSO29CQUVELHNCQUFPLElBQUksQ0FBQyxZQUFZLENBQ3BCLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBQzs7O1NBQzdFO1FBRUssa0NBQWUsR0FBckI7Ozs7O2dDQUNnQixxQkFBTSxJQUFJLENBQUMsSUFBSSxFQUFBOzs0QkFBdkIsS0FBSyxHQUFHLFNBQWU7NEJBQzdCLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0NBQ1Ysc0JBQU87NkJBQ1I7NEJBQ0QsY0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDOzRCQUNwQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO2dDQUNyQixjQUFJLENBQUksS0FBSyxDQUFDLE9BQU8sbUNBQWdDLENBQUMsQ0FBQztnQ0FDdkQsY0FBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7NkJBQzND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QUFLLDBDQUFFLFFBQVEsMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQztZQUV0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoRCxlQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztnQkFDN0YsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sRUFBQyxPQUFPLFNBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO1FBQzVCLENBQUM7UUFFTyxnQ0FBYSxHQUFyQjtZQUNFLHdDQUF3QztZQUN4QyxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsNENBQTRDO1lBQzVDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVwRCxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDbEMsZUFBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLEVBQUMsRUFBRSxJQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQztRQUN0QixDQUFDO1FBQ0gsZUFBQztJQUFELENBQUMsQUFuSUQsQ0FBOEIsaUJBQVUsR0FtSXZDO0lBbklZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2JvbGQsIGRlYnVnLCBlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIEluZm9ybWF0aW9uIGV4cHJlc3NpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWFzdGVyIGFuZCBnMyBicmFuY2hlcyAqL1xuZXhwb3J0IGludGVyZmFjZSBHM1N0YXRzRGF0YSB7XG4gIGluc2VydGlvbnM6IG51bWJlcjtcbiAgZGVsZXRpb25zOiBudW1iZXI7XG4gIGZpbGVzOiBudW1iZXI7XG4gIGNvbW1pdHM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEczTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxHM1N0YXRzRGF0YXx2b2lkPiB7XG4gIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICBjb25zdCB0b0NvcHlUb0czID0gdGhpcy5nZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCk7XG4gICAgY29uc3QgbGF0ZXN0U2hhID0gdGhpcy5nZXRMYXRlc3RTaGFzKCk7XG5cbiAgICBpZiAodG9Db3B5VG9HMyA9PT0gbnVsbCB8fCBsYXRlc3RTaGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXREaWZmU3RhdHMoXG4gICAgICAgIGxhdGVzdFNoYS5nMywgbGF0ZXN0U2hhLm1hc3RlciwgdG9Db3B5VG9HMy5pbmNsdWRlLCB0b0NvcHlUb0czLmV4Y2x1ZGUpO1xuICB9XG5cbiAgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGlmICghc3RhdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mby5ncm91cChib2xkKCdnMyBicmFuY2ggY2hlY2snKSk7XG4gICAgaWYgKHN0YXRzLmZpbGVzID09PSAwKSB7XG4gICAgICBpbmZvKGAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgYmV0d2VlbiBnMyBhbmQgbWFzdGVyYCk7XG4gICAgICBpbmZvKCfinIUgIE5vIHN5bmMgaXMgbmVlZGVkIGF0IHRoaXMgdGltZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmZvKFxuICAgICAgICAgIGAke3N0YXRzLmZpbGVzfSBmaWxlcyBjaGFuZ2VkLCAke3N0YXRzLmluc2VydGlvbnN9IGluc2VydGlvbnMoKyksICR7c3RhdHMuZGVsZXRpb25zfSBgICtcbiAgICAgICAgICBgZGVsZXRpb25zKC0pIGZyb20gJHtzdGF0cy5jb21taXRzfSBjb21taXRzIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIG5leHQgc3luY2ApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEZldGNoIGFuZCByZXRyaWV2ZSB0aGUgbGF0ZXN0IHNoYSBmb3IgYSBzcGVjaWZpYyBicmFuY2guICovXG4gIHByaXZhdGUgZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KGJyYW5jaDogc3RyaW5nKSB7XG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICAvKiogVGhlIHJlc3VsdCBmbyB0aGUgZmV0Y2ggY29tbWFuZC4gKi9cbiAgICBjb25zdCBmZXRjaFJlc3VsdCA9XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnZmV0Y2gnLCAnLXEnLCBgaHR0cHM6Ly9naXRodWIuY29tLyR7b3duZXJ9LyR7bmFtZX0uZ2l0YCwgYnJhbmNoXSk7XG5cbiAgICBpZiAoZmV0Y2hSZXN1bHQuc3RhdHVzICE9PSAwICYmXG4gICAgICAgIGZldGNoUmVzdWx0LnN0ZGVyci5pbmNsdWRlcyhgY291bGRuJ3QgZmluZCByZW1vdGUgcmVmICR7YnJhbmNofWApKSB7XG4gICAgICBkZWJ1ZyhgTm8gJyR7YnJhbmNofScgYnJhbmNoIGV4aXN0cyBvbiB1cHN0cmVhbSwgc2tpcHBpbmcuYCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsncmV2LXBhcnNlJywgJ0ZFVENIX0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2l0IGRpZmYgc3RhdHMgYmV0d2VlbiBtYXN0ZXIgYW5kIGczLCBmb3IgYWxsIGZpbGVzIGFuZCBmaWx0ZXJlZCB0byBvbmx5IGczIGFmZmVjdGluZ1xuICAgKiBmaWxlcy5cbiAgICovXG4gIHByaXZhdGUgZ2V0RGlmZlN0YXRzKFxuICAgICAgZzNSZWY6IHN0cmluZywgbWFzdGVyUmVmOiBzdHJpbmcsIGluY2x1ZGVGaWxlczogc3RyaW5nW10sIGV4Y2x1ZGVGaWxlczogc3RyaW5nW10pIHtcbiAgICAvKiogVGhlIGRpZmYgc3RhdHMgdG8gYmUgcmV0dXJuZWQuICovXG4gICAgY29uc3Qgc3RhdHMgPSB7XG4gICAgICBpbnNlcnRpb25zOiAwLFxuICAgICAgZGVsZXRpb25zOiAwLFxuICAgICAgZmlsZXM6IDAsXG4gICAgICBjb21taXRzOiAwLFxuICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG51bWJlciBvZiBjb21taXRzIGJldHdlZW4gbWFzdGVyIGFuZCBnMyByZWZzLiAqL1xuICAgIHN0YXRzLmNvbW1pdHMgPVxuICAgICAgICBwYXJzZUludCh0aGlzLmdpdC5ydW4oWydyZXYtbGlzdCcsICctLWNvdW50JywgYCR7ZzNSZWZ9Li4ke21hc3RlclJlZn1gXSkuc3Rkb3V0LCAxMCk7XG5cbiAgICAvLyBHZXQgdGhlIG51bXN0YXQgaW5mb3JtYXRpb24gYmV0d2VlbiBtYXN0ZXIgYW5kIGczXG4gICAgdGhpcy5naXQucnVuKFsnZGlmZicsIGAke2czUmVmfS4uLiR7bWFzdGVyUmVmfWAsICctLW51bXN0YXQnXSlcbiAgICAgICAgLnN0ZG91dFxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV4dHJhIHNwYWNlIGFmdGVyIGdpdCdzIG91dHB1dC5cbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgb2YgZ2l0IG91dHB1dCBpbnRvIGFycmF5XG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLy8gU3BsaXQgZWFjaCBsaW5lIGZyb20gdGhlIGdpdCBvdXRwdXQgaW50byBjb21wb25lbnRzIHBhcnRzOiBpbnNlcnRpb25zLFxuICAgICAgICAvLyBkZWxldGlvbnMgYW5kIGZpbGUgbmFtZSByZXNwZWN0aXZlbHlcbiAgICAgICAgLm1hcChsaW5lID0+IGxpbmUudHJpbSgpLnNwbGl0KCdcXHQnKSlcbiAgICAgICAgLy8gUGFyc2UgbnVtYmVyIHZhbHVlIGZyb20gdGhlIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB2YWx1ZXNcbiAgICAgICAgLy8gRXhhbXBsZSByYXcgbGluZSBpbnB1dDpcbiAgICAgICAgLy8gICAxMFxcdDVcXHRzcmMvZmlsZS9uYW1lLnRzXG4gICAgICAgIC5tYXAobGluZSA9PiBbTnVtYmVyKGxpbmVbMF0pLCBOdW1iZXIobGluZVsxXSksIGxpbmVbMl1dIGFzIFtudW1iZXIsIG51bWJlciwgc3RyaW5nXSlcbiAgICAgICAgLy8gQWRkIGVhY2ggbGluZSdzIHZhbHVlIHRvIHRoZSBkaWZmIHN0YXRzLCBhbmQgY29uZGl0aW9uYWxseSB0byB0aGUgZzNcbiAgICAgICAgLy8gc3RhdHMgYXMgd2VsbCBpZiB0aGUgZmlsZSBuYW1lIGlzIGluY2x1ZGVkIGluIHRoZSBmaWxlcyBzeW5jZWQgdG8gZzMuXG4gICAgICAgIC5mb3JFYWNoKChbaW5zZXJ0aW9ucywgZGVsZXRpb25zLCBmaWxlTmFtZV0pID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5jaGVja01hdGNoQWdhaW5zdEluY2x1ZGVBbmRFeGNsdWRlKGZpbGVOYW1lLCBpbmNsdWRlRmlsZXMsIGV4Y2x1ZGVGaWxlcykpIHtcbiAgICAgICAgICAgIHN0YXRzLmluc2VydGlvbnMgKz0gaW5zZXJ0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmRlbGV0aW9ucyArPSBkZWxldGlvbnM7XG4gICAgICAgICAgICBzdGF0cy5maWxlcyArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG4gIC8qKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgZmlsZSBuYW1lIHBhc3NlcyBib3RoIGluY2x1ZGUgYW5kIGV4Y2x1ZGUgY2hlY2tzLiAqL1xuICBwcml2YXRlIGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZTogc3RyaW5nLCBpbmNsdWRlczogc3RyaW5nW10sIGV4Y2x1ZGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGluY2x1ZGVzKS5sZW5ndGggPj0gMSAmJlxuICAgICAgICBtdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBmaWxlLCBleGNsdWRlcykubGVuZ3RoID09PSAwKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBnZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCkge1xuICAgIGNvbnN0IGFuZ3VsYXJSb2JvdEZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnLmdpdGh1Yi9hbmd1bGFyLXJvYm90LnltbCcpO1xuICAgIGlmICghZXhpc3RzU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkpIHtcbiAgICAgIGRlYnVnKCdObyBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24gZmlsZSBleGlzdHMsIHNraXBwaW5nLicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciB0aGUgYW5ndWxhciByb2JvdC4gKi9cbiAgICBjb25zdCByb2JvdENvbmZpZyA9IHBhcnNlWWFtbChyZWFkRmlsZVN5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpLnRvU3RyaW5nKCkpO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgaW5jbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5pbmNsdWRlIHx8IFtdO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgZXhwZWN0ZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgZXhjbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5leGNsdWRlIHx8IFtdO1xuXG4gICAgaWYgKGluY2x1ZGUubGVuZ3RoID09PSAwICYmIGV4Y2x1ZGUubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWJ1ZygnTm8gZzNTdGF0dXMgaW5jbHVkZSBvciBleGNsdWRlIGxpc3RzIGFyZSBkZWZpbmVkIGluIHRoZSBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7aW5jbHVkZSwgZXhjbHVkZX07XG4gIH1cblxuICBwcml2YXRlIGdldExhdGVzdFNoYXMoKSB7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgZzMgYnJhbmNoLiAqL1xuICAgIGNvbnN0IGczID0gdGhpcy5nZXRTaGFGb3JCcmFuY2hMYXRlc3QoJ2czJyk7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgbWFzdGVyIGJyYW5jaC4gKi9cbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLmdldFNoYUZvckJyYW5jaExhdGVzdCgnbWFzdGVyJyk7XG5cbiAgICBpZiAoZzMgPT09IG51bGwgfHwgbWFzdGVyID09PSBudWxsKSB7XG4gICAgICBkZWJ1ZygnRWl0aGVyIHRoZSBnMyBvciBtYXN0ZXIgd2FzIHVuYWJsZSB0byBiZSByZXRyaWV2ZWQnKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7ZzMsIG1hc3Rlcn07XG4gIH1cbn1cbiJdfQ==