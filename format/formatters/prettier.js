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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixtQ0FBNkI7SUFFN0Isb0VBQTBDO0lBRTFDLDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQThCLG9DQUFTO1FBQXZDO1lBQUEscUVBb0NDO1lBbkNVLFVBQUksR0FBRyxVQUFVLENBQUM7WUFFbEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUV0RSx3QkFBa0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTlDOzs7ZUFHRztZQUNLLGdCQUFVLEdBQ2QsS0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBSSxDQUFJLEtBQUksQ0FBQyxjQUFjLDBCQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVyRixhQUFPLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsY0FBWSxLQUFJLENBQUMsVUFBVSxhQUFVO29CQUNuRCxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWM7d0JBQ3RDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztvQkFDcEIsQ0FBQztpQkFDTjtnQkFDRCxNQUFNLEVBQUU7b0JBQ04sWUFBWSxFQUFFLGNBQVksS0FBSSxDQUFDLFVBQVUsYUFBVTtvQkFDbkQsUUFBUSxFQUNKLFVBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxDQUFTLEVBQUUsTUFBYzt3QkFDcEQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFOzRCQUNkLGVBQUssQ0FBQyxnQ0FBOEIsSUFBTSxDQUFDLENBQUM7NEJBQzVDLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDZCxlQUFLLEVBQUUsQ0FBQzs0QkFDUixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsZUFBQztJQUFELENBQUMsQUFwQ0QsQ0FBOEIsMEJBQVMsR0FvQ3RDO0lBcENZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXJ9IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuXG4vKipcbiAqIEZvcm1hdHRlciBmb3IgcnVubmluZyBwcmV0dGllciBhZ2FpbnN0IFR5cGVzY3JpcHQgYW5kIEphdmFzY3JpcHQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcmV0dGllciBleHRlbmRzIEZvcm1hdHRlciB7XG4gIG92ZXJyaWRlIG5hbWUgPSAncHJldHRpZXInO1xuXG4gIG92ZXJyaWRlIGJpbmFyeUZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnbm9kZV9tb2R1bGVzLy5iaW4vcHJldHRpZXInKTtcblxuICBvdmVycmlkZSBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyoue3Qsan1zJ107XG5cbiAgLyoqXG4gICAqIFRoZSBjb25maWd1cmF0aW9uIHBhdGggb2YgdGhlIHByZXR0aWVyIGNvbmZpZywgb2J0YWluZWQgZHVyaW5nIGNvbnN0cnVjdGlvbiB0byBwcmV2ZW50IG5lZWRpbmdcbiAgICogdG8gZGlzY292ZXIgaXQgcmVwZWF0ZWRseSBmb3IgZWFjaCBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGNvbmZpZ1BhdGggPVxuICAgICAgdGhpcy5jb25maWdbJ3ByZXR0aWVyJ10gPyBleGVjKGAke3RoaXMuYmluYXJ5RmlsZVBhdGh9IC0tZmluZC1jb25maWctcGF0aCAuYCkudHJpbSgpIDogJyc7XG5cbiAgb3ZlcnJpZGUgYWN0aW9ucyA9IHtcbiAgICBjaGVjazoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0tY2hlY2tgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKF86IHN0cmluZywgY29kZTogbnVtYmVyLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGUgIT09IDA7XG4gICAgICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgLS1jb25maWcgJHt0aGlzLmNvbmZpZ1BhdGh9IC0td3JpdGVgLFxuICAgICAgY2FsbGJhY2s6XG4gICAgICAgICAgKGZpbGU6IHN0cmluZywgY29kZTogbnVtYmVyLCBfOiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICBlcnJvcihgRXJyb3IgcnVubmluZyBwcmV0dGllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBlcnJvcihzdGRlcnIpO1xuICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iXX0=