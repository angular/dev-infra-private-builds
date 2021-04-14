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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxxQ0FBOEI7SUFFOUIsMkZBQWlEO0lBQXpDLGlIQUFBLHFCQUFxQixPQUFBO0lBRTdCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQXNCLFlBQVksQ0FBQyxFQUNqQyxFQUFFLEVBQ0YsR0FBRyxHQUFHLEVBQUUsRUFDUixNQUFNLEdBQUcsRUFBRSxFQUNYLDRCQUE0QixHQUFHLElBQUksRUFDbkMsWUFBWSxFQUNaLElBQUksRUFDSixPQUFPLEVBQ1AsS0FBSyxHQVVOOztZQUNDLHNCQUFXLENBQUMsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLEtBQUssRUFBRTtnQkFDVCxNQUFNLEtBQUssRUFBRSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLEVBQUU7Z0JBQ0YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTztnQkFDUCxZQUFZO2dCQUNaLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO2FBQ2pFLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQTlCRCxvQ0E4QkM7SUFFRCxTQUFTLHNCQUFzQjtRQUM3QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDMUIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtZQUN2QixLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztTQUMzQztRQUNELE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO1FBQ2pELGVBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDM0IsTUFBTSxTQUFTLEdBQXFCO1lBQ2xDLHFDQUF3QixDQUFDLG9CQUFvQjtZQUM3QyxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBQztZQUM1RCxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsRUFBQyxFQUFFLDZCQUFnQixDQUFDLFNBQVM7WUFDOUYsRUFBQyxPQUFPLEVBQUUsNkJBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7U0FDMUQsQ0FBQztRQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQVMsRUFBRSxXQUFXLEVBQUUscUNBQXdCLEVBQUMsQ0FBQyxDQUFDO1lBQzVFLFNBQVMsQ0FBQyxJQUFJLENBQ1YsRUFBQyxPQUFPLEVBQUUscUNBQXdCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztZQUN6RixTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsNEJBQWUsRUFBRSw2QkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRjthQUFNO1lBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBUyxFQUFFLFdBQVcsRUFBRSwwQkFBYSxFQUFDLENBQUMsQ0FBQztZQUNqRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLDBCQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksbUJBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge21rZGlyfSBmcm9tICdzaGVsbGpzJztcblxuZXhwb3J0IHt2ZXJpZnlOb0Jyb3dzZXJFcnJvcnN9IGZyb20gJy4vZTJlX3V0aWwnO1xuXG5jb25zdCBub2RlVXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xuXG5pbXBvcnQge1NlbGVuaXVtV2ViRHJpdmVyQWRhcHRlciwgT3B0aW9ucywgSnNvbkZpbGVSZXBvcnRlciwgVmFsaWRhdG9yLCBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IsIENvbnNvbGVSZXBvcnRlciwgU2l6ZVZhbGlkYXRvciwgTXVsdGlSZXBvcnRlciwgTXVsdGlNZXRyaWMsIFJ1bm5lciwgU3RhdGljUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2JlbmNocHJlc3MnO1xuaW1wb3J0IHtvcGVuQnJvd3Nlcn0gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbi8vIE5vdGU6IEtlZXAgdGhlIGBtb2R1bGVzL2JlbmNobWFya3MvUkVBRE1FLm1kYCBmaWxlIGluIHN5bmMgd2l0aCB0aGUgc3VwcG9ydGVkIG9wdGlvbnMuXG5jb25zdCBnbG9iYWxPcHRpb25zID0ge1xuICBzYW1wbGVTaXplOiBwcm9jZXNzLmVudi5QRVJGX1NBTVBMRV9TSVpFIHx8IDIwLFxuICBmb3JjZUdjOiBwcm9jZXNzLmVudi5QRVJGX0ZPUkNFX0dDID09PSAndHJ1ZScsXG4gIGRyeVJ1bjogcHJvY2Vzcy5lbnYuUEVSRl9EUllSVU4gPT09ICd0cnVlJyxcbn07XG5cbmNvbnN0IHJ1bm5lciA9IGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJlbmNobWFyayh7XG4gIGlkLFxuICB1cmwgPSAnJyxcbiAgcGFyYW1zID0gW10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24gPSB0cnVlLFxuICBtaWNyb01ldHJpY3MsXG4gIHdvcmssXG4gIHByZXBhcmUsXG4gIHNldHVwLFxufToge1xuICBpZDogc3RyaW5nLFxuICB1cmw/OiBzdHJpbmcsXG4gIHBhcmFtcz86IHtuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnl9W10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuLFxuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgd29yaz86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG4gIHByZXBhcmU/OiAoKCkgPT4gdm9pZCl8KCgpID0+IFByb21pc2U8dW5rbm93bj4pLFxuICBzZXR1cD86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG59KTogUHJvbWlzZTxhbnk+IHtcbiAgb3BlbkJyb3dzZXIoe3VybCwgcGFyYW1zLCBpZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9ufSk7XG4gIGlmIChzZXR1cCkge1xuICAgIGF3YWl0IHNldHVwKCk7XG4gIH1cbiAgcmV0dXJuIHJ1bm5lci5zYW1wbGUoe1xuICAgIGlkLFxuICAgIGV4ZWN1dGU6IHdvcmssXG4gICAgcHJlcGFyZSxcbiAgICBtaWNyb01ldHJpY3MsXG4gICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE9wdGlvbnMuU0FNUExFX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZToge319XVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpOiBSdW5uZXIge1xuICBsZXQgcnVuSWQgPSBub2RlVXVpZC52MSgpO1xuICBpZiAocHJvY2Vzcy5lbnYuR0lUX1NIQSkge1xuICAgIHJ1bklkID0gcHJvY2Vzcy5lbnYuR0lUX1NIQSArICcgJyArIHJ1bklkO1xuICB9XG4gIGNvbnN0IHJlc3VsdHNGb2xkZXIgPSAnLi9kaXN0L2JlbmNobWFya19yZXN1bHRzJztcbiAgbWtkaXIoJy1wJywgcmVzdWx0c0ZvbGRlcik7XG4gIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICBTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIuUFJPVFJBQ1RPUl9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuRk9SQ0VfR0MsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLmZvcmNlR2N9LFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkRFRkFVTFRfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7J3J1bklkJzogcnVuSWR9fSwgSnNvbkZpbGVSZXBvcnRlci5QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IEpzb25GaWxlUmVwb3J0ZXIuUEFUSCwgdXNlVmFsdWU6IHJlc3VsdHNGb2xkZXJ9XG4gIF07XG4gIGlmICghZ2xvYmFsT3B0aW9ucy5kcnlSdW4pIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goXG4gICAgICAgIHtwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLnNhbXBsZVNpemV9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtDb25zb2xlUmVwb3J0ZXIsIEpzb25GaWxlUmVwb3J0ZXJdKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFNpemVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogU2l6ZVZhbGlkYXRvci5TQU1QTEVfU0laRSwgdXNlVmFsdWU6IDF9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtdKSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlNZXRyaWMucHJvdmlkZVdpdGgoW10pKTtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bm5lcihwcm92aWRlcnMpO1xufVxuIl19