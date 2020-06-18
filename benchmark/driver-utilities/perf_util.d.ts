/// <amd-module name="@angular/dev-infra-private/benchmark/driver-utilities/perf_util" />
export { verifyNoBrowserErrors } from './e2e_util';
export declare function runBenchmark(config: {
    id: string;
    url: string;
    params: {
        name: string;
        value: any;
    }[];
    ignoreBrowserSynchronization?: boolean;
    microMetrics?: {
        [key: string]: string;
    };
    work?: () => void;
    prepare?: () => void;
    setup?: () => void;
}): Promise<any>;
