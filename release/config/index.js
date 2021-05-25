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
        if (((_c = config.release) === null || _c === void 0 ? void 0 : _c.releaseNotes) === undefined) {
            errors.push("No \"releaseNotes\" configured for releasing.");
        }
        config_1.assertNoErrors(errors);
        return config.release;
    }
    exports.getReleaseConfig = getReleaseConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9jb25maWcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsa0VBQTBFO0lBMEMxRSwyREFBMkQ7SUFDM0QsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBb0Q7O1FBQXBELHVCQUFBLEVBQUEsU0FBeUMsa0JBQVMsRUFBRTtRQUVuRixvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQywwQ0FBd0MsQ0FBQyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxDQUFBLE1BQUEsTUFBTSxDQUFDLE9BQU8sMENBQUUsV0FBVyxNQUFLLFNBQVMsRUFBRTtZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE0QyxDQUFDLENBQUM7U0FDM0Q7UUFDRCxJQUFJLENBQUEsTUFBQSxNQUFNLENBQUMsT0FBTywwQ0FBRSxhQUFhLE1BQUssU0FBUyxFQUFFO1lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUMseURBQXVELENBQUMsQ0FBQztTQUN0RTtRQUNELElBQUksQ0FBQSxNQUFBLE1BQU0sQ0FBQyxPQUFPLDBDQUFFLFlBQVksTUFBSyxTQUFTLEVBQUU7WUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQywrQ0FBNkMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQU0sQ0FBQyxPQUFRLENBQUM7SUFDekIsQ0FBQztJQXBCRCw0Q0FvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgYnVpbHQgcGFja2FnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbHRQYWNrYWdlIHtcbiAgLyoqIE5hbWUgb2YgdGhlIHBhY2thZ2UuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIFBhdGggdG8gdGhlIHBhY2thZ2Ugb3V0cHV0IGRpcmVjdG9yeS4gKi9cbiAgb3V0cHV0UGF0aDogc3RyaW5nO1xufVxuXG4vKiogQ29uZmlndXJhdGlvbiBmb3Igc3RhZ2luZyBhbmQgcHVibGlzaGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VDb25maWcge1xuICAvKiogUmVnaXN0cnkgVVJMIHVzZWQgZm9yIHB1Ymxpc2hpbmcgcmVsZWFzZSBwYWNrYWdlcy4gRGVmYXVsdHMgdG8gdGhlIE5QTSByZWdpc3RyeS4gKi9cbiAgcHVibGlzaFJlZ2lzdHJ5Pzogc3RyaW5nO1xuICAvKiogTGlzdCBvZiBOUE0gcGFja2FnZXMgdGhhdCBhcmUgcHVibGlzaGVkIGFzIHBhcnQgb2YgdGhpcyBwcm9qZWN0LiAqL1xuICBucG1QYWNrYWdlczogc3RyaW5nW107XG4gIC8qKiBCdWlsZHMgcmVsZWFzZSBwYWNrYWdlcyBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgcGF0aHMgcG9pbnRpbmcgdG8gdGhlIG91dHB1dC4gKi9cbiAgYnVpbGRQYWNrYWdlczogKHN0YW1wRm9yUmVsZWFzZT86IGJvb2xlYW4pID0+IFByb21pc2U8QnVpbHRQYWNrYWdlW118bnVsbD47XG4gIC8qKiBUaGUgbGlzdCBvZiBnaXRodWIgbGFiZWxzIHRvIGFkZCB0byB0aGUgcmVsZWFzZSBQUnMuICovXG4gIHJlbGVhc2VQckxhYmVscz86IHN0cmluZ1tdO1xuICAvKiogQ29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgcmVsZWFzZSBub3RlcyBkdXJpbmcgcHVibGlzaGluZy4gKi9cbiAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXNDb25maWc7XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBjcmVhdGluZyByZWxlYXNlIG5vdGVzIGR1cmluZyBwdWJsaXNoaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlTm90ZXNDb25maWcge1xuICAvKiogV2hldGhlciB0byBwcm9tcHQgZm9yIGFuZCBpbmNsdWRlIGEgcmVsZWFzZSB0aXRsZSBpbiB0aGUgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMuICovXG4gIHVzZVJlbGVhc2VUaXRsZT86IGJvb2xlYW47XG4gIC8qKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgdG8gZGlzY2x1ZGUgZnJvbSBnZW5lcmF0ZWQgcmVsZWFzZSBub3Rlcy4gKi9cbiAgaGlkZGVuU2NvcGVzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBncm91cHMsIGVpdGhlciB7bnBtU2NvcGV9L3tzY29wZX0gb3Ige3Njb3BlfSwgdG8gdXNlIGZvciBvcmRlcmluZy5cbiAgICpcbiAgICogRWFjaCBncm91cCBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMsIHdpbGwgYXBwZWFyIGluIHRoZSBvcmRlciBwcm92aWRlZCBpbiBncm91cE9yZGVyIGFuZCBhbnkgb3RoZXJcbiAgICogZ3JvdXBzIHdpbGwgYXBwZWFyIGFmdGVyIHRoZXNlIGdyb3Vwcywgc29ydGVkIGJ5IGBBcnJheS5zb3J0YCdzIGRlZmF1bHQgc29ydGluZyBvcmRlci5cbiAgICovXG4gIGdyb3VwT3JkZXI/OiBzdHJpbmdbXTtcbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2VzIGluIHRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbi4gKi9cbmV4cG9ydCB0eXBlIERldkluZnJhUmVsZWFzZUNvbmZpZyA9IE5nRGV2Q29uZmlnPHtyZWxlYXNlOiBSZWxlYXNlQ29uZmlnfT47XG5cbi8qKiBSZXRyaWV2ZSBhbmQgdmFsaWRhdGUgdGhlIGNvbmZpZyBhcyBgUmVsZWFzZUNvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc6IFBhcnRpYWw8RGV2SW5mcmFSZWxlYXNlQ29uZmlnPiA9IGdldENvbmZpZygpKTpcbiAgICBSZWxlYXNlQ29uZmlnIHtcbiAgLy8gTGlzdCBvZiBlcnJvcnMgZW5jb3VudGVyZWQgdmFsaWRhdGluZyB0aGUgY29uZmlnLlxuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKGNvbmZpZy5yZWxlYXNlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcInJlbGVhc2VcImApO1xuICB9XG4gIGlmIChjb25maWcucmVsZWFzZT8ubnBtUGFja2FnZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBObyBcIm5wbVBhY2thZ2VzXCIgY29uZmlndXJlZCBmb3IgcmVsZWFzaW5nLmApO1xuICB9XG4gIGlmIChjb25maWcucmVsZWFzZT8uYnVpbGRQYWNrYWdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIFwiYnVpbGRQYWNrYWdlc1wiIGZ1bmN0aW9uIGNvbmZpZ3VyZWQgZm9yIHJlbGVhc2luZy5gKTtcbiAgfVxuICBpZiAoY29uZmlnLnJlbGVhc2U/LnJlbGVhc2VOb3RlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIFwicmVsZWFzZU5vdGVzXCIgY29uZmlndXJlZCBmb3IgcmVsZWFzaW5nLmApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZy5yZWxlYXNlITtcbn1cbiJdfQ==