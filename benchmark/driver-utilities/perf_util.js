(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/benchmark/driver-utilities/perf_util", ["require", "exports", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util", "fs-extra", "@angular/benchpress", "@angular/dev-infra-private/benchmark/driver-utilities/e2e_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runBenchmark = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var e2e_util_1 = require("@angular/dev-infra-private/benchmark/driver-utilities/e2e_util");
    Object.defineProperty(exports, "verifyNoBrowserErrors", { enumerable: true, get: function () { return e2e_util_1.verifyNoBrowserErrors; } });
    const nodeUuid = require('node-uuid');
    const fs = require("fs-extra");
    const benchpress_1 = require("@angular/benchpress");
    const e2e_util_2 = require("@angular/dev-infra-private/benchmark/driver-utilities/e2e_util");
    // Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
    const globalOptions = {
        sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
        forceGc: process.env.PERF_FORCE_GC === 'true',
        dryRun: process.env.PERF_DRYRUN === 'true',
    };
    const runner = createBenchpressRunner();
    function runBenchmark(config) {
        e2e_util_2.openBrowser(config);
        if (config.setup) {
            config.setup();
        }
        const description = {};
        config.params.forEach((param) => description[param.name] = param.value);
        return runner.sample({
            id: config.id,
            execute: config.work,
            prepare: config.prepare,
            microMetrics: config.microMetrics,
            providers: [{ provide: benchpress_1.Options.SAMPLE_DESCRIPTION, useValue: {} }]
        });
    }
    exports.runBenchmark = runBenchmark;
    function createBenchpressRunner() {
        let runId = nodeUuid.v1();
        if (process.env.GIT_SHA) {
            runId = process.env.GIT_SHA + ' ' + runId;
        }
        const resultsFolder = './dist/benchmark_results';
        fs.ensureDirSync(resultsFolder);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRkFBaUQ7SUFBekMsaUhBQUEscUJBQXFCLE9BQUE7SUFFN0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RDLCtCQUErQjtJQUUvQixvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQWdCLFlBQVksQ0FBQyxNQVM1QjtRQUNDLHNCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2hCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNoQjtRQUNELE1BQU0sV0FBVyxHQUF5QixFQUFFLENBQUM7UUFDN0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNuQixFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDYixPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDcEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1lBQ3ZCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtZQUNqQyxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQztTQUNqRSxDQUFDLENBQUM7SUFDTCxDQUFDO0lBdkJELG9DQXVCQztJQUVELFNBQVMsc0JBQXNCO1FBQzdCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7UUFDakQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoQyxNQUFNLFNBQVMsR0FBcUI7WUFDbEMscUNBQXdCLENBQUMsb0JBQW9CO1lBQzdDLEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFDO1lBQzVELEVBQUMsT0FBTyxFQUFFLG9CQUFPLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxFQUFDLEVBQUUsNkJBQWdCLENBQUMsU0FBUztZQUM5RixFQUFDLE9BQU8sRUFBRSw2QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQztTQUMxRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBUyxFQUFFLFdBQVcsRUFBRSxxQ0FBd0IsRUFBQyxDQUFDLENBQUM7WUFDNUUsU0FBUyxDQUFDLElBQUksQ0FDVixFQUFDLE9BQU8sRUFBRSxxQ0FBd0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO1lBQ3pGLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyw0QkFBZSxFQUFFLDZCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO2FBQU07WUFDTCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLHNCQUFTLEVBQUUsV0FBVyxFQUFFLDBCQUFhLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsMEJBQWEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDbEUsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQVcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUNELE9BQU8sSUFBSSxtQkFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCB7dmVyaWZ5Tm9Ccm93c2VyRXJyb3JzfSBmcm9tICcuL2UyZV91dGlsJztcblxuY29uc3Qgbm9kZVV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IHtTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIsIE9wdGlvbnMsIEpzb25GaWxlUmVwb3J0ZXIsIFZhbGlkYXRvciwgUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yLCBDb25zb2xlUmVwb3J0ZXIsIFNpemVWYWxpZGF0b3IsIE11bHRpUmVwb3J0ZXIsIE11bHRpTWV0cmljLCBSdW5uZXIsIFN0YXRpY1Byb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9iZW5jaHByZXNzJztcbmltcG9ydCB7b3BlbkJyb3dzZXJ9IGZyb20gJy4vZTJlX3V0aWwnO1xuXG4vLyBOb3RlOiBLZWVwIHRoZSBgbW9kdWxlcy9iZW5jaG1hcmtzL1JFQURNRS5tZGAgZmlsZSBpbiBzeW5jIHdpdGggdGhlIHN1cHBvcnRlZCBvcHRpb25zLlxuY29uc3QgZ2xvYmFsT3B0aW9ucyA9IHtcbiAgc2FtcGxlU2l6ZTogcHJvY2Vzcy5lbnYuUEVSRl9TQU1QTEVfU0laRSB8fCAyMCxcbiAgZm9yY2VHYzogcHJvY2Vzcy5lbnYuUEVSRl9GT1JDRV9HQyA9PT0gJ3RydWUnLFxuICBkcnlSdW46IHByb2Nlc3MuZW52LlBFUkZfRFJZUlVOID09PSAndHJ1ZScsXG59O1xuXG5jb25zdCBydW5uZXIgPSBjcmVhdGVCZW5jaHByZXNzUnVubmVyKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5CZW5jaG1hcmsoY29uZmlnOiB7XG4gIGlkOiBzdHJpbmcsXG4gIHVybDogc3RyaW5nLFxuICBwYXJhbXM6IHtuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnl9W10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuLFxuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgd29yaz86ICgpID0+IHZvaWQsXG4gIHByZXBhcmU/OiAoKSA9PiB2b2lkLFxuICBzZXR1cD86ICgpID0+IHZvaWRcbn0pOiBQcm9taXNlPGFueT4ge1xuICBvcGVuQnJvd3Nlcihjb25maWcpO1xuICBpZiAoY29uZmlnLnNldHVwKSB7XG4gICAgY29uZmlnLnNldHVwKCk7XG4gIH1cbiAgY29uc3QgZGVzY3JpcHRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGNvbmZpZy5wYXJhbXMuZm9yRWFjaCgocGFyYW0pID0+IGRlc2NyaXB0aW9uW3BhcmFtLm5hbWVdID0gcGFyYW0udmFsdWUpO1xuICByZXR1cm4gcnVubmVyLnNhbXBsZSh7XG4gICAgaWQ6IGNvbmZpZy5pZCxcbiAgICBleGVjdXRlOiBjb25maWcud29yayxcbiAgICBwcmVwYXJlOiBjb25maWcucHJlcGFyZSxcbiAgICBtaWNyb01ldHJpY3M6IGNvbmZpZy5taWNyb01ldHJpY3MsXG4gICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE9wdGlvbnMuU0FNUExFX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZToge319XVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpOiBSdW5uZXIge1xuICBsZXQgcnVuSWQgPSBub2RlVXVpZC52MSgpO1xuICBpZiAocHJvY2Vzcy5lbnYuR0lUX1NIQSkge1xuICAgIHJ1bklkID0gcHJvY2Vzcy5lbnYuR0lUX1NIQSArICcgJyArIHJ1bklkO1xuICB9XG4gIGNvbnN0IHJlc3VsdHNGb2xkZXIgPSAnLi9kaXN0L2JlbmNobWFya19yZXN1bHRzJztcbiAgZnMuZW5zdXJlRGlyU3luYyhyZXN1bHRzRm9sZGVyKTtcbiAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICAgIFNlbGVuaXVtV2ViRHJpdmVyQWRhcHRlci5QUk9UUkFDVE9SX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogT3B0aW9ucy5GT1JDRV9HQywgdXNlVmFsdWU6IGdsb2JhbE9wdGlvbnMuZm9yY2VHY30sXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuREVGQVVMVF9ERVNDUklQVElPTiwgdXNlVmFsdWU6IHsncnVuSWQnOiBydW5JZH19LCBKc29uRmlsZVJlcG9ydGVyLlBST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogSnNvbkZpbGVSZXBvcnRlci5QQVRILCB1c2VWYWx1ZTogcmVzdWx0c0ZvbGRlcn1cbiAgXTtcbiAgaWYgKCFnbG9iYWxPcHRpb25zLmRyeVJ1bikge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBWYWxpZGF0b3IsIHVzZUV4aXN0aW5nOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaChcbiAgICAgICAge3Byb3ZpZGU6IFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvci5TQU1QTEVfU0laRSwgdXNlVmFsdWU6IGdsb2JhbE9wdGlvbnMuc2FtcGxlU2l6ZX0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW0NvbnNvbGVSZXBvcnRlciwgSnNvbkZpbGVSZXBvcnRlcl0pKTtcbiAgfSBlbHNlIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogU2l6ZVZhbGlkYXRvcn0pO1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBTaXplVmFsaWRhdG9yLlNBTVBMRV9TSVpFLCB1c2VWYWx1ZTogMX0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW10pKTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aU1ldHJpYy5wcm92aWRlV2l0aChbXSkpO1xuICB9XG4gIHJldHVybiBuZXcgUnVubmVyKHByb3ZpZGVycyk7XG59XG4iXX0=