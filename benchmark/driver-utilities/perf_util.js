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
        define("@angular/dev-infra-private/benchmark/driver-utilities/perf_util", ["require", "exports", "shelljs", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util", "@angular/benchpress", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util"], factory);
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
    const shelljs_1 = require("shelljs");
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
            const description = {};
            params.forEach((param) => description[param.name] = param.value);
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
        shelljs_1.mkdir('-p', resultsFolder);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxxQ0FBOEI7SUFFOUIsMkZBQWlEO0lBQXpDLGlIQUFBLHFCQUFxQixPQUFBO0lBRTdCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQXNCLFlBQVksQ0FBQyxFQUNqQyxFQUFFLEVBQ0YsR0FBRyxHQUFHLEVBQUUsRUFDUixNQUFNLEdBQUcsRUFBRSxFQUNYLDRCQUE0QixHQUFHLElBQUksRUFDbkMsWUFBWSxFQUNaLElBQUksRUFDSixPQUFPLEVBQ1AsS0FBSyxHQVVOOztZQUNDLHNCQUFXLENBQUMsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLEtBQUssRUFBRTtnQkFDVCxNQUFNLEtBQUssRUFBRSxDQUFDO2FBQ2Y7WUFDRCxNQUFNLFdBQVcsR0FBeUIsRUFBRSxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsRUFBRTtnQkFDRixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPO2dCQUNQLFlBQVk7Z0JBQ1osU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDakUsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBaENELG9DQWdDQztJQUVELFNBQVMsc0JBQXNCO1FBQzdCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7UUFDakQsZUFBSyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMzQixNQUFNLFNBQVMsR0FBcUI7WUFDbEMscUNBQXdCLENBQUMsb0JBQW9CO1lBQzdDLEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFDO1lBQzVELEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxFQUFDLEVBQUUsNkJBQWdCLENBQUMsU0FBUztZQUM5RixFQUFDLE9BQU8sRUFBRSw2QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQztTQUMxRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBUyxFQUFFLFdBQVcsRUFBRSxxQ0FBd0IsRUFBQyxDQUFDLENBQUM7WUFDNUUsU0FBUyxDQUFDLElBQUksQ0FDVixFQUFDLE9BQU8sRUFBRSxxQ0FBd0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO1lBQ3pGLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyw0QkFBZSxFQUFFLDZCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO2FBQU07WUFDTCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLHNCQUFTLEVBQUUsV0FBVyxFQUFFLDBCQUFhLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsMEJBQWEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDbEUsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQVcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUNELE9BQU8sSUFBSSxtQkFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7bWtkaXJ9IGZyb20gJ3NoZWxsanMnO1xuXG5leHBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbmNvbnN0IG5vZGVVdWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbmltcG9ydCB7U2VsZW5pdW1XZWJEcml2ZXJBZGFwdGVyLCBPcHRpb25zLCBKc29uRmlsZVJlcG9ydGVyLCBWYWxpZGF0b3IsIFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvciwgQ29uc29sZVJlcG9ydGVyLCBTaXplVmFsaWRhdG9yLCBNdWx0aVJlcG9ydGVyLCBNdWx0aU1ldHJpYywgUnVubmVyLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvYmVuY2hwcmVzcyc7XG5pbXBvcnQge29wZW5Ccm93c2VyfSBmcm9tICcuL2UyZV91dGlsJztcblxuLy8gTm90ZTogS2VlcCB0aGUgYG1vZHVsZXMvYmVuY2htYXJrcy9SRUFETUUubWRgIGZpbGUgaW4gc3luYyB3aXRoIHRoZSBzdXBwb3J0ZWQgb3B0aW9ucy5cbmNvbnN0IGdsb2JhbE9wdGlvbnMgPSB7XG4gIHNhbXBsZVNpemU6IHByb2Nlc3MuZW52LlBFUkZfU0FNUExFX1NJWkUgfHwgMjAsXG4gIGZvcmNlR2M6IHByb2Nlc3MuZW52LlBFUkZfRk9SQ0VfR0MgPT09ICd0cnVlJyxcbiAgZHJ5UnVuOiBwcm9jZXNzLmVudi5QRVJGX0RSWVJVTiA9PT0gJ3RydWUnLFxufTtcblxuY29uc3QgcnVubmVyID0gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQmVuY2htYXJrKHtcbiAgaWQsXG4gIHVybCA9ICcnLFxuICBwYXJhbXMgPSBbXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbiA9IHRydWUsXG4gIG1pY3JvTWV0cmljcyxcbiAgd29yayxcbiAgcHJlcGFyZSxcbiAgc2V0dXAsXG59OiB7XG4gIGlkOiBzdHJpbmcsXG4gIHVybDogc3RyaW5nLFxuICBwYXJhbXM6IHtuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnl9W10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuLFxuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgd29yaz86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG4gIHByZXBhcmU/OiAoKCkgPT4gdm9pZCl8KCgpID0+IFByb21pc2U8dW5rbm93bj4pLFxuICBzZXR1cD86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG59KTogUHJvbWlzZTxhbnk+IHtcbiAgb3BlbkJyb3dzZXIoe3VybCwgcGFyYW1zLCBpZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9ufSk7XG4gIGlmIChzZXR1cCkge1xuICAgIGF3YWl0IHNldHVwKCk7XG4gIH1cbiAgY29uc3QgZGVzY3JpcHRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIHBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4gZGVzY3JpcHRpb25bcGFyYW0ubmFtZV0gPSBwYXJhbS52YWx1ZSk7XG4gIHJldHVybiBydW5uZXIuc2FtcGxlKHtcbiAgICBpZCxcbiAgICBleGVjdXRlOiB3b3JrLFxuICAgIHByZXBhcmUsXG4gICAgbWljcm9NZXRyaWNzLFxuICAgIHByb3ZpZGVyczogW3twcm92aWRlOiBPcHRpb25zLlNBTVBMRV9ERVNDUklQVElPTiwgdXNlVmFsdWU6IHt9fV1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTogUnVubmVyIHtcbiAgbGV0IHJ1bklkID0gbm9kZVV1aWQudjEoKTtcbiAgaWYgKHByb2Nlc3MuZW52LkdJVF9TSEEpIHtcbiAgICBydW5JZCA9IHByb2Nlc3MuZW52LkdJVF9TSEEgKyAnICcgKyBydW5JZDtcbiAgfVxuICBjb25zdCByZXN1bHRzRm9sZGVyID0gJy4vZGlzdC9iZW5jaG1hcmtfcmVzdWx0cyc7XG4gIG1rZGlyKCctcCcsIHJlc3VsdHNGb2xkZXIpO1xuICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXG4gICAgU2VsZW5pdW1XZWJEcml2ZXJBZGFwdGVyLlBST1RSQUNUT1JfUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkZPUkNFX0dDLCB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5mb3JjZUdjfSxcbiAgICB7cHJvdmlkZTogT3B0aW9ucy5ERUZBVUxUX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZTogeydydW5JZCc6IHJ1bklkfX0sIEpzb25GaWxlUmVwb3J0ZXIuUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBKc29uRmlsZVJlcG9ydGVyLlBBVEgsIHVzZVZhbHVlOiByZXN1bHRzRm9sZGVyfVxuICBdO1xuICBpZiAoIWdsb2JhbE9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvcn0pO1xuICAgIHByb3ZpZGVycy5wdXNoKFxuICAgICAgICB7cHJvdmlkZTogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yLlNBTVBMRV9TSVpFLCB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5zYW1wbGVTaXplfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlSZXBvcnRlci5wcm92aWRlV2l0aChbQ29uc29sZVJlcG9ydGVyLCBKc29uRmlsZVJlcG9ydGVyXSkpO1xuICB9IGVsc2Uge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBWYWxpZGF0b3IsIHVzZUV4aXN0aW5nOiBTaXplVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFNpemVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiAxfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlSZXBvcnRlci5wcm92aWRlV2l0aChbXSkpO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpTWV0cmljLnByb3ZpZGVXaXRoKFtdKSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBSdW5uZXIocHJvdmlkZXJzKTtcbn1cbiJdfQ==