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
        define("@angular/dev-infra-private/format/formatters/base-formatter", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Formatter = void 0;
    /**
     * The base class for formatters to run against provided files.
     */
    var Formatter = /** @class */ (function () {
        function Formatter(config) {
            this.config = config;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvYmFzZS1mb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBZ0JIOztPQUVHO0lBQ0g7UUFxQkUsbUJBQW9CLE1BQW9CO1lBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFBRyxDQUFDO1FBRTVDOzs7V0FHRztRQUNILDhCQUFVLEdBQVYsVUFBVyxNQUF1QjtZQUNoQyxRQUFRLE1BQU0sRUFBRTtnQkFDZCxLQUFLLE9BQU87b0JBQ1YsT0FBVSxJQUFJLENBQUMsY0FBYyxTQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQWMsQ0FBQztnQkFDckUsS0FBSyxRQUFRO29CQUNYLE9BQVUsSUFBSSxDQUFDLGNBQWMsU0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFjLENBQUM7Z0JBQ3RFO29CQUNFLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsK0JBQVcsR0FBWCxVQUFZLE1BQXVCO1lBQ2pDLFFBQVEsTUFBTSxFQUFFO2dCQUNkLEtBQUssT0FBTztvQkFDVixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDckMsS0FBSyxRQUFRO29CQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUN0QztvQkFDRSxNQUFNLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQztRQUVELCtEQUErRDtRQUMvRCw2QkFBUyxHQUFUO1lBQ0UsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELDBEQUEwRDtRQUMxRCxrQ0FBYyxHQUFkO1lBQ0UsT0FBTyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDcEUsQ0FBQztRQUVEOztXQUVHO1FBQ0ssNENBQXdCLEdBQWhDO1lBQ0UsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsSUFBSSxPQUFPLGVBQWUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDO1FBQ2xDLENBQUM7UUFDSCxnQkFBQztJQUFELENBQUMsQUF6RUQsSUF5RUM7SUF6RXFCLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Zvcm1hdENvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuLy8gQSBjYWxsYmFjayB0byBkZXRlcm1pbmUgaWYgdGhlIGZvcm1hdHRlciBydW4gZm91bmQgYSBmYWlsdXJlIGluIGZvcm1hdHRpbmcuXG5leHBvcnQgdHlwZSBDYWxsYmFja0Z1bmMgPSAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuLy8gVGhlIGFjdGlvbnMgYSBmb3JtYXR0ZXIgY2FuIHRha2UuXG5leHBvcnQgdHlwZSBGb3JtYXR0ZXJBY3Rpb24gPSAnY2hlY2snfCdmb3JtYXQnO1xuXG4vLyBUaGUgbWV0YWRhdGEgbmVlZGVkIGZvciBydW5uaW5nIG9uZSBvZiB0aGUgYEZvcm1hdHRlckFjdGlvbmBzIG9uIGEgZmlsZS5cbmludGVyZmFjZSBGb3JtYXR0ZXJBY3Rpb25NZXRhZGF0YSB7XG4gIGNvbW1hbmRGbGFnczogc3RyaW5nO1xuICBjYWxsYmFjazogQ2FsbGJhY2tGdW5jO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBmb3JtYXR0ZXJzIHRvIHJ1biBhZ2FpbnN0IHByb3ZpZGVkIGZpbGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRm9ybWF0dGVyIHtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBmb3JtYXR0ZXIsIHRoaXMgaXMgdXNlZCBmb3IgaWRlbnRpZmljYXRpb24gaW4gbG9nZ2luZyBhbmQgZm9yIGVuYWJsaW5nIGFuZFxuICAgKiBjb25maWd1cmluZyB0aGUgZm9ybWF0dGVyIGluIHRoZSBjb25maWcuXG4gICAqL1xuICBhYnN0cmFjdCBuYW1lOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBmdWxsIHBhdGggZmlsZSBsb2NhdGlvbiBvZiB0aGUgZm9ybWF0dGVyIGJpbmFyeS4gKi9cbiAgYWJzdHJhY3QgYmluYXJ5RmlsZVBhdGg6IHN0cmluZztcblxuICAvKiogTWV0YWRhdGEgZm9yIGVhY2ggYEZvcm1hdHRlckFjdGlvbmAgYXZhaWxhYmxlIHRvIHRoZSBmb3JtYXR0ZXIuICovXG4gIGFic3RyYWN0IGFjdGlvbnM6IHtcbiAgICAvLyBBbiBhY3Rpb24gcGVyZm9ybWluZyBhIGNoZWNrIG9mIGZvcm1hdCB3aXRob3V0IG1ha2luZyBhbnkgY2hhbmdlcy5cbiAgICBjaGVjazogRm9ybWF0dGVyQWN0aW9uTWV0YWRhdGE7XG4gICAgLy8gQW4gYWN0aW9uIHRvIGZvcm1hdCBmaWxlcyBpbiBwbGFjZS5cbiAgICBmb3JtYXQ6IEZvcm1hdHRlckFjdGlvbk1ldGFkYXRhO1xuICB9O1xuXG4gIC8qKiBUaGUgZGVmYXVsdCBtYXRjaGVycyBmb3IgdGhlIGZvcm1hdHRlciBmb3IgZmlsdGVyaW5nIGZpbGVzIHRvIGJlIGZvcm1hdHRlZC4gKi9cbiAgYWJzdHJhY3QgZGVmYXVsdEZpbGVNYXRjaGVyOiBzdHJpbmdbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZzogRm9ybWF0Q29uZmlnKSB7fVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgY29tbWFuZCB0byBleGVjdXRlIHRoZSBwcm92aWRlZCBhY3Rpb24sIGluY2x1ZGluZyBib3RoIHRoZSBiaW5hcnlcbiAgICogYW5kIGNvbW1hbmQgbGluZSBmbGFncy5cbiAgICovXG4gIGNvbW1hbmRGb3IoYWN0aW9uOiBGb3JtYXR0ZXJBY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICByZXR1cm4gYCR7dGhpcy5iaW5hcnlGaWxlUGF0aH0gJHt0aGlzLmFjdGlvbnMuY2hlY2suY29tbWFuZEZsYWdzfWA7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICByZXR1cm4gYCR7dGhpcy5iaW5hcnlGaWxlUGF0aH0gJHt0aGlzLmFjdGlvbnMuZm9ybWF0LmNvbW1hbmRGbGFnc31gO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gYWN0aW9uIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGNhbGxiYWNrIGZvciB0aGUgcHJvdmlkZWQgYWN0aW9uIHRvIGRldGVybWluZSBpZiBhbiBhY3Rpb25cbiAgICogZmFpbGVkIGluIGZvcm1hdHRpbmcuXG4gICAqL1xuICBjYWxsYmFja0ZvcihhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdjaGVjayc6XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGlvbnMuY2hlY2suY2FsbGJhY2s7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25zLmZvcm1hdC5jYWxsYmFjaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKCdVbmtub3duIGFjdGlvbiB0eXBlJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGZvcm1hdHRlciBpcyBlbmFibGVkIGluIHRoZSBwcm92aWRlZCBjb25maWcuICovXG4gIGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLmNvbmZpZ1t0aGlzLm5hbWVdO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSBhY3RpdmUgZmlsZSBtYXRjaGVyIGZvciB0aGUgZm9ybWF0dGVyLiAqL1xuICBnZXRGaWxlTWF0Y2hlcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaWxlTWF0Y2hlckZyb21Db25maWcoKSB8fCB0aGlzLmRlZmF1bHRGaWxlTWF0Y2hlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGZpbGUgbWF0Y2hlciBmcm9tIHRoZSBjb25maWcgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yIGlmIHByb3ZpZGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRGaWxlTWF0Y2hlckZyb21Db25maWcoKTogc3RyaW5nW118dW5kZWZpbmVkIHtcbiAgICBjb25zdCBmb3JtYXR0ZXJDb25maWcgPSB0aGlzLmNvbmZpZ1t0aGlzLm5hbWVdO1xuICAgIGlmICh0eXBlb2YgZm9ybWF0dGVyQ29uZmlnID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZXJDb25maWcubWF0Y2hlcnM7XG4gIH1cbn1cbiJdfQ==