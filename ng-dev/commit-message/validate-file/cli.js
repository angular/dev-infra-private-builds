"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateFileModule = void 0;
const config_1 = require("../../utils/config");
const validate_file_1 = require("./validate-file");
/** Builds the command. */
function builder(yargs) {
    return yargs
        .option('file', {
        type: 'string',
        conflicts: ['file-env-variable'],
        description: 'The path of the commit message file.',
    })
        .option('file-env-variable', {
        type: 'string',
        conflicts: ['file'],
        description: 'The key of the environment variable for the path of the commit message file.',
        coerce: (arg) => {
            if (arg === undefined) {
                return arg;
            }
            const file = process.env[arg];
            if (!file) {
                throw new Error(`Provided environment variable "${arg}" was not found.`);
            }
            return file;
        },
    })
        .option('error', {
        type: 'boolean',
        description: 'Whether invalid commit messages should be treated as failures rather than a warning',
        default: !!config_1.getUserConfig().commitMessage?.errorOnInvalidMessage || !!process.env['CI'],
    });
}
/** Handles the command. */
async function handler({ error, file, fileEnvVariable }) {
    const filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
    validate_file_1.validateFile(filePath, error);
}
/** yargs command module describing the command. */
exports.ValidateFileModule = {
    handler,
    builder,
    command: 'pre-commit-validate',
    describe: 'Validate the most recent commit message',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLWZpbGUvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUFpRDtBQUVqRCxtREFBNkM7QUFRN0MsMEJBQTBCO0FBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7SUFDMUIsT0FBTyxLQUFLO1NBQ1QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUM7UUFDaEMsV0FBVyxFQUFFLHNDQUFzQztLQUNwRCxDQUFDO1NBQ0QsTUFBTSxDQUFDLG1CQUF3QyxFQUFFO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ25CLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsTUFBTSxFQUFFLENBQUMsR0FBdUIsRUFBRSxFQUFFO1lBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDckIsT0FBTyxHQUFHLENBQUM7YUFDWjtZQUNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLGtCQUFrQixDQUFDLENBQUM7YUFDMUU7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FDRixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUNULHFGQUFxRjtRQUN2RixPQUFPLEVBQUUsQ0FBQyxDQUFDLHNCQUFhLEVBQUUsQ0FBQyxhQUFhLEVBQUUscUJBQXFCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ3ZGLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFpQztJQUNuRixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksZUFBZSxJQUFJLHFCQUFxQixDQUFDO0lBQ2xFLDRCQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSxrQkFBa0IsR0FBMkM7SUFDeEUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUscUJBQXFCO0lBQzlCLFFBQVEsRUFBRSx5Q0FBeUM7Q0FDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldFVzZXJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7dmFsaWRhdGVGaWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlRmlsZU9wdGlvbnMge1xuICBmaWxlPzogc3RyaW5nO1xuICBmaWxlRW52VmFyaWFibGU/OiBzdHJpbmc7XG4gIGVycm9yOiBib29sZWFuO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3NcbiAgICAub3B0aW9uKCdmaWxlJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHBhdGggb2YgdGhlIGNvbW1pdCBtZXNzYWdlIGZpbGUuJyxcbiAgICB9KVxuICAgIC5vcHRpb24oJ2ZpbGUtZW52LXZhcmlhYmxlJyBhcyAnZmlsZUVudlZhcmlhYmxlJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUga2V5IG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBmb3IgdGhlIHBhdGggb2YgdGhlIGNvbW1pdCBtZXNzYWdlIGZpbGUuJyxcbiAgICAgIGNvZXJjZTogKGFyZzogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgICAgIGlmIChhcmcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZSA9IHByb2Nlc3MuZW52W2FyZ107XG4gICAgICAgIGlmICghZmlsZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2FyZ31cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgfSxcbiAgICB9KVxuICAgIC5vcHRpb24oJ2Vycm9yJywge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdXaGV0aGVyIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGZhaWx1cmVzIHJhdGhlciB0aGFuIGEgd2FybmluZycsXG4gICAgICBkZWZhdWx0OiAhIWdldFVzZXJDb25maWcoKS5jb21taXRNZXNzYWdlPy5lcnJvck9uSW52YWxpZE1lc3NhZ2UgfHwgISFwcm9jZXNzLmVudlsnQ0knXSxcbiAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtlcnJvciwgZmlsZSwgZmlsZUVudlZhcmlhYmxlfTogQXJndW1lbnRzPFZhbGlkYXRlRmlsZU9wdGlvbnM+KSB7XG4gIGNvbnN0IGZpbGVQYXRoID0gZmlsZSB8fCBmaWxlRW52VmFyaWFibGUgfHwgJy5naXQvQ09NTUlUX0VESVRNU0cnO1xuICB2YWxpZGF0ZUZpbGUoZmlsZVBhdGgsIGVycm9yKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgVmFsaWRhdGVGaWxlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBWYWxpZGF0ZUZpbGVPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ3ByZS1jb21taXQtdmFsaWRhdGUnLFxuICBkZXNjcmliZTogJ1ZhbGlkYXRlIHRoZSBtb3N0IHJlY2VudCBjb21taXQgbWVzc2FnZScsXG59O1xuIl19