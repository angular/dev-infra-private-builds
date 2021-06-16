/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { getUserConfig } from '../../utils/config';
import { validateFile } from './validate-file';
/** Builds the command. */
function builder(yargs) {
    var _a;
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
        default: !!((_a = getUserConfig().commitMessage) === null || _a === void 0 ? void 0 : _a.errorOnInvalidMessage) || !!process.env['CI']
    });
}
/** Handles the command. */
function handler({ error, file, fileEnvVariable }) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
        validateFile(filePath, error);
    });
}
/** yargs command module describing the command. */
export const ValidateFileModule = {
    handler,
    builder,
    command: 'pre-commit-validate',
    describe: 'Validate the most recent commit message',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLWZpbGUvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFakQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBUzdDLDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXOztJQUMxQixPQUFPLEtBQUs7U0FDUCxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztRQUNoQyxXQUFXLEVBQUUsc0NBQXNDO0tBQ3BELENBQUM7U0FDRCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7UUFDaEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDbkIsV0FBVyxFQUFFLDhFQUE4RTtRQUMzRixNQUFNLEVBQUUsQ0FBQyxHQUFxQixFQUFFLEVBQUU7WUFDaEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNyQixPQUFPLEdBQUcsQ0FBQzthQUNaO1lBQ0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLEdBQUcsa0JBQWtCLENBQUMsQ0FBQzthQUMxRTtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUNGLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQ1AscUZBQXFGO1FBQ3pGLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQSxNQUFBLGFBQWEsRUFBRSxDQUFDLGFBQWEsMENBQUUscUJBQXFCLENBQUEsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7S0FDdkYsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELDJCQUEyQjtBQUMzQixTQUFlLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFpQzs7UUFDbkYsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLGVBQWUsSUFBSSxxQkFBcUIsQ0FBQztRQUNsRSxZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FBQTtBQUVELG1EQUFtRDtBQUNuRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBMkM7SUFDeEUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUscUJBQXFCO0lBQzlCLFFBQVEsRUFBRSx5Q0FBeUM7Q0FDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldFVzZXJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7dmFsaWRhdGVGaWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVGaWxlT3B0aW9ucyB7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIGZpbGVFbnZWYXJpYWJsZT86IHN0cmluZztcbiAgZXJyb3I6IGJvb2xlYW47XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLm9wdGlvbignZmlsZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGNvbmZsaWN0czogWydmaWxlLWVudi12YXJpYWJsZSddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignZmlsZS1lbnYtdmFyaWFibGUnIGFzICdmaWxlRW52VmFyaWFibGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICBjb2VyY2U6IChhcmc6IHN0cmluZ3x1bmRlZmluZWQpID0+IHtcbiAgICAgICAgICBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZpbGUgPSBwcm9jZXNzLmVudlthcmddO1xuICAgICAgICAgIGlmICghZmlsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBcIiR7YXJnfVwiIHdhcyBub3QgZm91bmQuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2Vycm9yJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgJ1doZXRoZXIgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZmFpbHVyZXMgcmF0aGVyIHRoYW4gYSB3YXJuaW5nJyxcbiAgICAgICAgZGVmYXVsdDogISFnZXRVc2VyQ29uZmlnKCkuY29tbWl0TWVzc2FnZT8uZXJyb3JPbkludmFsaWRNZXNzYWdlIHx8ICEhcHJvY2Vzcy5lbnZbJ0NJJ11cbiAgICAgIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2Vycm9yLCBmaWxlLCBmaWxlRW52VmFyaWFibGV9OiBBcmd1bWVudHM8VmFsaWRhdGVGaWxlT3B0aW9ucz4pIHtcbiAgY29uc3QgZmlsZVBhdGggPSBmaWxlIHx8IGZpbGVFbnZWYXJpYWJsZSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gIHZhbGlkYXRlRmlsZShmaWxlUGF0aCwgZXJyb3IpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gKi9cbmV4cG9ydCBjb25zdCBWYWxpZGF0ZUZpbGVNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFZhbGlkYXRlRmlsZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAncHJlLWNvbW1pdC12YWxpZGF0ZScsXG4gIGRlc2NyaWJlOiAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJyxcbn07XG4iXX0=