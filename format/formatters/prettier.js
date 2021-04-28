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
        define("@angular/dev-infra-private/format/formatters/prettier", ["require", "exports", "tslib", "path", "shelljs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Prettier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    /**
     * Formatter for running prettier against Typescript and Javascript files.
     */
    var Prettier = /** @class */ (function (_super) {
        tslib_1.__extends(Prettier, _super);
        function Prettier() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'prettier';
            _this.binaryFilePath = path_1.join(_this.git.baseDir, 'node_modules/.bin/prettier');
            _this.defaultFileMatcher = ['**/*.{t,j}s'];
            /**
             * The configuration path of the prettier config, obtained during construction to prevent needing
             * to discover it repeatedly for each execution.
             */
            _this.configPath = _this.config['prettier'] ? shelljs_1.exec(_this.binaryFilePath + " --find-config-path .").trim() : '';
            _this.actions = {
                check: {
                    commandFlags: "--config " + _this.configPath + " --check",
                    callback: function (_, code, stdout) {
                        return code !== 0;
                    },
                },
                format: {
                    commandFlags: "--config " + _this.configPath + " --write",
                    callback: function (file, code, _, stderr) {
                        if (code !== 0) {
                            console_1.error("Error running prettier on: " + file);
                            console_1.error(stderr);
                            console_1.error();
                            return true;
                        }
                        return false;
                    },
                },
            };
            return _this;
        }
        return Prettier;
    }(base_formatter_1.Formatter));
    exports.Prettier = Prettier;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixtQ0FBNkI7SUFFN0Isb0VBQTBDO0lBRTFDLDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQThCLG9DQUFTO1FBQXZDO1lBQUEscUVBb0NDO1lBbkNDLFVBQUksR0FBRyxVQUFVLENBQUM7WUFFbEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUV0RSx3QkFBa0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXJDOzs7ZUFHRztZQUNLLGdCQUFVLEdBQ2QsS0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBSSxDQUFJLEtBQUksQ0FBQyxjQUFjLDBCQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUU5RixhQUFPLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSxjQUFZLEtBQUksQ0FBQyxVQUFVLGFBQVU7b0JBQ25ELFFBQVEsRUFDSixVQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsTUFBYzt3QkFDdEMsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO29CQUNwQixDQUFDO2lCQUNOO2dCQUNELE1BQU0sRUFBRTtvQkFDTixZQUFZLEVBQUUsY0FBWSxLQUFJLENBQUMsVUFBVSxhQUFVO29CQUNuRCxRQUFRLEVBQ0osVUFBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNwRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsZUFBSyxDQUFDLGdDQUE4QixJQUFNLENBQUMsQ0FBQzs0QkFDNUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNkLGVBQUssRUFBRSxDQUFDOzRCQUNSLE9BQU8sSUFBSSxDQUFDO3lCQUNiO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUM7aUJBQ047YUFDRixDQUFDOztRQUNKLENBQUM7UUFBRCxlQUFDO0lBQUQsQ0FBQyxBQXBDRCxDQUE4QiwwQkFBUyxHQW9DdEM7SUFwQ1ksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlcn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG5cbi8qKlxuICogRm9ybWF0dGVyIGZvciBydW5uaW5nIHByZXR0aWVyIGFnYWluc3QgVHlwZXNjcmlwdCBhbmQgSmF2YXNjcmlwdCBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFByZXR0aWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgbmFtZSA9ICdwcmV0dGllcic7XG5cbiAgYmluYXJ5RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICdub2RlX21vZHVsZXMvLmJpbi9wcmV0dGllcicpO1xuXG4gIGRlZmF1bHRGaWxlTWF0Y2hlciA9IFsnKiovKi57dCxqfXMnXTtcblxuICAvKipcbiAgICogVGhlIGNvbmZpZ3VyYXRpb24gcGF0aCBvZiB0aGUgcHJldHRpZXIgY29uZmlnLCBvYnRhaW5lZCBkdXJpbmcgY29uc3RydWN0aW9uIHRvIHByZXZlbnQgbmVlZGluZ1xuICAgKiB0byBkaXNjb3ZlciBpdCByZXBlYXRlZGx5IGZvciBlYWNoIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgY29uZmlnUGF0aCA9XG4gICAgICB0aGlzLmNvbmZpZ1sncHJldHRpZXInXSA/IGV4ZWMoYCR7dGhpcy5iaW5hcnlGaWxlUGF0aH0gLS1maW5kLWNvbmZpZy1wYXRoIC5gKS50cmltKCkgOiAnJztcblxuICBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS1jaGVja2AsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS13cml0ZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIHByZXR0aWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==