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
import { SeleniumWebDriverAdapter, Options, JsonFileReporter, Validator, RegressionSlopeValidator, ConsoleReporter, SizeValidator, MultiReporter, MultiMetric, Runner, } from '@angular/benchpress';
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
            providers: [{ provide: Options.SAMPLE_DESCRIPTION, useValue: {} }],
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
        { provide: Options.DEFAULT_DESCRIPTION, useValue: { 'runId': runId } },
        JsonFileReporter.PROVIDERS,
        { provide: JsonFileReporter.PATH, useValue: resultsFolder },
    ];
    if (!globalOptions.dryRun) {
        providers.push({ provide: Validator, useExisting: RegressionSlopeValidator });
        providers.push({
            provide: RegressionSlopeValidator.SAMPLE_SIZE,
            useValue: globalOptions.sampleSize,
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYmF6ZWwvYmVuY2htYXJrL2RyaXZlci11dGlsaXRpZXMvcGVyZl91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFFN0IsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRWpELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsd0JBQXdCLEVBQ3hCLE9BQU8sRUFDUCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsYUFBYSxFQUNiLGFBQWEsRUFDYixXQUFXLEVBQ1gsTUFBTSxHQUVQLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV2Qyx5RkFBeUY7QUFDekYsTUFBTSxhQUFhLEdBQUc7SUFDcEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksRUFBRTtJQUM5QyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssTUFBTTtJQUM3QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssTUFBTTtDQUMzQyxDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztBQUV4QyxNQUFNLFVBQWdCLFlBQVksQ0FBQyxFQUNqQyxFQUFFLEVBQ0YsR0FBRyxHQUFHLEVBQUUsRUFDUixNQUFNLEdBQUcsRUFBRSxFQUNYLDRCQUE0QixHQUFHLElBQUksRUFDbkMsWUFBWSxFQUNaLElBQUksRUFDSixPQUFPLEVBQ1AsS0FBSyxHQVVOOztRQUNDLFdBQVcsQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksS0FBSyxFQUFFO1lBQ1QsTUFBTSxLQUFLLEVBQUUsQ0FBQztTQUNmO1FBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ25CLEVBQUU7WUFDRixPQUFPLEVBQUUsSUFBSTtZQUNiLE9BQU87WUFDUCxZQUFZO1lBQ1osU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQztTQUNqRSxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQUE7QUFFRCxTQUFTLHNCQUFzQjtJQUM3QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtRQUN2QixLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztLQUMzQztJQUNELE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBQ2pELFNBQVMsQ0FBQyxhQUFhLEVBQUU7UUFDdkIsU0FBUyxFQUFFLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxTQUFTLEdBQXFCO1FBQ2xDLHdCQUF3QixDQUFDLG9CQUFvQjtRQUM3QyxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFDO1FBQzVELEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQUM7UUFDbEUsZ0JBQWdCLENBQUMsU0FBUztRQUMxQixFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQztLQUMxRCxDQUFDO0lBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7UUFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDLENBQUMsQ0FBQztRQUM1RSxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2IsT0FBTyxFQUFFLHdCQUF3QixDQUFDLFdBQVc7WUFDN0MsUUFBUSxFQUFFLGFBQWEsQ0FBQyxVQUFVO1NBQ25DLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoRjtTQUFNO1FBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFDakUsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge21rZGlyU3luY30gZnJvbSAnZnMnO1xuXG5leHBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbmNvbnN0IG5vZGVVdWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbmltcG9ydCB7XG4gIFNlbGVuaXVtV2ViRHJpdmVyQWRhcHRlcixcbiAgT3B0aW9ucyxcbiAgSnNvbkZpbGVSZXBvcnRlcixcbiAgVmFsaWRhdG9yLFxuICBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IsXG4gIENvbnNvbGVSZXBvcnRlcixcbiAgU2l6ZVZhbGlkYXRvcixcbiAgTXVsdGlSZXBvcnRlcixcbiAgTXVsdGlNZXRyaWMsXG4gIFJ1bm5lcixcbiAgU3RhdGljUHJvdmlkZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2JlbmNocHJlc3MnO1xuaW1wb3J0IHtvcGVuQnJvd3Nlcn0gZnJvbSAnLi9lMmVfdXRpbCc7XG5cbi8vIE5vdGU6IEtlZXAgdGhlIGBtb2R1bGVzL2JlbmNobWFya3MvUkVBRE1FLm1kYCBmaWxlIGluIHN5bmMgd2l0aCB0aGUgc3VwcG9ydGVkIG9wdGlvbnMuXG5jb25zdCBnbG9iYWxPcHRpb25zID0ge1xuICBzYW1wbGVTaXplOiBwcm9jZXNzLmVudi5QRVJGX1NBTVBMRV9TSVpFIHx8IDIwLFxuICBmb3JjZUdjOiBwcm9jZXNzLmVudi5QRVJGX0ZPUkNFX0dDID09PSAndHJ1ZScsXG4gIGRyeVJ1bjogcHJvY2Vzcy5lbnYuUEVSRl9EUllSVU4gPT09ICd0cnVlJyxcbn07XG5cbmNvbnN0IHJ1bm5lciA9IGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJlbmNobWFyayh7XG4gIGlkLFxuICB1cmwgPSAnJyxcbiAgcGFyYW1zID0gW10sXG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24gPSB0cnVlLFxuICBtaWNyb01ldHJpY3MsXG4gIHdvcmssXG4gIHByZXBhcmUsXG4gIHNldHVwLFxufToge1xuICBpZDogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIHBhcmFtcz86IHtuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnl9W107XG4gIGlnbm9yZUJyb3dzZXJTeW5jaHJvbml6YXRpb24/OiBib29sZWFuO1xuICBtaWNyb01ldHJpY3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgd29yaz86ICgoKSA9PiB2b2lkKSB8ICgoKSA9PiBQcm9taXNlPHVua25vd24+KTtcbiAgcHJlcGFyZT86ICgoKSA9PiB2b2lkKSB8ICgoKSA9PiBQcm9taXNlPHVua25vd24+KTtcbiAgc2V0dXA/OiAoKCkgPT4gdm9pZCkgfCAoKCkgPT4gUHJvbWlzZTx1bmtub3duPik7XG59KTogUHJvbWlzZTxhbnk+IHtcbiAgb3BlbkJyb3dzZXIoe3VybCwgcGFyYW1zLCBpZ25vcmVCcm93c2VyU3luY2hyb25pemF0aW9ufSk7XG4gIGlmIChzZXR1cCkge1xuICAgIGF3YWl0IHNldHVwKCk7XG4gIH1cbiAgcmV0dXJuIHJ1bm5lci5zYW1wbGUoe1xuICAgIGlkLFxuICAgIGV4ZWN1dGU6IHdvcmssXG4gICAgcHJlcGFyZSxcbiAgICBtaWNyb01ldHJpY3MsXG4gICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE9wdGlvbnMuU0FNUExFX0RFU0NSSVBUSU9OLCB1c2VWYWx1ZToge319XSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJlbmNocHJlc3NSdW5uZXIoKTogUnVubmVyIHtcbiAgbGV0IHJ1bklkID0gbm9kZVV1aWQudjEoKTtcbiAgaWYgKHByb2Nlc3MuZW52LkdJVF9TSEEpIHtcbiAgICBydW5JZCA9IHByb2Nlc3MuZW52LkdJVF9TSEEgKyAnICcgKyBydW5JZDtcbiAgfVxuICBjb25zdCByZXN1bHRzRm9sZGVyID0gJy4vZGlzdC9iZW5jaG1hcmtfcmVzdWx0cyc7XG4gIG1rZGlyU3luYyhyZXN1bHRzRm9sZGVyLCB7XG4gICAgcmVjdXJzaXZlOiB0cnVlLFxuICB9KTtcbiAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICAgIFNlbGVuaXVtV2ViRHJpdmVyQWRhcHRlci5QUk9UUkFDVE9SX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogT3B0aW9ucy5GT1JDRV9HQywgdXNlVmFsdWU6IGdsb2JhbE9wdGlvbnMuZm9yY2VHY30sXG4gICAge3Byb3ZpZGU6IE9wdGlvbnMuREVGQVVMVF9ERVNDUklQVElPTiwgdXNlVmFsdWU6IHsncnVuSWQnOiBydW5JZH19LFxuICAgIEpzb25GaWxlUmVwb3J0ZXIuUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBKc29uRmlsZVJlcG9ydGVyLlBBVEgsIHVzZVZhbHVlOiByZXN1bHRzRm9sZGVyfSxcbiAgXTtcbiAgaWYgKCFnbG9iYWxPcHRpb25zLmRyeVJ1bikge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBWYWxpZGF0b3IsIHVzZUV4aXN0aW5nOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3J9KTtcbiAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICBwcm92aWRlOiBSZWdyZXNzaW9uU2xvcGVWYWxpZGF0b3IuU0FNUExFX1NJWkUsXG4gICAgICB1c2VWYWx1ZTogZ2xvYmFsT3B0aW9ucy5zYW1wbGVTaXplLFxuICAgIH0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW0NvbnNvbGVSZXBvcnRlciwgSnNvbkZpbGVSZXBvcnRlcl0pKTtcbiAgfSBlbHNlIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogVmFsaWRhdG9yLCB1c2VFeGlzdGluZzogU2l6ZVZhbGlkYXRvcn0pO1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBTaXplVmFsaWRhdG9yLlNBTVBMRV9TSVpFLCB1c2VWYWx1ZTogMX0pO1xuICAgIHByb3ZpZGVycy5wdXNoKE11bHRpUmVwb3J0ZXIucHJvdmlkZVdpdGgoW10pKTtcbiAgICBwcm92aWRlcnMucHVzaChNdWx0aU1ldHJpYy5wcm92aWRlV2l0aChbXSkpO1xuICB9XG4gIHJldHVybiBuZXcgUnVubmVyKHByb3ZpZGVycyk7XG59XG4iXX0=