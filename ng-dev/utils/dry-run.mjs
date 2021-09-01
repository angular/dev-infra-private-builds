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
    }
}
exports.DryRunError = DryRunError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJ5LXJ1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9kcnktcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlIOzs7R0FHRztBQUNILFNBQWdCLGFBQWEsQ0FBSSxJQUFhO0lBQzVDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFxQixFQUFFO1FBQ3hDLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxXQUFXLEVBQUUseUJBQXlCO1FBQ3RDLE1BQU0sRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFO1lBQzFCLElBQUksTUFBTSxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFaRCxzQ0FZQztBQUVELDBEQUEwRDtBQUMxRCxTQUFnQixRQUFRO0lBQ3RCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDOUMsQ0FBQztBQUZELDRCQUVDO0FBRUQsOEZBQThGO0FBQzlGLE1BQWEsV0FBWSxTQUFRLEtBQUs7SUFDcEM7UUFDRSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0Y7QUFKRCxrQ0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3Z9IGZyb20gJ3lhcmdzJztcblxuLyoqXG4gKiBBZGQgYSAtLWRyeS1ydW4gZmxhZyB0byB0aGUgYXZhaWxhYmxlIG9wdGlvbnMgZm9yIHRoZSB5YXJncyBhcmd2IG9iamVjdC4gV2hlbiBwcmVzZW50LCBzZXRzIGFuXG4gKiBlbnZpcm9ubWVudCB2YXJpYWJsZSBub3RpbmcgZHJ5IHJ1biBtb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRHJ5UnVuRmxhZzxUPihhcmdzOiBBcmd2PFQ+KSB7XG4gIHJldHVybiBhcmdzLm9wdGlvbignZHJ5LXJ1bicgYXMgJ2RyeVJ1bicsIHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIGRvIGEgZHJ5IHJ1bicsXG4gICAgY29lcmNlOiAoZHJ5UnVuOiBib29sZWFuKSA9PiB7XG4gICAgICBpZiAoZHJ5UnVuKSB7XG4gICAgICAgIHByb2Nlc3MuZW52WydEUllfUlVOJ10gPSAnMSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZHJ5UnVuO1xuICAgIH0sXG4gIH0pO1xufVxuXG4vKiogV2hldGhlciB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBpbiBkcnkgcnVuIG1vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEcnlSdW4oKTogYm9vbGVhbiB7XG4gIHJldHVybiBwcm9jZXNzLmVudlsnRFJZX1JVTiddICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKiBFcnJvciB0byBiZSB0aHJvd24gd2hlbiBhIGZ1bmN0aW9uIG9yIG1ldGhvZCBpcyBjYWxsZWQgaW4gZHJ5UnVuIG1vZGUgYW5kIHNob3VsZG4ndCBiZS4gKi9cbmV4cG9ydCBjbGFzcyBEcnlSdW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ0Nhbm5vdCBjYWxsIHRoaXMgZnVuY3Rpb24gaW4gZHJ5UnVuIG1vZGUuJyk7XG4gIH1cbn1cbiJdfQ==