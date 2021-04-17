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
        define("@angular/dev-infra-private/format/formatters/buildifier", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Buildifier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
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
            _this.binaryFilePath = path_1.join(_this.git.baseDir, 'node_modules/.bin/buildifier');
            _this.defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
            _this.actions = {
                check: {
                    commandFlags: BAZEL_WARNING_FLAG + " --lint=warn --mode=check --format=json",
                    callback: function (_, code, stdout) {
                        return code !== 0 || !JSON.parse(stdout).success;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsb0VBQTBDO0lBRTFDLDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQWdDLHNDQUFTO1FBQXpDO1lBQUEscUVBNkJDO1lBNUJDLFVBQUksR0FBRyxZQUFZLENBQUM7WUFFcEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsOEJBQThCLENBQUMsQ0FBQztZQUV4RSx3QkFBa0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFaEYsYUFBTyxHQUFHO2dCQUNSLEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUssa0JBQWtCLDRDQUF5QztvQkFDNUUsUUFBUSxFQUNKLFVBQUMsQ0FBUyxFQUFFLElBQVksRUFBRSxNQUFjO3dCQUN0QyxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBdUIsQ0FBQyxPQUFPLENBQUM7b0JBQzFFLENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBSyxrQkFBa0IsMkJBQXdCO29CQUMzRCxRQUFRLEVBQ0osVUFBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNwRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsZUFBSyxDQUFDLGtDQUFnQyxJQUFNLENBQUMsQ0FBQzs0QkFDOUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNkLGVBQUssRUFBRSxDQUFDOzRCQUNSLE9BQU8sSUFBSSxDQUFDO3lCQUNiO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUM7aUJBQ047YUFDRixDQUFDOztRQUNKLENBQUM7UUFBRCxpQkFBQztJQUFELENBQUMsQUE3QkQsQ0FBZ0MsMEJBQVMsR0E2QnhDO0lBN0JZLGdDQUFVO0lBK0J2Qix1RUFBdUU7SUFDdkUsSUFBTSxrQkFBa0IsR0FBRyxzRUFBc0U7UUFDN0YsMkZBQTJGO1FBQzNGLHlGQUF5RjtRQUN6Rix1RkFBdUY7UUFDdkYsc0ZBQXNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgYnVpbGRpZmllciBhZ2FpbnN0IGJhemVsIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGlmaWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgbmFtZSA9ICdidWlsZGlmaWVyJztcblxuICBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL2J1aWxkaWZpZXInKTtcblxuICBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyouYnpsJywgJyoqL0JVSUxELmJhemVsJywgJyoqL1dPUktTUEFDRScsICcqKi9CVUlMRCddO1xuXG4gIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9d2FybiAtLW1vZGU9Y2hlY2sgLS1mb3JtYXQ9anNvbmAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMCB8fCAhKEpTT04ucGFyc2Uoc3Rkb3V0KSBhcyB7c3VjY2Vzczogc3RyaW5nfSkuc3VjY2VzcztcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAke0JBWkVMX1dBUk5JTkdfRkxBR30gLS1saW50PWZpeCAtLW1vZGU9Zml4YCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgZXJyb3IoYEVycm9yIHJ1bm5pbmcgYnVpbGRpZmllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBUaGUgd2FybmluZyBmbGFnIGZvciBidWlsZGlmaWVyIGNvcGllZCBmcm9tIGFuZ3VsYXIvYW5ndWxhcidzIHVzYWdlLlxuY29uc3QgQkFaRUxfV0FSTklOR19GTEFHID0gYC0td2FybmluZ3M9YXR0ci1jZmcsYXR0ci1saWNlbnNlLGF0dHItbm9uLWVtcHR5LGF0dHItb3V0cHV0LWRlZmF1bHQsYCArXG4gICAgYGF0dHItc2luZ2xlLWZpbGUsY29uc3RhbnQtZ2xvYixjdHgtYXJncyxkZXBzZXQtaXRlcmF0aW9uLGRlcHNldC11bmlvbixkaWN0LWNvbmNhdGVuYXRpb24sYCArXG4gICAgYGR1cGxpY2F0ZWQtbmFtZSxmaWxldHlwZSxnaXQtcmVwb3NpdG9yeSxodHRwLWFyY2hpdmUsaW50ZWdlci1kaXZpc2lvbixsb2FkLGxvYWQtb24tdG9wLGAgK1xuICAgIGBuYXRpdmUtYnVpbGQsbmF0aXZlLXBhY2thZ2Usb3V0cHV0LWdyb3VwLHBhY2thZ2UtbmFtZSxwYWNrYWdlLW9uLXRvcCxwb3NpdGlvbmFsLWFyZ3MsYCArXG4gICAgYHJlZGVmaW5lZC12YXJpYWJsZSxyZXBvc2l0b3J5LW5hbWUsc2FtZS1vcmlnaW4tbG9hZCxzdHJpbmctaXRlcmF0aW9uLHVudXNlZC12YXJpYWJsZWA7XG4iXX0=