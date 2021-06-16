/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends } from "tslib";
/**
 * Add a --dry-run flag to the available options for the yargs argv object. When present, sets an
 * environment variable noting dry run mode.
 */
export function addDryRunFlag(args) {
    return args.option('dry-run', {
        type: 'boolean',
        default: false,
        description: 'Whether to do a dry run',
        coerce: function (dryRun) {
            if (dryRun) {
                process.env['DRY_RUN'] = '1';
            }
            return dryRun;
        }
    });
}
/** Whether the current environment is in dry run mode. */
export function isDryRun() {
    return process.env['DRY_RUN'] !== undefined;
}
/** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
var DryRunError = /** @class */ (function (_super) {
    __extends(DryRunError, _super);
    function DryRunError() {
        var _this = _super.call(this, 'Cannot call this function in dryRun mode.') || this;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(_this, DryRunError.prototype);
        return _this;
    }
    return DryRunError;
}(Error));
export { DryRunError };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJ5LXJ1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9kcnktcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFJLElBQWE7SUFDNUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQXFCLEVBQUU7UUFDeEMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFdBQVcsRUFBRSx5QkFBeUI7UUFDdEMsTUFBTSxFQUFFLFVBQUMsTUFBZTtZQUN0QixJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUM5QjtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sVUFBVSxRQUFRO0lBQ3RCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDOUMsQ0FBQztBQUVELDhGQUE4RjtBQUM5RjtJQUFpQywrQkFBSztJQUNwQztRQUFBLFlBQ0Usa0JBQU0sMkNBQTJDLENBQUMsU0FLbkQ7UUFKQyx5RkFBeUY7UUFDekYsaUNBQWlDO1FBQ2pDLGlIQUFpSDtRQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ3JELENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMsQUFSRCxDQUFpQyxLQUFLLEdBUXJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuXG4vKipcbiAqIEFkZCBhIC0tZHJ5LXJ1biBmbGFnIHRvIHRoZSBhdmFpbGFibGUgb3B0aW9ucyBmb3IgdGhlIHlhcmdzIGFyZ3Ygb2JqZWN0LiBXaGVuIHByZXNlbnQsIHNldHMgYW5cbiAqIGVudmlyb25tZW50IHZhcmlhYmxlIG5vdGluZyBkcnkgcnVuIG1vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREcnlSdW5GbGFnPFQ+KGFyZ3M6IEFyZ3Y8VD4pIHtcbiAgcmV0dXJuIGFyZ3Mub3B0aW9uKCdkcnktcnVuJyBhcyAnZHJ5UnVuJywge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gZG8gYSBkcnkgcnVuJyxcbiAgICBjb2VyY2U6IChkcnlSdW46IGJvb2xlYW4pID0+IHtcbiAgICAgIGlmIChkcnlSdW4pIHtcbiAgICAgICAgcHJvY2Vzcy5lbnZbJ0RSWV9SVU4nXSA9ICcxJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBkcnlSdW47XG4gICAgfVxuICB9KTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZHJ5IHJ1biBtb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRHJ5UnVuKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnZbJ0RSWV9SVU4nXSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKiogRXJyb3IgdG8gYmUgdGhyb3duIHdoZW4gYSBmdW5jdGlvbiBvciBtZXRob2QgaXMgY2FsbGVkIGluIGRyeVJ1biBtb2RlIGFuZCBzaG91bGRuJ3QgYmUuICovXG5leHBvcnQgY2xhc3MgRHJ5UnVuRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdDYW5ub3QgY2FsbCB0aGlzIGZ1bmN0aW9uIGluIGRyeVJ1biBtb2RlLicpO1xuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5IGxvc3QgZHVlIHRvXG4gICAgLy8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgRHJ5UnVuRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuIl19