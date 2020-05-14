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
        define("@angular/dev-infra-private/format/formatters/buildifier", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Buildifier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
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
                            console.error("Error running buildifier on: " + file);
                            console.error(stderr);
                            console.error();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBRWxELDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQWdDLHNDQUFTO1FBQXpDO1lBQUEscUVBNkJDO1lBNUJDLFVBQUksR0FBRyxZQUFZLENBQUM7WUFFcEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFFeEUsd0JBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRWhGLGFBQU8sR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFLLGtCQUFrQiw0Q0FBeUM7b0JBQzVFLFFBQVEsRUFDSixVQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsTUFBYzt3QkFDdEMsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDdEQsQ0FBQztpQkFDTjtnQkFDRCxNQUFNLEVBQUU7b0JBQ04sWUFBWSxFQUFLLGtCQUFrQiwyQkFBd0I7b0JBQzNELFFBQVEsRUFDSixVQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWM7d0JBQ3BELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFnQyxJQUFNLENBQUMsQ0FBQzs0QkFDdEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDdEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUNoQixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsaUJBQUM7SUFBRCxDQUFDLEFBN0JELENBQWdDLDBCQUFTLEdBNkJ4QztJQTdCWSxnQ0FBVTtJQStCdkIsdUVBQXVFO0lBQ3ZFLElBQU0sa0JBQWtCLEdBQUcsc0VBQXNFO1FBQzdGLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYsdUZBQXVGO1FBQ3ZGLHNGQUFzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIGJ1aWxkaWZpZXIgYWdhaW5zdCBiYXplbCByZWxhdGVkIGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQnVpbGRpZmllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG5hbWUgPSAnYnVpbGRpZmllcic7XG5cbiAgYmluYXJ5RmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICdub2RlX21vZHVsZXMvLmJpbi9idWlsZGlmaWVyJyk7XG5cbiAgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLmJ6bCcsICcqKi9CVUlMRC5iYXplbCcsICcqKi9XT1JLU1BBQ0UnLCAnKiovQlVJTEQnXTtcblxuICBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PXdhcm4gLS1tb2RlPWNoZWNrIC0tZm9ybWF0PWpzb25gLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDAgfHwgIUpTT04ucGFyc2Uoc3Rkb3V0KVsnc3VjY2VzcyddO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9Zml4IC0tbW9kZT1maXhgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBydW5uaW5nIGJ1aWxkaWZpZXIgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIFRoZSB3YXJuaW5nIGZsYWcgZm9yIGJ1aWxkaWZpZXIgY29waWVkIGZyb20gYW5ndWxhci9hbmd1bGFyJ3MgdXNhZ2UuXG5jb25zdCBCQVpFTF9XQVJOSU5HX0ZMQUcgPSBgLS13YXJuaW5ncz1hdHRyLWNmZyxhdHRyLWxpY2Vuc2UsYXR0ci1ub24tZW1wdHksYXR0ci1vdXRwdXQtZGVmYXVsdCxgICtcbiAgICBgYXR0ci1zaW5nbGUtZmlsZSxjb25zdGFudC1nbG9iLGN0eC1hcmdzLGRlcHNldC1pdGVyYXRpb24sZGVwc2V0LXVuaW9uLGRpY3QtY29uY2F0ZW5hdGlvbixgICtcbiAgICBgZHVwbGljYXRlZC1uYW1lLGZpbGV0eXBlLGdpdC1yZXBvc2l0b3J5LGh0dHAtYXJjaGl2ZSxpbnRlZ2VyLWRpdmlzaW9uLGxvYWQsbG9hZC1vbi10b3AsYCArXG4gICAgYG5hdGl2ZS1idWlsZCxuYXRpdmUtcGFja2FnZSxvdXRwdXQtZ3JvdXAscGFja2FnZS1uYW1lLHBhY2thZ2Utb24tdG9wLHBvc2l0aW9uYWwtYXJncyxgICtcbiAgICBgcmVkZWZpbmVkLXZhcmlhYmxlLHJlcG9zaXRvcnktbmFtZSxzYW1lLW9yaWdpbi1sb2FkLHN0cmluZy1pdGVyYXRpb24sdW51c2VkLXZhcmlhYmxlYDtcbiJdfQ==