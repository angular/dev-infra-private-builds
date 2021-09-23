"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatherTestResultsModule = void 0;
const _1 = require(".");
const console_1 = require("../../utils/console");
/** Yargs command builder for the command. */
function builder(argv) {
    return argv.option('force', {
        type: 'boolean',
        default: false,
        description: 'Whether to force the command to run, ignoring the CI environment check',
    });
}
/** Yargs command handler for the command. */
async function handler({ force }) {
    if (force === false && process.env['CI'] === undefined) {
        (0, console_1.error)((0, console_1.red)('Aborting, `gather-test-results` is only meant to be run on CI.'));
        process.exit(1);
    }
    (0, _1.copyTestResultFiles)();
}
/** CLI command module. */
exports.GatherTestResultsModule = {
    builder,
    handler,
    command: 'gather-test-results',
    describe: 'Gather test result files into single directory for consumption by CircleCI',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NpL2dhdGhlci10ZXN0LXJlc3VsdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILHdCQUFzQztBQUN0QyxpREFBK0M7QUFNL0MsNkNBQTZDO0FBQzdDLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUMxQixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsV0FBVyxFQUFFLHdFQUF3RTtLQUN0RixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsNkNBQTZDO0FBQzdDLEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxLQUFLLEVBQXFCO0lBQ2hELElBQUksS0FBSyxLQUFLLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUN0RCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyxnRUFBZ0UsQ0FBQyxDQUFDLENBQUM7UUFDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUNELElBQUEsc0JBQW1CLEdBQUUsQ0FBQztBQUN4QixDQUFDO0FBRUQsMEJBQTBCO0FBQ2IsUUFBQSx1QkFBdUIsR0FBK0I7SUFDakUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUscUJBQXFCO0lBQzlCLFFBQVEsRUFBRSw0RUFBNEU7Q0FDdkYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtjb3B5VGVzdFJlc3VsdEZpbGVzfSBmcm9tICcuJztcbmltcG9ydCB7ZXJyb3IsIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICBmb3JjZTogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3Yub3B0aW9uKCdmb3JjZScsIHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIGZvcmNlIHRoZSBjb21tYW5kIHRvIHJ1biwgaWdub3JpbmcgdGhlIENJIGVudmlyb25tZW50IGNoZWNrJyxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7Zm9yY2V9OiBBcmd1bWVudHM8T3B0aW9ucz4pIHtcbiAgaWYgKGZvcmNlID09PSBmYWxzZSAmJiBwcm9jZXNzLmVudlsnQ0knXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IocmVkKCdBYm9ydGluZywgYGdhdGhlci10ZXN0LXJlc3VsdHNgIGlzIG9ubHkgbWVhbnQgdG8gYmUgcnVuIG9uIENJLicpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgY29weVRlc3RSZXN1bHRGaWxlcygpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlLiAqL1xuZXhwb3J0IGNvbnN0IEdhdGhlclRlc3RSZXN1bHRzTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2dhdGhlci10ZXN0LXJlc3VsdHMnLFxuICBkZXNjcmliZTogJ0dhdGhlciB0ZXN0IHJlc3VsdCBmaWxlcyBpbnRvIHNpbmdsZSBkaXJlY3RvcnkgZm9yIGNvbnN1bXB0aW9uIGJ5IENpcmNsZUNJJyxcbn07XG4iXX0=