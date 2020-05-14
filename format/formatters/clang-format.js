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
        define("@angular/dev-infra-private/format/formatters/clang-format", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClangFormat = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    /**
     * Formatter for running clang-format against Typescript and Javascript files
     */
    var ClangFormat = /** @class */ (function (_super) {
        tslib_1.__extends(ClangFormat, _super);
        function ClangFormat() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'clang-format';
            _this.binaryFilePath = path_1.join(config_1.getRepoBaseDir(), 'node_modules/.bin/clang-format');
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
                            console.error("Error running clang-format on: " + file);
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
        return ClangFormat;
    }(base_formatter_1.Formatter));
    exports.ClangFormat = ClangFormat;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQTBCO0lBRTFCLGtFQUFrRDtJQUVsRCw4RkFBMkM7SUFFM0M7O09BRUc7SUFDSDtRQUFpQyx1Q0FBUztRQUExQztZQUFBLHFFQTZCQztZQTVCQyxVQUFJLEdBQUcsY0FBYyxDQUFDO1lBRXRCLG9CQUFjLEdBQUcsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBRTFFLHdCQUFrQixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFckMsYUFBTyxHQUFHO2dCQUNSLEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUseUJBQXlCO29CQUN2QyxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBWTt3QkFDdEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO29CQUNwQixDQUFDO2lCQUNOO2dCQUNELE1BQU0sRUFBRTtvQkFDTixZQUFZLEVBQUUsZ0JBQWdCO29CQUM5QixRQUFRLEVBQ0osVUFBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNwRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsSUFBTSxDQUFDLENBQUM7NEJBQ3hELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ3RCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDaEIsT0FBTyxJQUFJLENBQUM7eUJBQ2I7d0JBQ0QsT0FBTyxLQUFLLENBQUM7b0JBQ2YsQ0FBQztpQkFDTjthQUNGLENBQUM7O1FBQ0osQ0FBQztRQUFELGtCQUFDO0lBQUQsQ0FBQyxBQTdCRCxDQUFpQywwQkFBUyxHQTZCekM7SUE3Qlksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlc1xuICovXG5leHBvcnQgY2xhc3MgQ2xhbmdGb3JtYXQgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBuYW1lID0gJ2NsYW5nLWZvcm1hdCc7XG5cbiAgYmluYXJ5RmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICdub2RlX21vZHVsZXMvLmJpbi9jbGFuZy1mb3JtYXQnKTtcblxuICBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue3Qsan1zJ107XG5cbiAgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1XZXJyb3IgLW4gLXN0eWxlPWZpbGVgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtaSAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHJ1bm5pbmcgY2xhbmctZm9ybWF0IG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgfVxuICB9O1xufVxuIl19