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
        define("@angular/dev-infra-private/format/formatters/base-formatter", ["require", "exports", "@angular/dev-infra-private/utils/git/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Formatter = void 0;
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    /**
     * The base class for formatters to run against provided files.
     */
    var Formatter = /** @class */ (function () {
        function Formatter(config) {
            this.config = config;
            this.git = index_1.GitClient.getInstance();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvYmFzZS1mb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQWdEO0lBZWhEOztPQUVHO0lBQ0g7UUFzQkUsbUJBQW9CLE1BQW9CO1lBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7WUFyQjlCLFFBQUcsR0FBRyxpQkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBcUJHLENBQUM7UUFFNUM7OztXQUdHO1FBQ0gsOEJBQVUsR0FBVixVQUFXLE1BQXVCO1lBQ2hDLFFBQVEsTUFBTSxFQUFFO2dCQUNkLEtBQUssT0FBTztvQkFDVixPQUFVLElBQUksQ0FBQyxjQUFjLFNBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBYyxDQUFDO2dCQUNyRSxLQUFLLFFBQVE7b0JBQ1gsT0FBVSxJQUFJLENBQUMsY0FBYyxTQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQWMsQ0FBQztnQkFDdEU7b0JBQ0UsTUFBTSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN0QztRQUNILENBQUM7UUFFRDs7O1dBR0c7UUFDSCwrQkFBVyxHQUFYLFVBQVksTUFBdUI7WUFDakMsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxPQUFPO29CQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO2dCQUNyQyxLQUFLLFFBQVE7b0JBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3RDO29CQUNFLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDO1FBRUQsK0RBQStEO1FBQy9ELDZCQUFTLEdBQVQ7WUFDRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsMERBQTBEO1FBQzFELGtDQUFjLEdBQWQ7WUFDRSxPQUFPLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNwRSxDQUFDO1FBRUQ7O1dBRUc7UUFDSyw0Q0FBd0IsR0FBaEM7WUFDRSxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxJQUFJLE9BQU8sZUFBZSxLQUFLLFNBQVMsRUFBRTtnQkFDeEMsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFDRCxPQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQTFFRCxJQTBFQztJQTFFcUIsOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0Zvcm1hdENvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuLy8gQSBjYWxsYmFjayB0byBkZXRlcm1pbmUgaWYgdGhlIGZvcm1hdHRlciBydW4gZm91bmQgYSBmYWlsdXJlIGluIGZvcm1hdHRpbmcuXG5leHBvcnQgdHlwZSBDYWxsYmFja0Z1bmMgPSAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuLy8gVGhlIGFjdGlvbnMgYSBmb3JtYXR0ZXIgY2FuIHRha2UuXG5leHBvcnQgdHlwZSBGb3JtYXR0ZXJBY3Rpb24gPSAnY2hlY2snfCdmb3JtYXQnO1xuXG4vLyBUaGUgbWV0YWRhdGEgbmVlZGVkIGZvciBydW5uaW5nIG9uZSBvZiB0aGUgYEZvcm1hdHRlckFjdGlvbmBzIG9uIGEgZmlsZS5cbmludGVyZmFjZSBGb3JtYXR0ZXJBY3Rpb25NZXRhZGF0YSB7XG4gIGNvbW1hbmRGbGFnczogc3RyaW5nO1xuICBjYWxsYmFjazogQ2FsbGJhY2tGdW5jO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBmb3JtYXR0ZXJzIHRvIHJ1biBhZ2FpbnN0IHByb3ZpZGVkIGZpbGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRm9ybWF0dGVyIHtcbiAgcHJvdGVjdGVkIGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGZvcm1hdHRlciwgdGhpcyBpcyB1c2VkIGZvciBpZGVudGlmaWNhdGlvbiBpbiBsb2dnaW5nIGFuZCBmb3IgZW5hYmxpbmcgYW5kXG4gICAqIGNvbmZpZ3VyaW5nIHRoZSBmb3JtYXR0ZXIgaW4gdGhlIGNvbmZpZy5cbiAgICovXG4gIGFic3RyYWN0IG5hbWU6IHN0cmluZztcblxuICAvKiogVGhlIGZ1bGwgcGF0aCBmaWxlIGxvY2F0aW9uIG9mIHRoZSBmb3JtYXR0ZXIgYmluYXJ5LiAqL1xuICBhYnN0cmFjdCBiaW5hcnlGaWxlUGF0aDogc3RyaW5nO1xuXG4gIC8qKiBNZXRhZGF0YSBmb3IgZWFjaCBgRm9ybWF0dGVyQWN0aW9uYCBhdmFpbGFibGUgdG8gdGhlIGZvcm1hdHRlci4gKi9cbiAgYWJzdHJhY3QgYWN0aW9uczoge1xuICAgIC8vIEFuIGFjdGlvbiBwZXJmb3JtaW5nIGEgY2hlY2sgb2YgZm9ybWF0IHdpdGhvdXQgbWFraW5nIGFueSBjaGFuZ2VzLlxuICAgIGNoZWNrOiBGb3JtYXR0ZXJBY3Rpb25NZXRhZGF0YTtcbiAgICAvLyBBbiBhY3Rpb24gdG8gZm9ybWF0IGZpbGVzIGluIHBsYWNlLlxuICAgIGZvcm1hdDogRm9ybWF0dGVyQWN0aW9uTWV0YWRhdGE7XG4gIH07XG5cbiAgLyoqIFRoZSBkZWZhdWx0IG1hdGNoZXJzIGZvciB0aGUgZm9ybWF0dGVyIGZvciBmaWx0ZXJpbmcgZmlsZXMgdG8gYmUgZm9ybWF0dGVkLiAqL1xuICBhYnN0cmFjdCBkZWZhdWx0RmlsZU1hdGNoZXI6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlnOiBGb3JtYXRDb25maWcpIHt9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBjb21tYW5kIHRvIGV4ZWN1dGUgdGhlIHByb3ZpZGVkIGFjdGlvbiwgaW5jbHVkaW5nIGJvdGggdGhlIGJpbmFyeVxuICAgKiBhbmQgY29tbWFuZCBsaW5lIGZsYWdzLlxuICAgKi9cbiAgY29tbWFuZEZvcihhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdjaGVjayc6XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmJpbmFyeUZpbGVQYXRofSAke3RoaXMuYWN0aW9ucy5jaGVjay5jb21tYW5kRmxhZ3N9YDtcbiAgICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmJpbmFyeUZpbGVQYXRofSAke3RoaXMuYWN0aW9ucy5mb3JtYXQuY29tbWFuZEZsYWdzfWA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcignVW5rbm93biBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgY2FsbGJhY2sgZm9yIHRoZSBwcm92aWRlZCBhY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGFuIGFjdGlvblxuICAgKiBmYWlsZWQgaW4gZm9ybWF0dGluZy5cbiAgICovXG4gIGNhbGxiYWNrRm9yKGFjdGlvbjogRm9ybWF0dGVyQWN0aW9uKSB7XG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9ucy5jaGVjay5jYWxsYmFjaztcbiAgICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGlvbnMuZm9ybWF0LmNhbGxiYWNrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gYWN0aW9uIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZm9ybWF0dGVyIGlzIGVuYWJsZWQgaW4gdGhlIHByb3ZpZGVkIGNvbmZpZy4gKi9cbiAgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuY29uZmlnW3RoaXMubmFtZV07XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIGFjdGl2ZSBmaWxlIG1hdGNoZXIgZm9yIHRoZSBmb3JtYXR0ZXIuICovXG4gIGdldEZpbGVNYXRjaGVyKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpbGVNYXRjaGVyRnJvbUNvbmZpZygpIHx8IHRoaXMuZGVmYXVsdEZpbGVNYXRjaGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZmlsZSBtYXRjaGVyIGZyb20gdGhlIGNvbmZpZyBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IgaWYgcHJvdmlkZWQuXG4gICAqL1xuICBwcml2YXRlIGdldEZpbGVNYXRjaGVyRnJvbUNvbmZpZygpOiBzdHJpbmdbXXx1bmRlZmluZWQge1xuICAgIGNvbnN0IGZvcm1hdHRlckNvbmZpZyA9IHRoaXMuY29uZmlnW3RoaXMubmFtZV07XG4gICAgaWYgKHR5cGVvZiBmb3JtYXR0ZXJDb25maWcgPT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlckNvbmZpZy5tYXRjaGVycztcbiAgfVxufVxuIl19