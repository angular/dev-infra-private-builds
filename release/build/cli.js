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
        define("@angular/dev-infra-private/release/build/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/build"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseBuildCommandModule = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var index_2 = require("@angular/dev-infra-private/release/build");
    /** Yargs command builder for configuring the `ng-dev release build` command. */
    function builder(argv) {
        return argv.option('json', {
            type: 'boolean',
            description: 'Whether the built packages should be printed to stdout as JSON.',
            default: false,
        });
    }
    /** Yargs command handler for building a release. */
    function handler(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var npmPackages, builtPackages, missingPackages;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        npmPackages = index_1.getReleaseConfig().npmPackages;
                        return [4 /*yield*/, index_2.buildReleaseOutput(true)];
                    case 1:
                        builtPackages = _a.sent();
                        // If package building failed, print an error and exit with an error code.
                        if (builtPackages === null) {
                            console_1.error(console_1.red("  \u2718   Could not build release output. Please check output above."));
                            process.exit(1);
                        }
                        // If no packages have been built, we assume that this is never correct
                        // and exit with an error code.
                        if (builtPackages.length === 0) {
                            console_1.error(console_1.red("  \u2718   No release packages have been built. Please ensure that the"));
                            console_1.error(console_1.red("      build script is configured correctly in \".ng-dev\"."));
                            process.exit(1);
                        }
                        missingPackages = npmPackages.filter(function (pkgName) { return !builtPackages.find(function (b) { return b.name === pkgName; }); });
                        // Check for configured release packages which have not been built. We want to
                        // error and exit if any configured package has not been built.
                        if (missingPackages.length > 0) {
                            console_1.error(console_1.red("  \u2718   Release output missing for the following packages:"));
                            missingPackages.forEach(function (pkgName) { return console_1.error(console_1.red("      - " + pkgName)); });
                            process.exit(1);
                        }
                        if (args.json) {
                            process.stdout.write(JSON.stringify(builtPackages, null, 2));
                        }
                        else {
                            console_1.info(console_1.green('  ✓   Built release packages.'));
                            builtPackages.forEach(function (_a) {
                                var name = _a.name;
                                return console_1.info(console_1.green("      - " + name));
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for building release output. */
    exports.ReleaseBuildCommandModule = {
        builder: builder,
        handler: handler,
        command: 'build',
        describe: 'Builds the release output for the current branch.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFLSCxvRUFBMEU7SUFDMUUsbUVBQStEO0lBRS9ELGtFQUEyQztJQU8zQyxnRkFBZ0Y7SUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3pCLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLGlFQUFpRTtZQUM5RSxPQUFPLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxvREFBb0Q7SUFDcEQsU0FBZSxPQUFPLENBQUMsSUFBb0M7Ozs7Ozt3QkFDbEQsV0FBVyxHQUFJLHdCQUFnQixFQUFFLFlBQXRCLENBQXVCO3dCQUNyQixxQkFBTSwwQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBQTs7d0JBQTlDLGFBQWEsR0FBRyxTQUE4Qjt3QkFFbEQsMEVBQTBFO3dCQUMxRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7NEJBQzFCLGVBQUssQ0FBQyxhQUFHLENBQUMsdUVBQWtFLENBQUMsQ0FBQyxDQUFDOzRCQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCx1RUFBdUU7d0JBQ3ZFLCtCQUErQjt3QkFDL0IsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDOUIsZUFBSyxDQUFDLGFBQUcsQ0FBQyx3RUFBbUUsQ0FBQyxDQUFDLENBQUM7NEJBQ2hGLGVBQUssQ0FBQyxhQUFHLENBQUMsNERBQTBELENBQUMsQ0FBQyxDQUFDOzRCQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFSyxlQUFlLEdBQ2pCLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxDQUFDLGFBQWMsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBbEIsQ0FBa0IsQ0FBQyxFQUE3QyxDQUE2QyxDQUFDLENBQUM7d0JBRWpGLDhFQUE4RTt3QkFDOUUsK0RBQStEO3dCQUMvRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLCtEQUEwRCxDQUFDLENBQUMsQ0FBQzs0QkFDdkUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLGVBQUssQ0FBQyxhQUFHLENBQUMsYUFBVyxPQUFTLENBQUMsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDLENBQUM7NEJBQ3JFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDYixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDOUQ7NkJBQU07NEJBQ0wsY0FBSSxDQUFDLGVBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7NEJBQzdDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFNO29DQUFMLElBQUksVUFBQTtnQ0FBTSxPQUFBLGNBQUksQ0FBQyxlQUFLLENBQUMsYUFBVyxJQUFNLENBQUMsQ0FBQzs0QkFBOUIsQ0FBOEIsQ0FBQyxDQUFDO3lCQUNuRTs7Ozs7S0FDRjtJQUVELHNEQUFzRDtJQUN6QyxRQUFBLHlCQUF5QixHQUEyQztRQUMvRSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsT0FBTztRQUNoQixRQUFRLEVBQUUsbURBQW1EO0tBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2UsIGdldFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7YnVpbGRSZWxlYXNlT3V0cHV0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VCdWlsZE9wdGlvbnMge1xuICBqc29uOiBib29sZWFuO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlQnVpbGRPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2Lm9wdGlvbignanNvbicsIHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRoZSBidWlsdCBwYWNrYWdlcyBzaG91bGQgYmUgcHJpbnRlZCB0byBzdGRvdXQgYXMgSlNPTi4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihhcmdzOiBBcmd1bWVudHM8UmVsZWFzZUJ1aWxkT3B0aW9ucz4pIHtcbiAgY29uc3Qge25wbVBhY2thZ2VzfSA9IGdldFJlbGVhc2VDb25maWcoKTtcbiAgbGV0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQodHJ1ZSk7XG5cbiAgLy8gSWYgcGFja2FnZSBidWlsZGluZyBmYWlsZWQsIHByaW50IGFuIGVycm9yIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGJ1aWxkIHJlbGVhc2Ugb3V0cHV0LiBQbGVhc2UgY2hlY2sgb3V0cHV0IGFib3ZlLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBJZiBubyBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQsIHdlIGFzc3VtZSB0aGF0IHRoaXMgaXMgbmV2ZXIgY29ycmVjdFxuICAvLyBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBObyByZWxlYXNlIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdC4gUGxlYXNlIGVuc3VyZSB0aGF0IHRoZWApKTtcbiAgICBlcnJvcihyZWQoYCAgICAgIGJ1aWxkIHNjcmlwdCBpcyBjb25maWd1cmVkIGNvcnJlY3RseSBpbiBcIi5uZy1kZXZcIi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgbWlzc2luZ1BhY2thZ2VzID1cbiAgICAgIG5wbVBhY2thZ2VzLmZpbHRlcihwa2dOYW1lID0+ICFidWlsdFBhY2thZ2VzIS5maW5kKGIgPT4gYi5uYW1lID09PSBwa2dOYW1lKSk7XG5cbiAgLy8gQ2hlY2sgZm9yIGNvbmZpZ3VyZWQgcmVsZWFzZSBwYWNrYWdlcyB3aGljaCBoYXZlIG5vdCBiZWVuIGJ1aWx0LiBXZSB3YW50IHRvXG4gIC8vIGVycm9yIGFuZCBleGl0IGlmIGFueSBjb25maWd1cmVkIHBhY2thZ2UgaGFzIG5vdCBiZWVuIGJ1aWx0LlxuICBpZiAobWlzc2luZ1BhY2thZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgUmVsZWFzZSBvdXRwdXQgbWlzc2luZyBmb3IgdGhlIGZvbGxvd2luZyBwYWNrYWdlczpgKSk7XG4gICAgbWlzc2luZ1BhY2thZ2VzLmZvckVhY2gocGtnTmFtZSA9PiBlcnJvcihyZWQoYCAgICAgIC0gJHtwa2dOYW1lfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgaWYgKGFyZ3MuanNvbikge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KGJ1aWx0UGFja2FnZXMsIG51bGwsIDIpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEJ1aWx0IHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIGJ1aWx0UGFja2FnZXMuZm9yRWFjaCgoe25hbWV9KSA9PiBpbmZvKGdyZWVuKGAgICAgICAtICR7bmFtZX1gKSkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VCdWlsZE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQnLFxuICBkZXNjcmliZTogJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIHRoZSBjdXJyZW50IGJyYW5jaC4nLFxufTtcbiJdfQ==