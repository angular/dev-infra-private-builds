/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/format/formatters/buildifier", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Buildifier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    /**
     * Formatter for running buildifier against bazel related files.
     */
    var Buildifier = /** @class */ (function (_super) {
        tslib_1.__extends(Buildifier, _super);
        function Buildifier() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'buildifier';
            _this.binaryFilePath = path_1.join(config_1.getRepoBaseDir(), 'node_modules/.bin/buildifier');
            _this.defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
            _this.actions = {
                check: {
                    commandFlags: BAZEL_WARNING_FLAG + " --lint=warn --mode=check --format=json",
                    callback: function (_, code, stdout) {
                        return code !== 0 || !JSON.parse(stdout)['success'];
                    },
                },
                format: {
                    commandFlags: BAZEL_WARNING_FLAG + " --lint=fix --mode=fix",
                    callback: function (file, code, _, stderr) {
                        if (code !== 0) {
                            console_1.error("Error running buildifier on: " + file);
                            console_1.error(stderr);
                            console_1.error();
                            return true;
                        }
                        return false;
                    }
                }
            };
            return _this;
        }
        return Buildifier;
    }(base_formatter_1.Formatter));
    exports.Buildifier = Buildifier;
    // The warning flag for buildifier copied from angular/angular's usage.
    var BAZEL_WARNING_FLAG = "--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default," +
        "attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation," +
        "duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top," +
        "native-build,native-package,output-group,package-name,package-on-top,positional-args," +
        "redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable";
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBQ2xELG9FQUEwQztJQUUxQyw4RkFBMkM7SUFFM0M7O09BRUc7SUFDSDtRQUFnQyxzQ0FBUztRQUF6QztZQUFBLHFFQTZCQztZQTVCQyxVQUFJLEdBQUcsWUFBWSxDQUFDO1lBRXBCLG9CQUFjLEdBQUcsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBRXhFLHdCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVoRixhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBSyxrQkFBa0IsNENBQXlDO29CQUM1RSxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWM7d0JBQ3RDLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3RELENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBSyxrQkFBa0IsMkJBQXdCO29CQUMzRCxRQUFRLEVBQ0osVUFBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNwRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsZUFBSyxDQUFDLGtDQUFnQyxJQUFNLENBQUMsQ0FBQzs0QkFDOUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNkLGVBQUssRUFBRSxDQUFDOzRCQUNSLE9BQU8sSUFBSSxDQUFDO3lCQUNiO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUM7aUJBQ047YUFDRixDQUFDOztRQUNKLENBQUM7UUFBRCxpQkFBQztJQUFELENBQUMsQUE3QkQsQ0FBZ0MsMEJBQVMsR0E2QnhDO0lBN0JZLGdDQUFVO0lBK0J2Qix1RUFBdUU7SUFDdkUsSUFBTSxrQkFBa0IsR0FBRyxzRUFBc0U7UUFDN0YsMkZBQTJGO1FBQzNGLHlGQUF5RjtRQUN6Rix1RkFBdUY7UUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBidWlsZGlmaWVyIGFnYWluc3QgYmF6ZWwgcmVsYXRlZCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkaWZpZXIgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBuYW1lID0gJ2J1aWxkaWZpZXInO1xuXG4gIGJpbmFyeUZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnbm9kZV9tb2R1bGVzLy5iaW4vYnVpbGRpZmllcicpO1xuXG4gIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi5iemwnLCAnKiovQlVJTEQuYmF6ZWwnLCAnKiovV09SS1NQQUNFJywgJyoqL0JVSUxEJ107XG5cbiAgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD13YXJuIC0tbW9kZT1jaGVjayAtLWZvcm1hdD1qc29uYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChfOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlICE9PSAwIHx8ICFKU09OLnBhcnNlKHN0ZG91dClbJ3N1Y2Nlc3MnXTtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PWZpeCAtLW1vZGU9Zml4YCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgYnVpbGRpZmllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBUaGUgd2FybmluZyBmbGFnIGZvciBidWlsZGlmaWVyIGNvcGllZCBmcm9tIGFuZ3VsYXIvYW5ndWxhcidzIHVzYWdlLlxuY29uc3QgQkFaRUxfV0FSTklOR19GTEFHID0gYC0td2FybmluZ3M9YXR0ci1jZmcsYXR0ci1saWNlbnNlLGF0dHItbm9uLWVtcHR5LGF0dHItb3V0cHV0LWRlZmF1bHQsYCArXG4gICAgYGF0dHItc2luZ2xlLWZpbGUsY29uc3RhbnQtZ2xvYixjdHgtYXJncyxkZXBzZXQtaXRlcmF0aW9uLGRlcHNldC11bmlvbixkaWN0LWNvbmNhdGVuYXRpb24sYCArXG4gICAgYGR1cGxpY2F0ZWQtbmFtZSxmaWxldHlwZSxnaXQtcmVwb3NpdG9yeSxodHRwLWFyY2hpdmUsaW50ZWdlci1kaXZpc2lvbixsb2FkLGxvYWQtb24tdG9wLGAgK1xuICAgIGBuYXRpdmUtYnVpbGQsbmF0aXZlLXBhY2thZ2Usb3V0cHV0LWdyb3VwLHBhY2thZ2UtbmFtZSxwYWNrYWdlLW9uLXRvcCxwb3NpdGlvbmFsLWFyZ3MsYCArXG4gICAgYHJlZGVmaW5lZC12YXJpYWJsZSxyZXBvc2l0b3J5LW5hbWUsc2FtZS1vcmlnaW4tbG9hZCxzdHJpbmctaXRlcmF0aW9uLHVudXNlZC12YXJpYWJsZWA7XG4iXX0=