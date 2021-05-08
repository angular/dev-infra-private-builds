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
        define("@angular/dev-infra-private/format/formatters/clang-format", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClangFormat = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    /**
     * Formatter for running clang-format against Typescript and Javascript files
     */
    var ClangFormat = /** @class */ (function (_super) {
        tslib_1.__extends(ClangFormat, _super);
        function ClangFormat() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'clang-format';
            _this.binaryFilePath = path_1.join(_this.git.baseDir, 'node_modules/.bin/clang-format');
            _this.defaultFileMatcher = ['**/*.{t,j}s'];
            _this.actions = {
                check: {
                    commandFlags: "--Werror -n -style=file",
                    callback: function (_, code) {
                        return code !== 0;
                    },
                },
                format: {
                    commandFlags: "-i -style=file",
                    callback: function (file, code, _, stderr) {
                        if (code !== 0) {
                            console_1.error("Error running clang-format on: " + file);
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
        return ClangFormat;
    }(base_formatter_1.Formatter));
    exports.ClangFormat = ClangFormat;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQTBCO0lBRTFCLG9FQUEwQztJQUUxQyw4RkFBMkM7SUFFM0M7O09BRUc7SUFDSDtRQUFpQyx1Q0FBUztRQUExQztZQUFBLHFFQTZCQztZQTVCQyxVQUFJLEdBQUcsY0FBYyxDQUFDO1lBRXRCLG9CQUFjLEdBQUcsV0FBSSxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFFMUUsd0JBQWtCLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVyQyxhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSx5QkFBeUI7b0JBQ3ZDLFFBQVEsRUFDSixVQUFDLENBQVMsRUFBRSxJQUFZO3dCQUN0QixPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7b0JBQ3BCLENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBRSxnQkFBZ0I7b0JBQzlCLFFBQVEsRUFDSixVQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWM7d0JBQ3BELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDZCxlQUFLLENBQUMsb0NBQWtDLElBQU0sQ0FBQyxDQUFDOzRCQUNoRCxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2QsZUFBSyxFQUFFLENBQUM7NEJBQ1IsT0FBTyxJQUFJLENBQUM7eUJBQ2I7d0JBQ0QsT0FBTyxLQUFLLENBQUM7b0JBQ2YsQ0FBQztpQkFDTjthQUNGLENBQUM7O1FBQ0osQ0FBQztRQUFELGtCQUFDO0lBQUQsQ0FBQyxBQTdCRCxDQUFpQywwQkFBUyxHQTZCekM7SUE3Qlksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlc1xuICovXG5leHBvcnQgY2xhc3MgQ2xhbmdGb3JtYXQgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBuYW1lID0gJ2NsYW5nLWZvcm1hdCc7XG5cbiAgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9jbGFuZy1mb3JtYXQnKTtcblxuICBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue3Qsan1zJ107XG5cbiAgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1XZXJyb3IgLW4gLXN0eWxlPWZpbGVgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtaSAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIGNsYW5nLWZvcm1hdCBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgfVxuICB9O1xufVxuIl19