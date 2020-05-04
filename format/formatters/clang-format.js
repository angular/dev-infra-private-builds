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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhbmctZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXR0ZXJzL2NsYW5nLWZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBRWxELDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQWlDLHVDQUFTO1FBQTFDO1lBQUEscUVBNkJDO1lBNUJDLFVBQUksR0FBRyxjQUFjLENBQUM7WUFFdEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFFMUUsd0JBQWtCLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVyQyxhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSx5QkFBeUI7b0JBQ3ZDLFFBQVEsRUFDSixVQUFDLENBQVMsRUFBRSxJQUFZO3dCQUN0QixPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7b0JBQ3BCLENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBRSxnQkFBZ0I7b0JBQzlCLFFBQVEsRUFDSixVQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWM7d0JBQ3BELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFrQyxJQUFNLENBQUMsQ0FBQzs0QkFDeEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDdEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUNoQixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsa0JBQUM7SUFBRCxDQUFDLEFBN0JELENBQWlDLDBCQUFTLEdBNkJ6QztJQTdCWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgYWdhaW5zdCBUeXBlc2NyaXB0IGFuZCBKYXZhc2NyaXB0IGZpbGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGFuZ0Zvcm1hdCBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG5hbWUgPSAnY2xhbmctZm9ybWF0JztcblxuICBiaW5hcnlGaWxlUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJ25vZGVfbW9kdWxlcy8uYmluL2NsYW5nLWZvcm1hdCcpO1xuXG4gIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLVdlcnJvciAtbiAtc3R5bGU9ZmlsZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlICE9PSAwO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgICBmb3JtYXQ6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYC1pIC1zdHlsZT1maWxlYCxcbiAgICAgIGNhbGxiYWNrOlxuICAgICAgICAgIChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgXzogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgcnVubmluZyBjbGFuZy1mb3JtYXQgb246ICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICB9XG4gIH07XG59XG4iXX0=