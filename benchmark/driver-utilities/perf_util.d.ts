/// <amd-module name="@angular/dev-infra-private/benchmark/driver-utilities/perf_util" />
export { verifyNoBrowserErrors } from './e2e_util';
export declare function runBenchmark({ id, url, params, ignoreBrowserSynchronization, microMetrics, work, prepare, setup, }: {
    id: string;
    url?: string;
    params?: {
        name: string;
        value: any;
    }[];
    ignoreBrowserSynchronization?: boolean;
    microMetrics?: {
        [key: string]: string;
    };
    work?: (() => void) | (() => Promise<unknown>);
    prepare?: (() => void) | (() => Promise<unknown>);
    setup?: (() => void) | (() => Promise<unknown>);
}): Promise<any>;
