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
        define("@angular/dev-infra-private/release/config", ["require", "exports", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getReleaseConfig = void 0;
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Retrieve and validate the config as `ReleaseConfig`. */
    function getReleaseConfig(config) {
        var _a, _b, _c;
        if (config === void 0) { config = config_1.getConfig(); }
        // List of errors encountered validating the config.
        var errors = [];
        if (config.release === undefined) {
            errors.push("No configuration defined for \"release\"");
        }
        if (((_a = config.release) === null || _a === void 0 ? void 0 : _a.npmPackages) === undefined) {
            errors.push("No \"npmPackages\" configured for releasing.");
        }
        if (((_b = config.release) === null || _b === void 0 ? void 0 : _b.buildPackages) === undefined) {
            errors.push("No \"buildPackages\" function configured for releasing.");
        }
        if (((_c = config.release) === null || _c === void 0 ? void 0 : _c.generateReleaseNotesForHead) === undefined) {
            errors.push("No \"generateReleaseNotesForHead\" function configured for releasing.");
        }
        config_1.assertNoErrors(errors);
        return config.release;
    }
    exports.getReleaseConfig = getReleaseConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9jb25maWcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsa0VBQTBFO0lBb0QxRSwyREFBMkQ7SUFDM0QsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBb0Q7O1FBQXBELHVCQUFBLEVBQUEsU0FBeUMsa0JBQVMsRUFBRTtRQUVuRixvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQywwQ0FBd0MsQ0FBQyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxPQUFBLE1BQU0sQ0FBQyxPQUFPLDBDQUFFLFdBQVcsTUFBSyxTQUFTLEVBQUU7WUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyw4Q0FBNEMsQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsSUFBSSxPQUFBLE1BQU0sQ0FBQyxPQUFPLDBDQUFFLGFBQWEsTUFBSyxTQUFTLEVBQUU7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyx5REFBdUQsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsSUFBSSxPQUFBLE1BQU0sQ0FBQyxPQUFPLDBDQUFFLDJCQUEyQixNQUFLLFNBQVMsRUFBRTtZQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLHVFQUFxRSxDQUFDLENBQUM7U0FDcEY7UUFFRCx1QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sTUFBTSxDQUFDLE9BQVEsQ0FBQztJQUN6QixDQUFDO0lBcEJELDRDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgYnVpbHQgcGFja2FnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbHRQYWNrYWdlIHtcbiAgLyoqIE5hbWUgb2YgdGhlIHBhY2thZ2UuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIFBhdGggdG8gdGhlIHBhY2thZ2Ugb3V0cHV0IGRpcmVjdG9yeS4gKi9cbiAgb3V0cHV0UGF0aDogc3RyaW5nO1xufVxuXG4vKiogQ29uZmlndXJhdGlvbiBmb3Igc3RhZ2luZyBhbmQgcHVibGlzaGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VDb25maWcge1xuICAvKiogUmVnaXN0cnkgVVJMIHVzZWQgZm9yIHB1Ymxpc2hpbmcgcmVsZWFzZSBwYWNrYWdlcy4gRGVmYXVsdHMgdG8gdGhlIE5QTSByZWdpc3RyeS4gKi9cbiAgcHVibGlzaFJlZ2lzdHJ5Pzogc3RyaW5nO1xuICAvKiogTGlzdCBvZiBOUE0gcGFja2FnZXMgdGhhdCBhcmUgcHVibGlzaGVkIGFzIHBhcnQgb2YgdGhpcyBwcm9qZWN0LiAqL1xuICBucG1QYWNrYWdlczogc3RyaW5nW107XG4gIC8qKiBCdWlsZHMgcmVsZWFzZSBwYWNrYWdlcyBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgcGF0aHMgcG9pbnRpbmcgdG8gdGhlIG91dHB1dC4gKi9cbiAgYnVpbGRQYWNrYWdlczogKCkgPT4gUHJvbWlzZTxCdWlsdFBhY2thZ2VbXXxudWxsPjtcbiAgLyoqIEdlbmVyYXRlcyB0aGUgcmVsZWFzZSBub3RlcyBmcm9tIHRoZSBtb3N0IHJlY2VudCB0YWcgdG8gYEhFQURgLiAqL1xuICBnZW5lcmF0ZVJlbGVhc2VOb3Rlc0ZvckhlYWQ6IChvdXRwdXRQYXRoOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG4gIC8qKlxuICAgKiBHZXRzIGEgcGF0dGVybiBmb3IgZXh0cmFjdGluZyB0aGUgcmVsZWFzZSBub3RlcyBvZiB0aGUgYSBnaXZlbiB2ZXJzaW9uLlxuICAgKiBAcmV0dXJucyBBIHBhdHRlcm4gbWF0Y2hpbmcgdGhlIG5vdGVzIGZvciBhIGdpdmVuIHZlcnNpb24gKGluY2x1ZGluZyB0aGUgaGVhZGVyKS5cbiAgICovXG4gIC8vIFRPRE86IFJlbW92ZSB0aGlzIGluIGZhdm9yIG9mIGEgY2Fub25pY2FsIGNoYW5nZWxvZyBmb3JtYXQgYWNyb3NzIHRoZSBBbmd1bGFyIG9yZ2FuaXphdGlvbi5cbiAgZXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4/OiAodmVyc2lvbjogc2VtdmVyLlNlbVZlcikgPT4gUmVnRXhwO1xuICAvKiogVGhlIGxpc3Qgb2YgZ2l0aHViIGxhYmVscyB0byBhZGQgdG8gdGhlIHJlbGVhc2UgUFJzLiAqL1xuICByZWxlYXNlUHJMYWJlbHM/OiBzdHJpbmdbXTtcbiAgLyoqIENvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIHJlbGVhc2Ugbm90ZXMgZHVyaW5nIHB1Ymxpc2hpbmcuICovXG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IE1ha2UgcmVsZWFzZU5vdGVzIGEgcmVxdWlyZWQgYXR0cmlidXRlIG9uIHRoZSBpbnRlcmZhY2Ugd2hlbiB0b29saW5nIGlzXG4gIC8vIGludGVncmF0ZWQuXG4gIHJlbGVhc2VOb3Rlcz86IFJlbGVhc2VOb3Rlc0NvbmZpZztcbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIHJlbGVhc2Ugbm90ZXMgZHVyaW5nIHB1Ymxpc2hpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VOb3Rlc0NvbmZpZyB7XG4gIC8qKiBXaGV0aGVyIHRvIHByb21wdCBmb3IgYW5kIGluY2x1ZGUgYSByZWxlYXNlIHRpdGxlIGluIHRoZSBnZW5lcmF0ZWQgcmVsZWFzZSBub3Rlcy4gKi9cbiAgdXNlUmVsZWFzZVRpdGxlPzogYm9vbGVhbjtcbiAgLyoqIExpc3Qgb2YgY29tbWl0IHNjb3BlcyB0byBkaXNjbHVkZSBmcm9tIGdlbmVyYXRlZCByZWxlYXNlIG5vdGVzLiAqL1xuICBoaWRkZW5TY29wZXM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIExpc3Qgb2YgY29tbWl0IGdyb3VwcywgZWl0aGVyIHtucG1TY29wZX0ve3Njb3BlfSBvciB7c2NvcGV9LCB0byB1c2UgZm9yIG9yZGVyaW5nLlxuICAgKlxuICAgKiBFYWNoIGdyb3VwIGZvciB0aGUgcmVsZWFzZSBub3Rlcywgd2lsbCBhcHBlYXIgaW4gdGhlIG9yZGVyIHByb3ZpZGVkIGluIGdyb3VwT3JkZXIgYW5kIGFueSBvdGhlclxuICAgKiBncm91cHMgd2lsbCBhcHBlYXIgYWZ0ZXIgdGhlc2UgZ3JvdXBzLCBzb3J0ZWQgYnkgYEFycmF5LnNvcnRgJ3MgZGVmYXVsdCBzb3J0aW5nIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBPcmRlcj86IHN0cmluZ1tdO1xufVxuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgcmVsZWFzZXMgaW4gdGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uLiAqL1xuZXhwb3J0IHR5cGUgRGV2SW5mcmFSZWxlYXNlQ29uZmlnID0gTmdEZXZDb25maWc8e3JlbGVhc2U6IFJlbGVhc2VDb25maWd9PjtcblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBSZWxlYXNlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZzogUGFydGlhbDxEZXZJbmZyYVJlbGVhc2VDb25maWc+ID0gZ2V0Q29uZmlnKCkpOlxuICAgIFJlbGVhc2VDb25maWcge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoY29uZmlnLnJlbGVhc2UgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBObyBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIFwicmVsZWFzZVwiYCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5yZWxlYXNlPy5ucG1QYWNrYWdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIFwibnBtUGFja2FnZXNcIiBjb25maWd1cmVkIGZvciByZWxlYXNpbmcuYCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5yZWxlYXNlPy5idWlsZFBhY2thZ2VzID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gXCJidWlsZFBhY2thZ2VzXCIgZnVuY3Rpb24gY29uZmlndXJlZCBmb3IgcmVsZWFzaW5nLmApO1xuICB9XG4gIGlmIChjb25maWcucmVsZWFzZT8uZ2VuZXJhdGVSZWxlYXNlTm90ZXNGb3JIZWFkID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gXCJnZW5lcmF0ZVJlbGVhc2VOb3Rlc0ZvckhlYWRcIiBmdW5jdGlvbiBjb25maWd1cmVkIGZvciByZWxlYXNpbmcuYCk7XG4gIH1cblxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnLnJlbGVhc2UhO1xufVxuIl19