var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/benchmark/driver-utilities/perf_util", ["require", "exports", "fs", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util", "@angular/benchpress", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runBenchmark = exports.verifyNoBrowserErrors = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    const fs_1 = require("fs");
    var e2e_util_1 = require("@angular/dev-infra-private/benchmark/driver-utilities/e2e_util");
    Object.defineProperty(exports, "verifyNoBrowserErrors", { enumerable: true, get: function () { return e2e_util_1.verifyNoBrowserErrors; } });
    const nodeUuid = require('node-uuid');
    const benchpress_1 = require("@angular/benchpress");
    const e2e_util_2 = require("@angular/dev-infra-private/benchmark/driver-utilities/e2e_util");
    // Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
    const globalOptions = {
        sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
        forceGc: process.env.PERF_FORCE_GC === 'true',
        dryRun: process.env.PERF_DRYRUN === 'true',
    };
    const runner = createBenchpressRunner();
    function runBenchmark({ id, url = '', params = [], ignoreBrowserSynchronization = true, microMetrics, work, prepare, setup, }) {
        return __awaiter(this, void 0, void 0, function* () {
            e2e_util_2.openBrowser({ url, params, ignoreBrowserSynchronization });
            if (setup) {
                yield setup();
            }
            return runner.sample({
                id,
                execute: work,
                prepare,
                microMetrics,
                providers: [{ provide: benchpress_1.Options.SAMPLE_DESCRIPTION, useValue: {} }]
            });
        });
    }
    exports.runBenchmark = runBenchmark;
    function createBenchpressRunner() {
        let runId = nodeUuid.v1();
        if (process.env.GIT_SHA) {
            runId = process.env.GIT_SHA + ' ' + runId;
        }
        const resultsFolder = './dist/benchmark_results';
        fs_1.mkdirSync(resultsFolder, {
            recursive: true,
        });
        const providers = [
            benchpress_1.SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
            { provide: benchpress_1.Options.FORCE_GC, useValue: globalOptions.forceGc },
            { provide: benchpress_1.Options.DEFAULT_DESCRIPTION, useValue: { 'runId': runId } }, benchpress_1.JsonFileReporter.PROVIDERS,
            { provide: benchpress_1.JsonFileReporter.PATH, useValue: resultsFolder }
        ];
        if (!globalOptions.dryRun) {
            providers.push({ provide: benchpress_1.Validator, useExisting: benchpress_1.RegressionSlopeValidator });
            providers.push({ provide: benchpress_1.RegressionSlopeValidator.SAMPLE_SIZE, useValue: globalOptions.sampleSize });
            providers.push(benchpress_1.MultiReporter.provideWith([benchpress_1.ConsoleReporter, benchpress_1.JsonFileReporter]));
        }
        else {
            providers.push({ provide: benchpress_1.Validator, useExisting: benchpress_1.SizeValidator });
            providers.push({ provide: benchpress_1.SizeValidator.SAMPLE_SIZE, useValue: 1 });
            providers.push(benchpress_1.MultiReporter.provideWith([]));
            providers.push(benchpress_1.MultiMetric.provideWith([]));
        }
        return new benchpress_1.Runner(providers);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBNkI7SUFFN0IsMkZBQWlEO0lBQXpDLGlIQUFBLHFCQUFxQixPQUFBO0lBRTdCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQXNCLFlBQVksQ0FBQyxFQUNqQyxFQUFFLEVBQ0YsR0FBRyxHQUFHLEVBQUUsRUFDUixNQUFNLEdBQUcsRUFBRSxFQUNYLDRCQUE0QixHQUFHLElBQUksRUFDbkMsWUFBWSxFQUNaLElBQUksRUFDSixPQUFPLEVBQ1AsS0FBSyxHQVVOOztZQUNDLHNCQUFXLENBQUMsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLEtBQUssRUFBRTtnQkFDVCxNQUFNLEtBQUssRUFBRSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLEVBQUU7Z0JBQ0YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTztnQkFDUCxZQUFZO2dCQUNaLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO2FBQ2pFLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQTlCRCxvQ0E4QkM7SUFFRCxTQUFTLHNCQUFzQjtRQUM3QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDMUIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtZQUN2QixLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztTQUMzQztRQUNELE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO1FBQ2pELGNBQVMsQ0FBQyxhQUFhLEVBQUU7WUFDdkIsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQXFCO1lBQ2xDLHFDQUF3QixDQUFDLG9CQUFvQjtZQUM3QyxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBQztZQUM1RCxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsRUFBQyxFQUFFLDZCQUFnQixDQUFDLFNBQVM7WUFDOUYsRUFBQyxPQUFPLEVBQUUsNkJBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7U0FDMUQsQ0FBQztRQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQVMsRUFBRSxXQUFXLEVBQUUscUNBQXdCLEVBQUMsQ0FBQyxDQUFDO1lBQzVFLFNBQVMsQ0FBQyxJQUFJLENBQ1YsRUFBQyxPQUFPLEVBQUUscUNBQXdCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztZQUN6RixTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsNEJBQWUsRUFBRSw2QkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRjthQUFNO1lBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBUyxFQUFFLFdBQVcsRUFBRSwwQkFBYSxFQUFDLENBQUMsQ0FBQztZQUNqRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLDBCQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksbUJBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge21rZGlyU3luY30gZnJvbSAnZnMnO1xuXG5leHBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbmNvbnN0IG5vZGVVdWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbmltcG9ydCB7U2VsZW5pdW1XZWJEcml2ZXJBZGFwdGVyLCBPcHRpb25zLCBKc29uRmlsZVJlcG9ydGVyLCBWYWxpZGF0b3IsIFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvciwgQ29uc29sZVJlcG9ydGVyLCBTaXplVmFsaWRhdG9yLCBNdWx0aVJlcG9ydGVyLCBNdWx0aU1ldHJpYywgUnVubmVyLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvYmVuY2hwcmVzcyc7XG5pbXBvcnQge29wZW5Ccm93c2VyfSBmcm9tICcuL2UyZV91dGlsJztcblxuLy8gTm90ZTogS2VlcCB0aGUgYG1vZHVsZXMvYmVuY2htYXJrcy9SRUFETUUubWRgIGZpbGUgaW4gc3luYyB3aXRoIHRoZSBzdXBwb3J0ZWQgb3B0aW9ucy5cbmNvbnN0IGdsb2JhbE9wdGlvbnMgPSB7XG4gIHNhbXBsZVNpemU6IHByb2Nlc3MuZW52LlBFUkZfU0FNUExFX1NJWkUgfHwgMjAsXG4gIGZvcmNlR2M6IHByb2Nlc3MuZW52LlBFUkZfRk9SQ0VfR0MgPT09ICd0cnVlJyxcbiAgZHJ5UnVuOiBwcm9jZXNzLmVudi5QRVJGX0RSWVJVTiA9PT0gJ3RydWUnLFxufTtcblxuY29uc3QgcnVubmVyID0gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQmVuY2htYXJrKHtcbiAgaWQsXG4gIHVybCA9ICcnLFxuICBwYXJhbXMgPSBbXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbiA9IHRydWUsXG4gIG1pY3JvTWV0cmljcyxcbiAgd29yayxcbiAgcHJlcGFyZSxcbiAgc2V0dXAsXG59OiB7XG4gIGlkOiBzdHJpbmcsXG4gIHVybD86IHN0cmluZyxcbiAgcGFyYW1zPzoge25hbWU6IHN0cmluZywgdmFsdWU6IGFueX1bXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbj86IGJvb2xlYW4sXG4gIG1pY3JvTWV0cmljcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICB3b3JrPzogKCgpID0+IHZvaWQpfCgoKSA9PiBQcm9taXNlPHVua25vd24+KSxcbiAgcHJlcGFyZT86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG4gIHNldHVwPzogKCgpID0+IHZvaWQpfCgoKSA9PiBQcm9taXNlPHVua25vd24+KSxcbn0pOiBQcm9taXNlPGFueT4ge1xuICBvcGVuQnJvd3Nlcih7dXJsLCBwYXJhbXMsIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb259KTtcbiAgaWYgKHNldHVwKSB7XG4gICAgYXdhaXQgc2V0dXAoKTtcbiAgfVxuICByZXR1cm4gcnVubmVyLnNhbXBsZSh7XG4gICAgaWQsXG4gICAgZXhlY3V0ZTogd29yayxcbiAgICBwcmVwYXJlLFxuICAgIG1pY3JvTWV0cmljcyxcbiAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogT3B0aW9ucy5TQU1QTEVfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7fX1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCZW5jaHByZXNzUnVubmVyKCk6IFJ1bm5lciB7XG4gIGxldCBydW5JZCA9IG5vZGVVdWlkLnYxKCk7XG4gIGlmIChwcm9jZXNzLmVudi5HSVRfU0hBKSB7XG4gICAgcnVuSWQgPSBwcm9jZXNzLmVudi5HSVRfU0hBICsgJyAnICsgcnVuSWQ7XG4gIH1cbiAgY29uc3QgcmVzdWx0c0ZvbGRlciA9ICcuL2Rpc3QvYmVuY2htYXJrX3Jlc3VsdHMnO1xuICBta2RpclN5bmMocmVzdWx0c0ZvbGRlciwge1xuICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcbiAgfSk7XG4gIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICBTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIuUFJPVFJBQ1RPUl9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuRk9SQ0VfR0MsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLmZvcmNlR2N9LFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkRFRkFVTFRfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7J3J1bklkJzogcnVuSWR9fSwgSnNvbkZpbGVSZXBvcnRlci5QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IEpzb25GaWxlUmVwb3J0ZXIuUEFUSCwgdXNlVmFsdWU6IHJlc3VsdHNGb2xkZXJ9XG4gIF07XG4gIGlmICghZ2xvYmFsT3B0aW9ucy5kcnlSdW4pIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goXG4gICAgICAgIHtwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLnNhbXBsZVNpemV9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtDb25zb2xlUmVwb3J0ZXIsIEpzb25GaWxlUmVwb3J0ZXJdKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFNpemVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogU2l6ZVZhbGlkYXRvci5TQU1QTEVfU0laRSwgdXNlVmFsdWU6IDF9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtdKSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlNZXRyaWMucHJvdmlkZVdpdGgoW10pKTtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bm5lcihwcm92aWRlcnMpO1xufVxuIl19