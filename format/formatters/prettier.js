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
        define("@angular/dev-infra-private/format/formatters/prettier", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Prettier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
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
            _this.configPath = _this.config['prettier'] ?
                child_process_1.spawnSync(_this.binaryFilePath, ['--find-config-path', '.']).stdout.trim() :
                '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldHRpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvcHJldHRpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUUxQixnRkFBb0Q7SUFDcEQsb0VBQTBDO0lBRTFDLDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQThCLG9DQUFTO1FBQXZDO1lBQUEscUVBcUNDO1lBcENVLFVBQUksR0FBRyxVQUFVLENBQUM7WUFFbEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUV0RSx3QkFBa0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTlDOzs7ZUFHRztZQUNLLGdCQUFVLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyx5QkFBUyxDQUFDLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRSxFQUFFLENBQUM7WUFFRSxhQUFPLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsY0FBWSxLQUFJLENBQUMsVUFBVSxhQUFVO29CQUNuRCxRQUFRLEVBQ0osVUFBQyxDQUFTLEVBQUUsSUFBMkIsRUFBRSxNQUFjO3dCQUNyRCxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7b0JBQ3BCLENBQUM7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBRSxjQUFZLEtBQUksQ0FBQyxVQUFVLGFBQVU7b0JBQ25ELFFBQVEsRUFDSixVQUFDLElBQVksRUFBRSxJQUEyQixFQUFFLENBQVMsRUFBRSxNQUFjO3dCQUNuRSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7NEJBQ2QsZUFBSyxDQUFDLGdDQUE4QixJQUFNLENBQUMsQ0FBQzs0QkFDNUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNkLGVBQUssRUFBRSxDQUFDOzRCQUNSLE9BQU8sSUFBSSxDQUFDO3lCQUNiO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUM7aUJBQ047YUFDRixDQUFDOztRQUNKLENBQUM7UUFBRCxlQUFDO0lBQUQsQ0FBQyxBQXJDRCxDQUE4QiwwQkFBUyxHQXFDdEM7SUFyQ1ksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtzcGF3blN5bmN9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgcHJldHRpZXIgYWdhaW5zdCBUeXBlc2NyaXB0IGFuZCBKYXZhc2NyaXB0IGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgUHJldHRpZXIgZXh0ZW5kcyBGb3JtYXR0ZXIge1xuICBvdmVycmlkZSBuYW1lID0gJ3ByZXR0aWVyJztcblxuICBvdmVycmlkZSBiaW5hcnlGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgJ25vZGVfbW9kdWxlcy8uYmluL3ByZXR0aWVyJyk7XG5cbiAgb3ZlcnJpZGUgZGVmYXVsdEZpbGVNYXRjaGVyID0gWycqKi8qLnt0LGp9cyddO1xuXG4gIC8qKlxuICAgKiBUaGUgY29uZmlndXJhdGlvbiBwYXRoIG9mIHRoZSBwcmV0dGllciBjb25maWcsIG9idGFpbmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gdG8gcHJldmVudCBuZWVkaW5nXG4gICAqIHRvIGRpc2NvdmVyIGl0IHJlcGVhdGVkbHkgZm9yIGVhY2ggZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBjb25maWdQYXRoID0gdGhpcy5jb25maWdbJ3ByZXR0aWVyJ10gP1xuICAgICAgc3Bhd25TeW5jKHRoaXMuYmluYXJ5RmlsZVBhdGgsIFsnLS1maW5kLWNvbmZpZy1wYXRoJywgJy4nXSkuc3Rkb3V0LnRyaW0oKSA6XG4gICAgICAnJztcblxuICBvdmVycmlkZSBhY3Rpb25zID0ge1xuICAgIGNoZWNrOiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS1jaGVja2AsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXJ8Tm9kZUpTLlNpZ25hbHMsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMDtcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgZm9ybWF0OiB7XG4gICAgICBjb21tYW5kRmxhZ3M6IGAtLWNvbmZpZyAke3RoaXMuY29uZmlnUGF0aH0gLS13cml0ZWAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXJ8Tm9kZUpTLlNpZ25hbHMsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGVycm9yKGBFcnJvciBydW5uaW5nIHByZXR0aWVyIG9uOiAke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==