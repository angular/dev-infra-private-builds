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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBQ2xELG9FQUEwQztJQUUxQyw4RkFBMkM7SUFFM0M7O09BRUc7SUFDSDtRQUFnQyxzQ0FBUztRQUF6QztZQUFBLHFFQTZCQztZQTVCQyxVQUFJLEdBQUcsWUFBWSxDQUFDO1lBRXBCLG9CQUFjLEdBQUcsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBRXhFLHdCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVoRixhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBSyxrQkFBa0IsNENBQXlDO29CQUM1RSxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWM7d0JBQ3RDLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM3RSxDQUFDO2lCQUNOO2dCQUNELE1BQU0sRUFBRTtvQkFDTixZQUFZLEVBQUssa0JBQWtCLDJCQUF3QjtvQkFDM0QsUUFBUSxFQUNKLFVBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxDQUFTLEVBQUUsTUFBYzt3QkFDcEQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFOzRCQUNkLGVBQUssQ0FBQyxrQ0FBZ0MsSUFBTSxDQUFDLENBQUM7NEJBQzlDLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDZCxlQUFLLEVBQUUsQ0FBQzs0QkFDUixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsaUJBQUM7SUFBRCxDQUFDLEFBN0JELENBQWdDLDBCQUFTLEdBNkJ4QztJQTdCWSxnQ0FBVTtJQStCdkIsdUVBQXVFO0lBQ3ZFLElBQU0sa0JBQWtCLEdBQUcsc0VBQXNFO1FBQzdGLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYsdUZBQXVGO1FBQ3ZGLHNGQUFzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBidWlsZGlmaWVyIGFnYWluc3QgYmF6ZWwgcmVsYXRlZCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkaWZpZXIgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBuYW1lID0gJ2J1aWxkaWZpZXInO1xuXG4gIGJpbmFyeUZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnbm9kZV9tb2R1bGVzLy5iaW4vYnVpbGRpZmllcicpO1xuXG4gIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi5iemwnLCAnKiovQlVJTEQuYmF6ZWwnLCAnKiovV09SS1NQQUNFJywgJyoqL0JVSUxEJ107XG5cbiAgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD13YXJuIC0tbW9kZT1jaGVjayAtLWZvcm1hdD1qc29uYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChfOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlICE9PSAwIHx8ICEoSlNPTi5wYXJzZShzdGRvdXQpIGFzIHtzdWNjZXNzOiBzdHJpbmd9KVsnc3VjY2VzcyddO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9Zml4IC0tbW9kZT1maXhgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBidWlsZGlmaWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIFRoZSB3YXJuaW5nIGZsYWcgZm9yIGJ1aWxkaWZpZXIgY29waWVkIGZyb20gYW5ndWxhci9hbmd1bGFyJ3MgdXNhZ2UuXG5jb25zdCBCQVpFTF9XQVJOSU5HX0ZMQUcgPSBgLS13YXJuaW5ncz1hdHRyLWNmZyxhdHRyLWxpY2Vuc2UsYXR0ci1ub24tZW1wdHksYXR0ci1vdXRwdXQtZGVmYXVsdCxgICtcbiAgICBgYXR0ci1zaW5nbGUtZmlsZSxjb25zdGFudC1nbG9iLGN0eC1hcmdzLGRlcHNldC1pdGVyYXRpb24sZGVwc2V0LXVuaW9uLGRpY3QtY29uY2F0ZW5hdGlvbixgICtcbiAgICBgZHVwbGljYXRlZC1uYW1lLGZpbGV0eXBlLGdpdC1yZXBvc2l0b3J5LGh0dHAtYXJjaGl2ZSxpbnRlZ2VyLWRpdmlzaW9uLGxvYWQsbG9hZC1vbi10b3AsYCArXG4gICAgYG5hdGl2ZS1idWlsZCxuYXRpdmUtcGFja2FnZSxvdXRwdXQtZ3JvdXAscGFja2FnZS1uYW1lLHBhY2thZ2Utb24tdG9wLHBvc2l0aW9uYWwtYXJncyxgICtcbiAgICBgcmVkZWZpbmVkLXZhcmlhYmxlLHJlcG9zaXRvcnktbmFtZSxzYW1lLW9yaWdpbi1sb2FkLHN0cmluZy1pdGVyYXRpb24sdW51c2VkLXZhcmlhYmxlYDtcbiJdfQ==