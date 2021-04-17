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
        define("@angular/dev-infra-private/utils/dry-run", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DryRunError = exports.isDryRun = exports.addDryRunFlag = void 0;
    var tslib_1 = require("tslib");
    /**
     * Add a --dry-run flag to the available options for the yargs argv object. When present, sets an
     * environment variable noting dry run mode.
     */
    function addDryRunFlag(args) {
        return args.option('dry-run', {
            type: 'boolean',
            default: false,
            description: 'Whether to do a dry run',
            coerce: function (dryRun) {
                if (dryRun) {
                    process.env['DRY_RUN'] = '1';
                }
                return dryRun;
            }
        });
    }
    exports.addDryRunFlag = addDryRunFlag;
    /** Whether the current environment is in dry run mode. */
    function isDryRun() {
        return process.env['DRY_RUN'] !== undefined;
    }
    exports.isDryRun = isDryRun;
    /** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
    var DryRunError = /** @class */ (function (_super) {
        tslib_1.__extends(DryRunError, _super);
        function DryRunError() {
            var _this = _super.call(this, 'Cannot call this function in dryRun mode.') || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
            // a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, DryRunError.prototype);
            return _this;
        }
        return DryRunError;
    }(Error));
    exports.DryRunError = DryRunError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJ5LXJ1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9kcnktcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSDs7O09BR0c7SUFDSCxTQUFnQixhQUFhLENBQUksSUFBYTtRQUM1QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBcUIsRUFBRTtZQUN4QyxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxLQUFLO1lBQ2QsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxNQUFNLEVBQUUsVUFBQyxNQUFlO2dCQUN0QixJQUFJLE1BQU0sRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztpQkFDOUI7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFaRCxzQ0FZQztJQUVELDBEQUEwRDtJQUMxRCxTQUFnQixRQUFRO1FBQ3RCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7SUFDOUMsQ0FBQztJQUZELDRCQUVDO0lBRUQsOEZBQThGO0lBQzlGO1FBQWlDLHVDQUFLO1FBQ3BDO1lBQUEsWUFDRSxrQkFBTSwyQ0FBMkMsQ0FBQyxTQUtuRDtZQUpDLHlGQUF5RjtZQUN6RixpQ0FBaUM7WUFDakMsaUhBQWlIO1lBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDckQsQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQVJELENBQWlDLEtBQUssR0FRckM7SUFSWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3Z9IGZyb20gJ3lhcmdzJztcblxuLyoqXG4gKiBBZGQgYSAtLWRyeS1ydW4gZmxhZyB0byB0aGUgYXZhaWxhYmxlIG9wdGlvbnMgZm9yIHRoZSB5YXJncyBhcmd2IG9iamVjdC4gV2hlbiBwcmVzZW50LCBzZXRzIGFuXG4gKiBlbnZpcm9ubWVudCB2YXJpYWJsZSBub3RpbmcgZHJ5IHJ1biBtb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRHJ5UnVuRmxhZzxUPihhcmdzOiBBcmd2PFQ+KSB7XG4gIHJldHVybiBhcmdzLm9wdGlvbignZHJ5LXJ1bicgYXMgJ2RyeVJ1bicsIHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIGRvIGEgZHJ5IHJ1bicsXG4gICAgY29lcmNlOiAoZHJ5UnVuOiBib29sZWFuKSA9PiB7XG4gICAgICBpZiAoZHJ5UnVuKSB7XG4gICAgICAgIHByb2Nlc3MuZW52WydEUllfUlVOJ10gPSAnMSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZHJ5UnVuO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGluIGRyeSBydW4gbW9kZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RyeVJ1bigpOiBib29sZWFuIHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52WydEUllfUlVOJ10gIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqIEVycm9yIHRvIGJlIHRocm93biB3aGVuIGEgZnVuY3Rpb24gb3IgbWV0aG9kIGlzIGNhbGxlZCBpbiBkcnlSdW4gbW9kZSBhbmQgc2hvdWxkbid0IGJlLiAqL1xuZXhwb3J0IGNsYXNzIERyeVJ1bkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignQ2Fubm90IGNhbGwgdGhpcyBmdW5jdGlvbiBpbiBkcnlSdW4gbW9kZS4nKTtcbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseSBsb3N0IGR1ZSB0b1xuICAgIC8vIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIERyeVJ1bkVycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cbiJdfQ==