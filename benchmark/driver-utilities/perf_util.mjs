var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { mkdirSync } from 'fs';
export { verifyNoBrowserErrors } from './e2e_util';
const nodeUuid = require('node-uuid');
import { SeleniumWebDriverAdapter, Options, JsonFileReporter, Validator, RegressionSlopeValidator, ConsoleReporter, SizeValidator, MultiReporter, MultiMetric, Runner } from '@angular/benchpress';
import { openBrowser } from './e2e_util';
// Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
const globalOptions = {
    sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
    forceGc: process.env.PERF_FORCE_GC === 'true',
    dryRun: process.env.PERF_DRYRUN === 'true',
};
const runner = createBenchpressRunner();
export function runBenchmark({ id, url = '', params = [], ignoreBrowserSynchronization = true, microMetrics, work, prepare, setup, }) {
    return __awaiter(this, void 0, void 0, function* () {
        openBrowser({ url, params, ignoreBrowserSynchronization });
        if (setup) {
            yield setup();
        }
        return runner.sample({
            id,
            execute: work,
            prepare,
            microMetrics,
            providers: [{ provide: Options.SAMPLE_DESCRIPTION, useValue: {} }]
        });
    });
}
function createBenchpressRunner() {
    let runId = nodeUuid.v1();
    if (process.env.GIT_SHA) {
        runId = process.env.GIT_SHA + ' ' + runId;
    }
    const resultsFolder = './dist/benchmark_results';
    mkdirSync(resultsFolder, {
        recursive: true,
    });
    const providers = [
        SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
        { provide: Options.FORCE_GC, useValue: globalOptions.forceGc },
        { provide: Options.DEFAULT_DESCRIPTION, useValue: { 'runId': runId } }, JsonFileReporter.PROVIDERS,
        { provide: JsonFileReporter.PATH, useValue: resultsFolder }
    ];
    if (!globalOptions.dryRun) {
        providers.push({ provide: Validator, useExisting: RegressionSlopeValidator });
        providers.push({ provide: RegressionSlopeValidator.SAMPLE_SIZE, useValue: globalOptions.sampleSize });
        providers.push(MultiReporter.provideWith([ConsoleReporter, JsonFileReporter]));
    }
    else {
        providers.push({ provide: Validator, useExisting: SizeValidator });
        providers.push({ provide: SizeValidator.SAMPLE_SIZE, useValue: 1 });
        providers.push(MultiReporter.provideWith([]));
        providers.push(MultiMetric.provideWith([]));
    }
    return new Runner(providers);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2JlbmNobWFyay9kcml2ZXItdXRpbGl0aWVzL3BlcmZfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBRTdCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVqRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFdEMsT0FBTyxFQUFDLHdCQUF3QixFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNqTixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXZDLHlGQUF5RjtBQUN6RixNQUFNLGFBQWEsR0FBRztJQUNwQixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO0lBQzlDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxNQUFNO0lBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNO0NBQzNDLENBQUM7QUFFRixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0FBRXhDLE1BQU0sVUFBZ0IsWUFBWSxDQUFDLEVBQ2pDLEVBQUUsRUFDRixHQUFHLEdBQUcsRUFBRSxFQUNSLE1BQU0sR0FBRyxFQUFFLEVBQ1gsNEJBQTRCLEdBQUcsSUFBSSxFQUNuQyxZQUFZLEVBQ1osSUFBSSxFQUNKLE9BQU8sRUFDUCxLQUFLLEdBVU47O1FBQ0MsV0FBVyxDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSw0QkFBNEIsRUFBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxLQUFLLEVBQUU7WUFDVCxNQUFNLEtBQUssRUFBRSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbkIsRUFBRTtZQUNGLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTztZQUNQLFlBQVk7WUFDWixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO1NBQ2pFLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQUVELFNBQVMsc0JBQXNCO0lBQzdCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1FBQ3ZCLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO0tBQzNDO0lBQ0QsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7SUFDakQsU0FBUyxDQUFDLGFBQWEsRUFBRTtRQUN2QixTQUFTLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLFNBQVMsR0FBcUI7UUFDbEMsd0JBQXdCLENBQUMsb0JBQW9CO1FBQzdDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxPQUFPLEVBQUM7UUFDNUQsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsRUFBQyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7UUFDOUYsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7S0FDMUQsQ0FBQztJQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1FBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQyxDQUFDLENBQUM7UUFDNUUsU0FBUyxDQUFDLElBQUksQ0FDVixFQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQ3pGLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoRjtTQUFNO1FBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFDakUsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge21rZGlyU3luY30gZnJvbSAnZnMnO1xuXG5leHBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbmNvbnN0IG5vZGVVdWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbmltcG9ydCB7U2VsZW5pdW1XZWJEcml2ZXJBZGFwdGVyLCBPcHRpb25zLCBKc29uRmlsZVJlcG9ydGVyLCBWYWxpZGF0b3IsIFJlZ3Jlc3Npb25TbG9wZVZhbGlkYXRvciwgQ29uc29sZVJlcG9ydGVyLCBTaXplVmFsaWRhdG9yLCBNdWx0aVJlcG9ydGVyLCBNdWx0aU1ldHJpYywgUnVubmVyLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvYmVuY2hwcmVzcyc7XG5pbXBvcnQge29wZW5Ccm93c2VyfSBmcm9tICcuL2UyZV91dGlsJztcblxuLy8gTm90ZTogS2VlcCB0aGUgYG1vZHVsZXMvYmVuY2htYXJrcy9SRUFETUUubWRgIGZpbGUgaW4gc3luYyB3aXRoIHRoZSBzdXBwb3J0ZWQgb3B0aW9ucy5cbmNvbnN0IGdsb2JhbE9wdGlvbnMgPSB7XG4gIHNhbXBsZVNpemU6IHByb2Nlc3MuZW52LlBFUkZfU0FNUExFX1NJWkUgfHwgMjAsXG4gIGZvcmNlR2M6IHByb2Nlc3MuZW52LlBFUkZfRk9SQ0VfR0MgPT09ICd0cnVlJyxcbiAgZHJ5UnVuOiBwcm9jZXNzLmVudi5QRVJGX0RSWVJVTiA9PT0gJ3RydWUnLFxufTtcblxuY29uc3QgcnVubmVyID0gY3JlYXRlQmVuY2hwcmVzc1J1bm5lcigpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQmVuY2htYXJrKHtcbiAgaWQsXG4gIHVybCA9ICcnLFxuICBwYXJhbXMgPSBbXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbiA9IHRydWUsXG4gIG1pY3JvTWV0cmljcyxcbiAgd29yayxcbiAgcHJlcGFyZSxcbiAgc2V0dXAsXG59OiB7XG4gIGlkOiBzdHJpbmcsXG4gIHVybD86IHN0cmluZyxcbiAgcGFyYW1zPzoge25hbWU6IHN0cmluZywgdmFsdWU6IGFueX1bXSxcbiAgaWdub3JlQnJvd3NlclN5bmNocm9uaXphdGlvbj86IGJvb2xlYW4sXG4gIG1pY3JvTWV0cmljcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICB3b3JrPzogKCgpID0+IHZvaWQpfCgoKSA9PiBQcm9taXNlPHVua25vd24+KSxcbiAgcHJlcGFyZT86ICgoKSA9PiB2b2lkKXwoKCkgPT4gUHJvbWlzZTx1bmtub3duPiksXG4gIHNldHVwPzogKCgpID0+IHZvaWQpfCgoKSA9PiBQcm9taXNlPHVua25vd24+KSxcbn0pOiBQcm9taXNlPGFueT4ge1xuICBvcGVuQnJvd3Nlcih7dXJsLCBwYXJhbXMsIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb259KTtcbiAgaWYgKHNldHVwKSB7XG4gICAgYXdhaXQgc2V0dXAoKTtcbiAgfVxuICByZXR1cm4gcnVubmVyLnNhbXBsZSh7XG4gICAgaWQsXG4gICAgZXhlY3V0ZTogd29yayxcbiAgICBwcmVwYXJlLFxuICAgIG1pY3JvTWV0cmljcyxcbiAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogT3B0aW9ucy5TQU1QTEVfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7fX1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCZW5jaHByZXNzUnVubmVyKCk6IFJ1bm5lciB7XG4gIGxldCBydW5JZCA9IG5vZGVVdWlkLnYxKCk7XG4gIGlmIChwcm9jZXNzLmVudi5HSVRfU0hBKSB7XG4gICAgcnVuSWQgPSBwcm9jZXNzLmVudi5HSVRfU0hBICsgJyAnICsgcnVuSWQ7XG4gIH1cbiAgY29uc3QgcmVzdWx0c0ZvbGRlciA9ICcuL2Rpc3QvYmVuY2htYXJrX3Jlc3VsdHMnO1xuICBta2RpclN5bmMocmVzdWx0c0ZvbGRlciwge1xuICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcbiAgfSk7XG4gIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICBTZWxlbml1bVdlYkRyaXZlckFkYXB0ZXIuUFJPVFJBQ1RPUl9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuRk9SQ0VfR0MsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLmZvcmNlR2N9LFxuICAgIHtwcm92aWRlOiBPcHRpb25zLkRFRkFVTFRfREVTQ1JJUFRJT04sIHVzZVZhbHVlOiB7J3J1bklkJzogcnVuSWR9fSwgSnNvbkZpbGVSZXBvcnRlci5QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IEpzb25GaWxlUmVwb3J0ZXIuUEFUSCwgdXNlVmFsdWU6IHJlc3VsdHNGb2xkZXJ9XG4gIF07XG4gIGlmICghZ2xvYmFsT3B0aW9ucy5kcnlSdW4pIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogUmVncmVzc2lvblNsb3BlVmFsaWRhdG9yfSk7XG4gICAgcHJvdmlkZXJzLnB1c2goXG4gICAgICAgIHtwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsIHVzZVZhbHVlOiBnbG9iYWxPcHRpb25zLnNhbXBsZVNpemV9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtDb25zb2xlUmVwb3J0ZXIsIEpzb25GaWxlUmVwb3J0ZXJdKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvdmlkZXJzLnB1c2goe3Byb3ZpZGU6IFZhbGlkYXRvciwgdXNlRXhpc3Rpbmc6IFNpemVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogU2l6ZVZhbGlkYXRvci5TQU1QTEVfU0laRSwgdXNlVmFsdWU6IDF9KTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aVJlcG9ydGVyLnByb3ZpZGVXaXRoKFtdKSk7XG4gICAgcHJvdmlkZXJzLnB1c2goTXVsdGlNZXRyaWMucHJvdmlkZVdpdGgoW10pKTtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bm5lcihwcm92aWRlcnMpO1xufVxuIl19