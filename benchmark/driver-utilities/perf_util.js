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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRkFBaUQ7SUFBekMsaUhBQUEscUJBQXFCLE9BQUE7SUFFN0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RDLCtCQUErQjtJQUUvQixvREFBaU47SUFDak4sNkZBQXVDO0lBRXZDLHlGQUF5RjtJQUN6RixNQUFNLGFBQWEsR0FBRztRQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO1FBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0tBQzNDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0lBRXhDLFNBQXNCLFlBQVksQ0FBQyxNQVNsQzs7WUFDQyxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDaEIsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdEI7WUFDRCxNQUFNLFdBQVcsR0FBeUIsRUFBRSxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDYixPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ3BCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdkIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO2dCQUNqQyxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQzthQUNqRSxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUF2QkQsb0NBdUJDO0lBRUQsU0FBUyxzQkFBc0I7UUFDN0IsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzFCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDdkIsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7U0FDM0M7UUFDRCxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztRQUNqRCxFQUFFLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sU0FBUyxHQUFxQjtZQUNsQyxxQ0FBd0IsQ0FBQyxvQkFBb0I7WUFDN0MsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxPQUFPLEVBQUM7WUFDNUQsRUFBQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQUMsRUFBRSw2QkFBZ0IsQ0FBQyxTQUFTO1lBQzlGLEVBQUMsT0FBTyxFQUFFLDZCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDO1NBQzFELENBQUM7UUFDRixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN6QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLHNCQUFTLEVBQUUsV0FBVyxFQUFFLHFDQUF3QixFQUFDLENBQUMsQ0FBQztZQUM1RSxTQUFTLENBQUMsSUFBSSxDQUNWLEVBQUMsT0FBTyxFQUFFLHFDQUF3QixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDekYsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLDRCQUFlLEVBQUUsNkJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEY7YUFBTTtZQUNMLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQVMsRUFBRSxXQUFXLEVBQUUsMEJBQWEsRUFBQyxDQUFDLENBQUM7WUFDakUsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSwwQkFBYSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUNsRSxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxJQUFJLG1CQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHt2ZXJpZnlOb0Jyb3dzZXJFcnJvcnN9IGZyb20gJy4vZTJlX3V0aWwnO1xuXG5jb25zdCBub2RlVXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuXG5pbXBvcnQge1NlbGVuaXVtV2ViRHJpdmVyQWRhcHRlciwgT3B0aW9ucywgSnNvbkZpbGVSZXBvcnRlciwgVmFsaWRhdG9yLCBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IsIENvbnNvbGVSZXBvcnRlciwgU2l6ZVZhbGlkYXRvciwgTXVsdGlSZXBvcnRlciwgTXVsdGlNZXRyaWMsIFJ1bm5lciwgU3RhdGljUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2JlbmNocHJlc3MnO1xuaW1wb3J0IHtvcGVuQnJvd3Nlcn0gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbi8vIE5vdGU6IEtlZXAgdGhlIGBtb2R1bGVzL2JlbmNobWFya3MvUkVBRE1FLm1kYCBmaWxlIGluIHN5bmMgd2l0aCB0aGUgc3VwcG9ydGVkIG9wdGlvbnMuXG5jb25zdCBnbG9iYWxPcHRpb25zID0ge1xuICBzYW1wbGVTaXplOiBwcm9jZXNzLmVudi5QRVJGX1NBTVBMRV9TSVpFIHx8IDIwLFxuICBmb3JjZUdjOiBwcm9jZXNzLmVudi5QRVJGX0ZPUkNFX0dDID09PSAndHJ1ZScsXG4gIGRyeVJ1bjogcHJvY2Vzcy5lbnYuUEVSRl9EUllSVU4gPT09ICd0cnVlJyxcbn07XG5cbmNvbnN0IHJ1bm5lciA9IGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJlbmNobWFyayhjb25maWc6IHtcbiAgaWQ6IHN0cmluZyxcbiAgdXJsOiBzdHJpbmcsXG4gIHBhcmFtczoge25hbWU6IHN0cmluZywgdmFsdWU6IGFueX1bXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbj86IGJvb2xlYW4sXG4gIG1pY3JvTWV0cmljcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICB3b3JrPzogKCkgPT4gdm9pZCxcbiAgcHJlcGFyZT86ICgpID0+IHZvaWQsXG4gIHNldHVwPzogKCkgPT4gdm9pZFxufSk6IFByb21pc2U8YW55PiB7XG4gIG9wZW5Ccm93c2VyKGNvbmZpZyk7XG4gIGlmIChjb25maWcuc2V0dXApIHtcbiAgICBhd2FpdCBjb25maWcuc2V0dXAoKTtcbiAgfVxuICBjb25zdCBkZXNjcmlwdGlvbjoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgY29uZmlnLnBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4gZGVzY3JpcHRpb25bcGFyYW0ubmFtZV0gPSBwYXJhbS52YWx1ZSk7XG4gIHJldHVybiBydW5uZXIuc2FtcGxlKHtcbiAgICBpZDogY29uZmlnLmlkLFxuICAgIGV4ZWN1dGU6IGNvbmZpZy53b3JrLFxuICAgIHByZXBhcmU6IGNvbmZpZy5wcmVwYXJlLFxuICAgIG1pY3JvTWV0cmljczogY29uZmlnLm1pY3JvTWV0cmljcyxcbiAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogT3B0aW9ucy5TQU1QTEVfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7fX1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCZW5jaHByZXNzUnVubmVyKCk6IFJ1bm5lciB7XG4gIGxldCBydW5JZCA9IG5vZGVVdWlkLnYxKCk7XG4gIGlmIChwcm9jZXNzLmVudi5HSVRfU0hBKSB7XG4gICAgcnVuSWQgPSBwcm9jZXNzLmVudi5HSVRfU0hBICsgJyAnICsgcnVuSWQ7XG4gIH1cbiAgY29uc3QgcmVzdWx0c0ZvbGRlciA9ICcuL2Rpc3QvYmVuY2htYXJrX3Jlc3VsdHMnO1xuICBmcy5lbnN1cmVEaXJTeW5jKHJlc3VsdHNGb2xkZXIpO1xuICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXG4gICAgU2VsZW5pdW1XZWJEcml2ZXJBZGFwdGVyLlBST1RSQUNUT1JfUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkZPUkNFX0dDLCB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5mb3JjZUdjfSxcbiAgICB7cHJvdmlkZTogT3B0aW9ucy5ERUZBVUxUX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZTogeydydW5JZCc6IHJ1bklkfX0sIEpzb25GaWxlUmVwb3J0ZXIuUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBKc29uRmlsZVJlcG9ydGVyLlBBVEgsIHVzZVZhbHVlOiByZXN1bHRzRm9sZGVyfVxuICBdO1xuICBpZiAoIWdsb2JhbE9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvcn0pO1xuICAgIHByb3ZpZGVycy5wdXNoKFxuICAgICAgICB7cHJvdmlkZTogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yLlNBTVBMRV9TSVpFLCB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5zYW1wbGVTaXplfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlSZXBvcnRlci5wcm92aWRlV2l0aChbQ29uc29sZVJlcG9ydGVyLCBKc29uRmlsZVJlcG9ydGVyXSkpO1xuICB9IGVsc2Uge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBWYWxpZGF0b3IsIHVzZUV4aXN0aW5nOiBTaXplVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFNpemVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiAxfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlSZXBvcnRlci5wcm92aWRlV2l0aChbXSkpO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpTWV0cmljLnByb3ZpZGVXaXRoKFtdKSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBSdW5uZXIocHJvdmlkZXJzKTtcbn1cbiJdfQ==