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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBQ2xELG9FQUEwQztJQUUxQyw4RkFBMkM7SUFFM0M7O09BRUc7SUFDSDtRQUFnQyxzQ0FBUztRQUF6QztZQUFBLHFFQTZCQztZQTVCQyxVQUFJLEdBQUcsWUFBWSxDQUFDO1lBRXBCLG9CQUFjLEdBQUcsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBRXhFLHdCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVoRixhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBSyxrQkFBa0IsNENBQXlDO29CQUM1RSxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWM7d0JBQ3RDLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3RELENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBSyxrQkFBa0IsMkJBQXdCO29CQUMzRCxRQUFRLEVBQ0osVUFBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNwRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsZUFBSyxDQUFDLGtDQUFnQyxJQUFNLENBQUMsQ0FBQzs0QkFDOUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNkLGVBQUssRUFBRSxDQUFDOzRCQUNSLE9BQU8sSUFBSSxDQUFDO3lCQUNiO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUM7aUJBQ047YUFDRixDQUFDOztRQUNKLENBQUM7UUFBRCxpQkFBQztJQUFELENBQUMsQUE3QkQsQ0FBZ0MsMEJBQVMsR0E2QnhDO0lBN0JZLGdDQUFVO0lBK0J2Qix1RUFBdUU7SUFDdkUsSUFBTSxrQkFBa0IsR0FBRyxzRUFBc0U7UUFDN0YsMkZBQTJGO1FBQzNGLHlGQUF5RjtRQUN6Rix1RkFBdUY7UUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIGJ1aWxkaWZpZXIgYWdhaW5zdCBiYXplbCByZWxhdGVkIGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQnVpbGRpZmllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG5hbWUgPSAnYnVpbGRpZmllcic7XG5cbiAgYmluYXJ5RmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICdub2RlX21vZHVsZXMvLmJpbi9idWlsZGlmaWVyJyk7XG5cbiAgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLmJ6bCcsICcqKi9CVUlMRC5iYXplbCcsICcqKi9XT1JLU1BBQ0UnLCAnKiovQlVJTEQnXTtcblxuICBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PXdhcm4gLS1tb2RlPWNoZWNrIC0tZm9ybWF0PWpzb25gLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDAgfHwgIUpTT04ucGFyc2Uoc3Rkb3V0KVsnc3VjY2VzcyddO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9Zml4IC0tbW9kZT1maXhgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBidWlsZGlmaWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIFRoZSB3YXJuaW5nIGZsYWcgZm9yIGJ1aWxkaWZpZXIgY29waWVkIGZyb20gYW5ndWxhci9hbmd1bGFyJ3MgdXNhZ2UuXG5jb25zdCBCQVpFTF9XQVJOSU5HX0ZMQUcgPSBgLS13YXJuaW5ncz1hdHRyLWNmZyxhdHRyLWxpY2Vuc2UsYXR0ci1ub24tZW1wdHksYXR0ci1vdXRwdXQtZGVmYXVsdCxgICtcbiAgICBgYXR0ci1zaW5nbGUtZmlsZSxjb25zdGFudC1nbG9iLGN0eC1hcmdzLGRlcHNldC1pdGVyYXRpb24sZGVwc2V0LXVuaW9uLGRpY3QtY29uY2F0ZW5hdGlvbixgICtcbiAgICBgZHVwbGljYXRlZC1uYW1lLGZpbGV0eXBlLGdpdC1yZXBvc2l0b3J5LGh0dHAtYXJjaGl2ZSxpbnRlZ2VyLWRpdmlzaW9uLGxvYWQsbG9hZC1vbi10b3AsYCArXG4gICAgYG5hdGl2ZS1idWlsZCxuYXRpdmUtcGFja2FnZSxvdXRwdXQtZ3JvdXAscGFja2FnZS1uYW1lLHBhY2thZ2Utb24tdG9wLHBvc2l0aW9uYWwtYXJncyxgICtcbiAgICBgcmVkZWZpbmVkLXZhcmlhYmxlLHJlcG9zaXRvcnktbmFtZSxzYW1lLW9yaWdpbi1sb2FkLHN0cmluZy1pdGVyYXRpb24sdW51c2VkLXZhcmlhYmxlYDtcbiJdfQ==