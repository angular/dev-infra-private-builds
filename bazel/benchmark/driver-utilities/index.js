(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("dev-infra/bazel/benchmark/driver-utilities/index", ["require", "exports", "dev-infra/bazel/benchmark/driver-utilities/e2e_util", "dev-infra/bazel/benchmark/driver-utilities/perf_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runBenchmark = exports.verifyNoBrowserErrors = exports.openBrowser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var e2e_util_1 = require("dev-infra/bazel/benchmark/driver-utilities/e2e_util");
    Object.defineProperty(exports, "openBrowser", { enumerable: true, get: function () { return e2e_util_1.openBrowser; } });
    Object.defineProperty(exports, "verifyNoBrowserErrors", { enumerable: true, get: function () { return e2e_util_1.verifyNoBrowserErrors; } });
    var perf_util_1 = require("dev-infra/bazel/benchmark/driver-utilities/perf_util");
    Object.defineProperty(exports, "runBenchmark", { enumerable: true, get: function () { return perf_util_1.runBenchmark; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9iYXplbC9iZW5jaG1hcmsvZHJpdmVyLXV0aWxpdGllcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxnRkFBOEQ7SUFBdEQsdUdBQUEsV0FBVyxPQUFBO0lBQUUsaUhBQUEscUJBQXFCLE9BQUE7SUFDMUMsa0ZBQXlDO0lBQWpDLHlHQUFBLFlBQVksT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHtvcGVuQnJvd3NlciwgdmVyaWZ5Tm9Ccm93c2VyRXJyb3JzfSBmcm9tICcuL2UyZV91dGlsJztcbmV4cG9ydCB7cnVuQmVuY2htYXJrfSBmcm9tICcuL3BlcmZfdXRpbCc7XG4iXX0=