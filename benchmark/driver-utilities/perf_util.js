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
    function runBenchmark(config) {
        return __awaiter(this, void 0, void 0, function* () {
            e2e_util_2.openBrowser(config);
            if (config.setup) {
                yield config.setup();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxxQ0FBOEI7SUFFOUIsMkZBQWlEO0lBQXpDLGlIQUFBLHFCQUFxQixPQUFBO0lBRTdCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV0QyxvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQXNCLFlBQVksQ0FBQyxNQVNsQzs7WUFDQyxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDaEIsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdEI7WUFDRCxNQUFNLFdBQVcsR0FBeUIsRUFBRSxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDYixPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ3BCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdkIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO2dCQUNqQyxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQzthQUNqRSxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUF2QkQsb0NBdUJDO0lBRUQsU0FBUyxzQkFBc0I7UUFDN0IsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzFCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDdkIsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7U0FDM0M7UUFDRCxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztRQUNqRCxlQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sU0FBUyxHQUFxQjtZQUNsQyxxQ0FBd0IsQ0FBQyxvQkFBb0I7WUFDN0MsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxPQUFPLEVBQUM7WUFDNUQsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQUMsRUFBRSw2QkFBZ0IsQ0FBQyxTQUFTO1lBQzlGLEVBQUMsT0FBTyxFQUFFLDZCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDO1NBQzFELENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN6QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLHNCQUFTLEVBQUUsV0FBVyxFQUFFLHFDQUF3QixFQUFDLENBQUMsQ0FBQztZQUM1RSxTQUFTLENBQUMsSUFBSSxDQUNWLEVBQUMsT0FBTyxFQUFFLHFDQUF3QixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDekYsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLDRCQUFlLEVBQUUsNkJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEY7YUFBTTtZQUNMLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQVMsRUFBRSxXQUFXLEVBQUUsMEJBQWEsRUFBQyxDQUFDLENBQUM7WUFDakUsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSwwQkFBYSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUNsRSxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxJQUFJLG1CQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtta2Rpcn0gZnJvbSAnc2hlbGxqcyc7XG5cbmV4cG9ydCB7dmVyaWZ5Tm9Ccm93c2VyRXJyb3JzfSBmcm9tICcuL2UyZV91dGlsJztcblxuY29uc3Qgbm9kZVV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcblxuaW1wb3J0IHtTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIsIE9wdGlvbnMsIEpzb25GaWxlUmVwb3J0ZXIsIFZhbGlkYXRvciwgUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yLCBDb25zb2xlUmVwb3J0ZXIsIFNpemVWYWxpZGF0b3IsIE11bHRpUmVwb3J0ZXIsIE11bHRpTWV0cmljLCBSdW5uZXIsIFN0YXRpY1Byb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9iZW5jaHByZXNzJztcbmltcG9ydCB7b3BlbkJyb3dzZXJ9IGZyb20gJy4vZTJlX3V0aWwnO1xuXG4vLyBOb3RlOiBLZWVwIHRoZSBgbW9kdWxlcy9iZW5jaG1hcmtzL1JFQURNRS5tZGAgZmlsZSBpbiBzeW5jIHdpdGggdGhlIHN1cHBvcnRlZCBvcHRpb25zLlxuY29uc3QgZ2xvYmFsT3B0aW9ucyA9IHtcbiAgc2FtcGxlU2l6ZTogcHJvY2Vzcy5lbnYuUEVSRl9TQU1QTEVfU0laRSB8fCAyMCxcbiAgZm9yY2VHYzogcHJvY2Vzcy5lbnYuUEVSRl9GT1JDRV9HQyA9PT0gJ3RydWUnLFxuICBkcnlSdW46IHByb2Nlc3MuZW52LlBFUkZfRFJZUlVOID09PSAndHJ1ZScsXG59O1xuXG5jb25zdCBydW5uZXIgPSBjcmVhdGVCZW5jaHByZXNzUnVubmVyKCk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5CZW5jaG1hcmsoY29uZmlnOiB7XG4gIGlkOiBzdHJpbmcsXG4gIHVybDogc3RyaW5nLFxuICBwYXJhbXM6IHtuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnl9W10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuLFxuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgd29yaz86ICgpID0+IHZvaWQsXG4gIHByZXBhcmU/OiAoKSA9PiB2b2lkLFxuICBzZXR1cD86ICgpID0+IHZvaWRcbn0pOiBQcm9taXNlPGFueT4ge1xuICBvcGVuQnJvd3Nlcihjb25maWcpO1xuICBpZiAoY29uZmlnLnNldHVwKSB7XG4gICAgYXdhaXQgY29uZmlnLnNldHVwKCk7XG4gIH1cbiAgY29uc3QgZGVzY3JpcHRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIGNvbmZpZy5wYXJhbXMuZm9yRWFjaCgocGFyYW0pID0+IGRlc2NyaXB0aW9uW3BhcmFtLm5hbWVdID0gcGFyYW0udmFsdWUpO1xuICByZXR1cm4gcnVubmVyLnNhbXBsZSh7XG4gICAgaWQ6IGNvbmZpZy5pZCxcbiAgICBleGVjdXRlOiBjb25maWcud29yayxcbiAgICBwcmVwYXJlOiBjb25maWcucHJlcGFyZSxcbiAgICBtaWNyb01ldHJpY3M6IGNvbmZpZy5taWNyb01ldHJpY3MsXG4gICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE9wdGlvbnMuU0FNUExFX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZToge319XVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpOiBSdW5uZXIge1xuICBsZXQgcnVuSWQgPSBub2RlVXVpZC52MSgpO1xuICBpZiAocHJvY2Vzcy5lbnYuR0lUX1NIQSkge1xuICAgIHJ1bklkID0gcHJvY2Vzcy5lbnYuR0lUX1NIQSArICcgJyArIHJ1bklkO1xuICB9XG4gIGNvbnN0IHJlc3VsdHNGb2xkZXIgPSAnLi9kaXN0L2JlbmNobWFya19yZXN1bHRzJztcbiAgbWtkaXIoJy1wJywgcmVzdWx0c0ZvbGRlcik7XG4gIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICBTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIuUFJPVFJBQ1RPUl9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuRk9SQ0VfR0MsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLmZvcmNlR2N9LFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkRFRkFVTFRfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7J3J1bklkJzogcnVuSWR9fSwgSnNvbkZpbGVSZXBvcnRlci5QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IEpzb25GaWxlUmVwb3J0ZXIuUEFUSCwgdXNlVmFsdWU6IHJlc3VsdHNGb2xkZXJ9XG4gIF07XG4gIGlmICghZ2xvYmFsT3B0aW9ucy5kcnlSdW4pIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goXG4gICAgICAgIHtwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLnNhbXBsZVNpemV9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtDb25zb2xlUmVwb3J0ZXIsIEpzb25GaWxlUmVwb3J0ZXJdKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFNpemVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogU2l6ZVZhbGlkYXRvci5TQU1QTEVfU0laRSwgdXNlVmFsdWU6IDF9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtdKSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlNZXRyaWMucHJvdmlkZVdpdGgoW10pKTtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bm5lcihwcm92aWRlcnMpO1xufVxuIl19