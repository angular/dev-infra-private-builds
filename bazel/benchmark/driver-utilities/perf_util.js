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
        define("dev-infra/bazel/benchmark/driver-utilities/perf_util", ["require", "exports", "fs", "dev-infra/bazel/benchmark/driver-utilities/e2e_util", "@angular/benchpress", "dev-infra/bazel/benchmark/driver-utilities/e2e_util"], factory);
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
    var e2e_util_1 = require("dev-infra/bazel/benchmark/driver-utilities/e2e_util");
    Object.defineProperty(exports, "verifyNoBrowserErrors", { enumerable: true, get: function () { return e2e_util_1.verifyNoBrowserErrors; } });
    const nodeUuid = require('node-uuid');
    const benchpress_1 = require("@angular/benchpress");
    const e2e_util_2 = require("dev-infra/bazel/benchmark/driver-utilities/e2e_util");
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
                providers: [{ provide: benchpress_1.Options.SAMPLE_DESCRIPTION, useValue: {} }],
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
            { provide: benchpress_1.Options.DEFAULT_DESCRIPTION, useValue: { 'runId': runId } },
            benchpress_1.JsonFileReporter.PROVIDERS,
            { provide: benchpress_1.JsonFileReporter.PATH, useValue: resultsFolder },
        ];
        if (!globalOptions.dryRun) {
            providers.push({ provide: benchpress_1.Validator, useExisting: benchpress_1.RegressionSlopeValidator });
            providers.push({
                provide: benchpress_1.RegressionSlopeValidator.SAMPLE_SIZE,
                useValue: globalOptions.sampleSize,
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYmF6ZWwvYmVuY2htYXJrL2RyaXZlci11dGlsaXRpZXMvcGVyZl91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJCQUE2QjtJQUU3QixnRkFBaUQ7SUFBekMsaUhBQUEscUJBQXFCLE9BQUE7SUFFN0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXRDLG9EQVk2QjtJQUM3QixrRkFBdUM7SUFFdkMseUZBQXlGO0lBQ3pGLE1BQU0sYUFBYSxHQUFHO1FBQ3BCLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLEVBQUU7UUFDOUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLE1BQU07UUFDN0MsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLE1BQU07S0FDM0MsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFHLHNCQUFzQixFQUFFLENBQUM7SUFFeEMsU0FBc0IsWUFBWSxDQUFDLEVBQ2pDLEVBQUUsRUFDRixHQUFHLEdBQUcsRUFBRSxFQUNSLE1BQU0sR0FBRyxFQUFFLEVBQ1gsNEJBQTRCLEdBQUcsSUFBSSxFQUNuQyxZQUFZLEVBQ1osSUFBSSxFQUNKLE9BQU8sRUFDUCxLQUFLLEdBVU47O1lBQ0Msc0JBQVcsQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQUksS0FBSyxFQUFFO2dCQUNULE1BQU0sS0FBSyxFQUFFLENBQUM7YUFDZjtZQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsRUFBRTtnQkFDRixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPO2dCQUNQLFlBQVk7Z0JBQ1osU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDakUsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBOUJELG9DQThCQztJQUVELFNBQVMsc0JBQXNCO1FBQzdCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7UUFDakQsY0FBUyxDQUFDLGFBQWEsRUFBRTtZQUN2QixTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBcUI7WUFDbEMscUNBQXdCLENBQUMsb0JBQW9CO1lBQzdDLEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFDO1lBQzVELEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxFQUFDO1lBQ2xFLDZCQUFnQixDQUFDLFNBQVM7WUFDMUIsRUFBQyxPQUFPLEVBQUUsNkJBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7U0FDMUQsQ0FBQztRQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQVMsRUFBRSxXQUFXLEVBQUUscUNBQXdCLEVBQUMsQ0FBQyxDQUFDO1lBQzVFLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2IsT0FBTyxFQUFFLHFDQUF3QixDQUFDLFdBQVc7Z0JBQzdDLFFBQVEsRUFBRSxhQUFhLENBQUMsVUFBVTthQUNuQyxDQUFDLENBQUM7WUFDSCxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsNEJBQWUsRUFBRSw2QkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRjthQUFNO1lBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBUyxFQUFFLFdBQVcsRUFBRSwwQkFBYSxFQUFDLENBQUMsQ0FBQztZQUNqRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLDBCQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksbUJBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge21rZGlyU3luY30gZnJvbSAnZnMnO1xuXG5leHBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbmNvbnN0IG5vZGVVdWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbmltcG9ydCB7XG4gIFNlbGVuaXVtV2ViRHJpdmVyQWRhcHRlcixcbiAgT3B0aW9ucyxcbiAgSnNvbkZpbGVSZXBvcnRlcixcbiAgVmFsaWRhdG9yLFxuICBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IsXG4gIENvbnNvbGVSZXBvcnRlcixcbiAgU2l6ZVZhbGlkYXRvcixcbiAgTXVsdGlSZXBvcnRlcixcbiAgTXVsdGlNZXRyaWMsXG4gIFJ1bm5lcixcbiAgU3RhdGljUHJvdmlkZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2JlbmNocHJlc3MnO1xuaW1wb3J0IHtvcGVuQnJvd3Nlcn0gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbi8vIE5vdGU6IEtlZXAgdGhlIGBtb2R1bGVzL2JlbmNobWFya3MvUkVBRE1FLm1kYCBmaWxlIGluIHN5bmMgd2l0aCB0aGUgc3VwcG9ydGVkIG9wdGlvbnMuXG5jb25zdCBnbG9iYWxPcHRpb25zID0ge1xuICBzYW1wbGVTaXplOiBwcm9jZXNzLmVudi5QRVJGX1NBTVBMRV9TSVpFIHx8IDIwLFxuICBmb3JjZUdjOiBwcm9jZXNzLmVudi5QRVJGX0ZPUkNFX0dDID09PSAndHJ1ZScsXG4gIGRyeVJ1bjogcHJvY2Vzcy5lbnYuUEVSRl9EUllSVU4gPT09ICd0cnVlJyxcbn07XG5cbmNvbnN0IHJ1bm5lciA9IGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJlbmNobWFyayh7XG4gIGlkLFxuICB1cmwgPSAnJyxcbiAgcGFyYW1zID0gW10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24gPSB0cnVlLFxuICBtaWNyb01ldHJpY3MsXG4gIHdvcmssXG4gIHByZXBhcmUsXG4gIHNldHVwLFxufToge1xuICBpZDogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIHBhcmFtcz86IHtuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnl9W107XG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuO1xuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgd29yaz86ICgoKSA9PiB2b2lkKSB8ICgoKSA9PiBQcm9taXNlPHVua25vd24+KTtcbiAgcHJlcGFyZT86ICgoKSA9PiB2b2lkKSB8ICgoKSA9PiBQcm9taXNlPHVua25vd24+KTtcbiAgc2V0dXA/OiAoKCkgPT4gdm9pZCkgfCAoKCkgPT4gUHJvbWlzZTx1bmtub3duPik7XG59KTogUHJvbWlzZTxhbnk+IHtcbiAgb3BlbkJyb3dzZXIoe3VybCwgcGFyYW1zLCBpZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9ufSk7XG4gIGlmIChzZXR1cCkge1xuICAgIGF3YWl0IHNldHVwKCk7XG4gIH1cbiAgcmV0dXJuIHJ1bm5lci5zYW1wbGUoe1xuICAgIGlkLFxuICAgIGV4ZWN1dGU6IHdvcmssXG4gICAgcHJlcGFyZSxcbiAgICBtaWNyb01ldHJpY3MsXG4gICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE9wdGlvbnMuU0FNUExFX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZToge319XSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTogUnVubmVyIHtcbiAgbGV0IHJ1bklkID0gbm9kZVV1aWQudjEoKTtcbiAgaWYgKHByb2Nlc3MuZW52LkdJVF9TSEEpIHtcbiAgICBydW5JZCA9IHByb2Nlc3MuZW52LkdJVF9TSEEgKyAnICcgKyBydW5JZDtcbiAgfVxuICBjb25zdCByZXN1bHRzRm9sZGVyID0gJy4vZGlzdC9iZW5jaG1hcmtfcmVzdWx0cyc7XG4gIG1rZGlyU3luYyhyZXN1bHRzRm9sZGVyLCB7XG4gICAgcmVjdXJzaXZlOiB0cnVlLFxuICB9KTtcbiAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICAgIFNlbGVuaXVtV2ViRHJpdmVyQWRhcHRlci5QUk9UUkFDVE9SX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogT3B0aW9ucy5GT1JDRV9HQywgdXNlVmFsdWU6IGdsb2JhbE9wdGlvbnMuZm9yY2VHY30sXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuREVGQVVMVF9ERVNDUklQVElPTiwgdXNlVmFsdWU6IHsncnVuSWQnOiBydW5JZH19LFxuICAgIEpzb25GaWxlUmVwb3J0ZXIuUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBKc29uRmlsZVJlcG9ydGVyLlBBVEgsIHVzZVZhbHVlOiByZXN1bHRzRm9sZGVyfSxcbiAgXTtcbiAgaWYgKCFnbG9iYWxPcHRpb25zLmRyeVJ1bikge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBWYWxpZGF0b3IsIHVzZUV4aXN0aW5nOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICBwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsXG4gICAgICB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5zYW1wbGVTaXplLFxuICAgIH0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW0NvbnNvbGVSZXBvcnRlciwgSnNvbkZpbGVSZXBvcnRlcl0pKTtcbiAgfSBlbHNlIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogU2l6ZVZhbGlkYXRvcn0pO1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBTaXplVmFsaWRhdG9yLlNBTVBMRV9TSVpFLCB1c2VWYWx1ZTogMX0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW10pKTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aU1ldHJpYy5wcm92aWRlV2l0aChbXSkpO1xuICB9XG4gIHJldHVybiBuZXcgUnVubmVyKHByb3ZpZGVycyk7XG59XG4iXX0=