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
        define("@angular/dev-infra-private/format/formatters/clang-format", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClangFormat = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQTBCO0lBRTFCLGtFQUFrRDtJQUNsRCxvRUFBMEM7SUFFMUMsOEZBQTJDO0lBRTNDOztPQUVHO0lBQ0g7UUFBaUMsdUNBQVM7UUFBMUM7WUFBQSxxRUE2QkM7WUE1QkMsVUFBSSxHQUFHLGNBQWMsQ0FBQztZQUV0QixvQkFBYyxHQUFHLFdBQUksQ0FBQyx1QkFBYyxFQUFFLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUUxRSx3QkFBa0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXJDLGFBQU8sR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFFLHlCQUF5QjtvQkFDdkMsUUFBUSxFQUNKLFVBQUMsQ0FBUyxFQUFFLElBQVk7d0JBQ3RCLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztvQkFDcEIsQ0FBQztpQkFDTjtnQkFDRCxNQUFNLEVBQUU7b0JBQ04sWUFBWSxFQUFFLGdCQUFnQjtvQkFDOUIsUUFBUSxFQUNKLFVBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxDQUFTLEVBQUUsTUFBYzt3QkFDcEQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFOzRCQUNkLGVBQUssQ0FBQyxvQ0FBa0MsSUFBTSxDQUFDLENBQUM7NEJBQ2hELGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDZCxlQUFLLEVBQUUsQ0FBQzs0QkFDUixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsa0JBQUM7SUFBRCxDQUFDLEFBN0JELENBQWlDLDBCQUFTLEdBNkJ6QztJQTdCWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIGNsYW5nLWZvcm1hdCBhZ2FpbnN0IFR5cGVzY3JpcHQgYW5kIEphdmFzY3JpcHQgZmlsZXNcbiAqL1xuZXhwb3J0IGNsYXNzIENsYW5nRm9ybWF0IGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgbmFtZSA9ICdjbGFuZy1mb3JtYXQnO1xuXG4gIGJpbmFyeUZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnbm9kZV9tb2R1bGVzLy5iaW4vY2xhbmctZm9ybWF0Jyk7XG5cbiAgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLnt0LGp9cyddO1xuXG4gIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC0tV2Vycm9yIC1uIC1zdHlsZT1maWxlYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChfOiBzdHJpbmcsIGNvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDA7XG4gICAgICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLWkgLXN0eWxlPWZpbGVgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiJdfQ==