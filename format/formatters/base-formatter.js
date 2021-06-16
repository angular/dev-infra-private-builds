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
        define("@angular/dev-infra-private/format/formatters/base-formatter", ["require", "exports", "@angular/dev-infra-private/utils/git/git-client"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Formatter = void 0;
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    /**
     * The base class for formatters to run against provided files.
     */
    var Formatter = /** @class */ (function () {
        function Formatter(config) {
            this.config = config;
            this.git = git_client_1.GitClient.get();
        }
        /**
         * Retrieve the command to execute the provided action, including both the binary
         * and command line flags.
         */
        Formatter.prototype.commandFor = function (action) {
            switch (action) {
                case 'check':
                    return this.binaryFilePath + " " + this.actions.check.commandFlags;
                case 'format':
                    return this.binaryFilePath + " " + this.actions.format.commandFlags;
                default:
                    throw Error('Unknown action type');
            }
        };
        /**
         * Retrieve the callback for the provided action to determine if an action
         * failed in formatting.
         */
        Formatter.prototype.callbackFor = function (action) {
            switch (action) {
                case 'check':
                    return this.actions.check.callback;
                case 'format':
                    return this.actions.format.callback;
                default:
                    throw Error('Unknown action type');
            }
        };
        /** Whether the formatter is enabled in the provided config. */
        Formatter.prototype.isEnabled = function () {
            return !!this.config[this.name];
        };
        /** Retrieve the active file matcher for the formatter. */
        Formatter.prototype.getFileMatcher = function () {
            return this.getFileMatcherFromConfig() || this.defaultFileMatcher;
        };
        /**
         * Retrieves the file matcher from the config provided to the constructor if provided.
         */
        Formatter.prototype.getFileMatcherFromConfig = function () {
            var formatterConfig = this.config[this.name];
            if (typeof formatterConfig === 'boolean') {
                return undefined;
            }
            return formatterConfig.matchers;
        };
        return Formatter;
    }());
    exports.Formatter = Formatter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvYmFzZS1mb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOEVBQXFEO0lBZXJEOztPQUVHO0lBQ0g7UUFzQkUsbUJBQXNCLE1BQW9CO1lBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7WUFyQmhDLFFBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBcUJhLENBQUM7UUFFOUM7OztXQUdHO1FBQ0gsOEJBQVUsR0FBVixVQUFXLE1BQXVCO1lBQ2hDLFFBQVEsTUFBTSxFQUFFO2dCQUNkLEtBQUssT0FBTztvQkFDVixPQUFVLElBQUksQ0FBQyxjQUFjLFNBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBYyxDQUFDO2dCQUNyRSxLQUFLLFFBQVE7b0JBQ1gsT0FBVSxJQUFJLENBQUMsY0FBYyxTQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQWMsQ0FBQztnQkFDdEU7b0JBQ0UsTUFBTSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN0QztRQUNILENBQUM7UUFFRDs7O1dBR0c7UUFDSCwrQkFBVyxHQUFYLFVBQVksTUFBdUI7WUFDakMsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxPQUFPO29CQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO2dCQUNyQyxLQUFLLFFBQVE7b0JBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3RDO29CQUNFLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDO1FBRUQsK0RBQStEO1FBQy9ELDZCQUFTLEdBQVQ7WUFDRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsMERBQTBEO1FBQzFELGtDQUFjLEdBQWQ7WUFDRSxPQUFPLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNwRSxDQUFDO1FBRUQ7O1dBRUc7UUFDSyw0Q0FBd0IsR0FBaEM7WUFDRSxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxJQUFJLE9BQU8sZUFBZSxLQUFLLFNBQVMsRUFBRTtnQkFDeEMsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFDRCxPQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQTFFRCxJQTBFQztJQTFFcUIsOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7Rm9ybWF0Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG4vLyBBIGNhbGxiYWNrIHRvIGRldGVybWluZSBpZiB0aGUgZm9ybWF0dGVyIHJ1biBmb3VuZCBhIGZhaWx1cmUgaW4gZm9ybWF0dGluZy5cbmV4cG9ydCB0eXBlIENhbGxiYWNrRnVuYyA9IChmaWxlOiBzdHJpbmcsIGNvZGU6IG51bWJlciwgc3Rkb3V0OiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4vLyBUaGUgYWN0aW9ucyBhIGZvcm1hdHRlciBjYW4gdGFrZS5cbmV4cG9ydCB0eXBlIEZvcm1hdHRlckFjdGlvbiA9ICdjaGVjayd8J2Zvcm1hdCc7XG5cbi8vIFRoZSBtZXRhZGF0YSBuZWVkZWQgZm9yIHJ1bm5pbmcgb25lIG9mIHRoZSBgRm9ybWF0dGVyQWN0aW9uYHMgb24gYSBmaWxlLlxuaW50ZXJmYWNlIEZvcm1hdHRlckFjdGlvbk1ldGFkYXRhIHtcbiAgY29tbWFuZEZsYWdzOiBzdHJpbmc7XG4gIGNhbGxiYWNrOiBDYWxsYmFja0Z1bmM7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgY2xhc3MgZm9yIGZvcm1hdHRlcnMgdG8gcnVuIGFnYWluc3QgcHJvdmlkZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGb3JtYXR0ZXIge1xuICBwcm90ZWN0ZWQgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGZvcm1hdHRlciwgdGhpcyBpcyB1c2VkIGZvciBpZGVudGlmaWNhdGlvbiBpbiBsb2dnaW5nIGFuZCBmb3IgZW5hYmxpbmcgYW5kXG4gICAqIGNvbmZpZ3VyaW5nIHRoZSBmb3JtYXR0ZXIgaW4gdGhlIGNvbmZpZy5cbiAgICovXG4gIGFic3RyYWN0IG5hbWU6IHN0cmluZztcblxuICAvKiogVGhlIGZ1bGwgcGF0aCBmaWxlIGxvY2F0aW9uIG9mIHRoZSBmb3JtYXR0ZXIgYmluYXJ5LiAqL1xuICBhYnN0cmFjdCBiaW5hcnlGaWxlUGF0aDogc3RyaW5nO1xuXG4gIC8qKiBNZXRhZGF0YSBmb3IgZWFjaCBgRm9ybWF0dGVyQWN0aW9uYCBhdmFpbGFibGUgdG8gdGhlIGZvcm1hdHRlci4gKi9cbiAgYWJzdHJhY3QgYWN0aW9uczoge1xuICAgIC8vIEFuIGFjdGlvbiBwZXJmb3JtaW5nIGEgY2hlY2sgb2YgZm9ybWF0IHdpdGhvdXQgbWFraW5nIGFueSBjaGFuZ2VzLlxuICAgIGNoZWNrOiBGb3JtYXR0ZXJBY3Rpb25NZXRhZGF0YTtcbiAgICAvLyBBbiBhY3Rpb24gdG8gZm9ybWF0IGZpbGVzIGluIHBsYWNlLlxuICAgIGZvcm1hdDogRm9ybWF0dGVyQWN0aW9uTWV0YWRhdGE7XG4gIH07XG5cbiAgLyoqIFRoZSBkZWZhdWx0IG1hdGNoZXJzIGZvciB0aGUgZm9ybWF0dGVyIGZvciBmaWx0ZXJpbmcgZmlsZXMgdG8gYmUgZm9ybWF0dGVkLiAqL1xuICBhYnN0cmFjdCBkZWZhdWx0RmlsZU1hdGNoZXI6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBjb25maWc6IEZvcm1hdENvbmZpZykge31cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGNvbW1hbmQgdG8gZXhlY3V0ZSB0aGUgcHJvdmlkZWQgYWN0aW9uLCBpbmNsdWRpbmcgYm90aCB0aGUgYmluYXJ5XG4gICAqIGFuZCBjb21tYW5kIGxpbmUgZmxhZ3MuXG4gICAqL1xuICBjb21tYW5kRm9yKGFjdGlvbjogRm9ybWF0dGVyQWN0aW9uKSB7XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuYmluYXJ5RmlsZVBhdGh9ICR7dGhpcy5hY3Rpb25zLmNoZWNrLmNvbW1hbmRGbGFnc31gO1xuICAgICAgY2FzZSAnZm9ybWF0JzpcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuYmluYXJ5RmlsZVBhdGh9ICR7dGhpcy5hY3Rpb25zLmZvcm1hdC5jb21tYW5kRmxhZ3N9YDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKCdVbmtub3duIGFjdGlvbiB0eXBlJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBjYWxsYmFjayBmb3IgdGhlIHByb3ZpZGVkIGFjdGlvbiB0byBkZXRlcm1pbmUgaWYgYW4gYWN0aW9uXG4gICAqIGZhaWxlZCBpbiBmb3JtYXR0aW5nLlxuICAgKi9cbiAgY2FsbGJhY2tGb3IoYWN0aW9uOiBGb3JtYXR0ZXJBY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25zLmNoZWNrLmNhbGxiYWNrO1xuICAgICAgY2FzZSAnZm9ybWF0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9ucy5mb3JtYXQuY2FsbGJhY2s7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcignVW5rbm93biBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBmb3JtYXR0ZXIgaXMgZW5hYmxlZCBpbiB0aGUgcHJvdmlkZWQgY29uZmlnLiAqL1xuICBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5jb25maWdbdGhpcy5uYW1lXTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgYWN0aXZlIGZpbGUgbWF0Y2hlciBmb3IgdGhlIGZvcm1hdHRlci4gKi9cbiAgZ2V0RmlsZU1hdGNoZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmlsZU1hdGNoZXJGcm9tQ29uZmlnKCkgfHwgdGhpcy5kZWZhdWx0RmlsZU1hdGNoZXI7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBmaWxlIG1hdGNoZXIgZnJvbSB0aGUgY29uZmlnIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciBpZiBwcm92aWRlZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0RmlsZU1hdGNoZXJGcm9tQ29uZmlnKCk6IHN0cmluZ1tdfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZm9ybWF0dGVyQ29uZmlnID0gdGhpcy5jb25maWdbdGhpcy5uYW1lXTtcbiAgICBpZiAodHlwZW9mIGZvcm1hdHRlckNvbmZpZyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVyQ29uZmlnLm1hdGNoZXJzO1xuICB9XG59XG4iXX0=