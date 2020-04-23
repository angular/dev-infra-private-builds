(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra/benchmark/driver-utilities", ["require", "exports", "@angular/dev-infra/benchmark/driver-utilities/e2e_util", "@angular/dev-infra/benchmark/driver-utilities/perf_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var e2e_util_1 = require("@angular/dev-infra/benchmark/driver-utilities/e2e_util");
    exports.openBrowser = e2e_util_1.openBrowser;
    exports.verifyNoBrowserErrors = e2e_util_1.verifyNoBrowserErrors;
    var perf_util_1 = require("@angular/dev-infra/benchmark/driver-utilities/perf_util");
    exports.runBenchmark = perf_util_1.runBenchmark;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvYmVuY2htYXJrL2RyaXZlci11dGlsaXRpZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxtRkFBOEQ7SUFBdEQsaUNBQUEsV0FBVyxDQUFBO0lBQUUsMkNBQUEscUJBQXFCLENBQUE7SUFDMUMscUZBQXlDO0lBQWpDLG1DQUFBLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCB7b3BlbkJyb3dzZXIsIHZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5leHBvcnQge3J1bkJlbmNobWFya30gZnJvbSAnLi9wZXJmX3V0aWwnO1xuIl19