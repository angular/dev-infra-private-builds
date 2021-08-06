"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DryRunError = exports.isDryRun = exports.addDryRunFlag = void 0;
/**
 * Add a --dry-run flag to the available options for the yargs argv object. When present, sets an
 * environment variable noting dry run mode.
 */
function addDryRunFlag(args) {
    return args.option('dry-run', {
        type: 'boolean',
        default: false,
        description: 'Whether to do a dry run',
        coerce: (dryRun) => {
            if (dryRun) {
                process.env['DRY_RUN'] = '1';
            }
            return dryRun;
        },
    });
}
exports.addDryRunFlag = addDryRunFlag;
/** Whether the current environment is in dry run mode. */
function isDryRun() {
    return process.env['DRY_RUN'] !== undefined;
}
exports.isDryRun = isDryRun;
/** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
class DryRunError extends Error {
    constructor() {
        super('Cannot call this function in dryRun mode.');
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, DryRunError.prototype);
    }
}
exports.DryRunError = DryRunError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJ5LXJ1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9kcnktcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlIOzs7R0FHRztBQUNILFNBQWdCLGFBQWEsQ0FBSSxJQUFhO0lBQzVDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFxQixFQUFFO1FBQ3hDLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxXQUFXLEVBQUUseUJBQXlCO1FBQ3RDLE1BQU0sRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFO1lBQzFCLElBQUksTUFBTSxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFaRCxzQ0FZQztBQUVELDBEQUEwRDtBQUMxRCxTQUFnQixRQUFRO0lBQ3RCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDOUMsQ0FBQztBQUZELDRCQUVDO0FBRUQsOEZBQThGO0FBQzlGLE1BQWEsV0FBWSxTQUFRLEtBQUs7SUFDcEM7UUFDRSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUNuRCx5RkFBeUY7UUFDekYsaUNBQWlDO1FBQ2pDLGlIQUFpSDtRQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUNGO0FBUkQsa0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd2fSBmcm9tICd5YXJncyc7XG5cbi8qKlxuICogQWRkIGEgLS1kcnktcnVuIGZsYWcgdG8gdGhlIGF2YWlsYWJsZSBvcHRpb25zIGZvciB0aGUgeWFyZ3MgYXJndiBvYmplY3QuIFdoZW4gcHJlc2VudCwgc2V0cyBhblxuICogZW52aXJvbm1lbnQgdmFyaWFibGUgbm90aW5nIGRyeSBydW4gbW9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERyeVJ1bkZsYWc8VD4oYXJnczogQXJndjxUPikge1xuICByZXR1cm4gYXJncy5vcHRpb24oJ2RyeS1ydW4nIGFzICdkcnlSdW4nLCB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0byBkbyBhIGRyeSBydW4nLFxuICAgIGNvZXJjZTogKGRyeVJ1bjogYm9vbGVhbikgPT4ge1xuICAgICAgaWYgKGRyeVJ1bikge1xuICAgICAgICBwcm9jZXNzLmVudlsnRFJZX1JVTiddID0gJzEnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRyeVJ1bjtcbiAgICB9LFxuICB9KTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZHJ5IHJ1biBtb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRHJ5UnVuKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnZbJ0RSWV9SVU4nXSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKiogRXJyb3IgdG8gYmUgdGhyb3duIHdoZW4gYSBmdW5jdGlvbiBvciBtZXRob2QgaXMgY2FsbGVkIGluIGRyeVJ1biBtb2RlIGFuZCBzaG91bGRuJ3QgYmUuICovXG5leHBvcnQgY2xhc3MgRHJ5UnVuRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdDYW5ub3QgY2FsbCB0aGlzIGZ1bmN0aW9uIGluIGRyeVJ1biBtb2RlLicpO1xuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5IGxvc3QgZHVlIHRvXG4gICAgLy8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgRHJ5UnVuRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuIl19