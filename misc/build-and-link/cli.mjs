/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { green } from 'chalk';
import { lstatSync } from 'fs';
import { resolve } from 'path';
import { buildReleaseOutput } from '../../release/build/index';
import { error, info, red } from '../../utils/console';
import { exec } from '../../utils/shelljs';
/** Yargs command builder for the command. */
function builder(argv) {
    return argv.positional('projectRoot', {
        type: 'string',
        normalize: true,
        coerce: (path) => resolve(path),
        demandOption: true,
    });
}
/** Yargs command handler for the command. */
function handler({ projectRoot }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!lstatSync(projectRoot).isDirectory()) {
                error(red(`  ✘   The 'projectRoot' must be a directory: ${projectRoot}`));
                process.exit(1);
            }
        }
        catch (_a) {
            error(red(`  ✘   Could not find the 'projectRoot' provided: ${projectRoot}`));
            process.exit(1);
        }
        const releaseOutputs = yield buildReleaseOutput(false);
        if (releaseOutputs === null) {
            error(red(`  ✘   Could not build release output. Please check output above.`));
            process.exit(1);
        }
        info(green(` ✓  Built release output.`));
        for (const { outputPath, name } of releaseOutputs) {
            exec(`yarn link --cwd ${outputPath}`);
            exec(`yarn link --cwd ${projectRoot} ${name}`);
        }
        info(green(` ✓  Linked release packages in provided project.`));
    });
}
/** CLI command module. */
export const BuildAndLinkCommandModule = {
    builder,
    handler,
    command: 'build-and-link <projectRoot>',
    describe: 'Builds the release output, registers the outputs as linked, and links via yarn to the provided project',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzVCLE9BQU8sRUFBQyxTQUFTLEVBQWMsTUFBTSxJQUFJLENBQUM7QUFDMUMsT0FBTyxFQUFtQixPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHL0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDN0QsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBUXpDLDZDQUE2QztBQUM3QyxTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7UUFDcEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsSUFBSTtRQUNmLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUN2QyxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsNkNBQTZDO0FBQzdDLFNBQWUsT0FBTyxDQUFDLEVBQUMsV0FBVyxFQUFpQzs7UUFDbEUsSUFBSTtZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0RBQWdELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjtTQUNGO1FBQUMsV0FBTTtZQUNOLEtBQUssQ0FBQyxHQUFHLENBQUMsb0RBQW9ELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2RCxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDLENBQUM7WUFDL0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1FBRXpDLEtBQUssTUFBTSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxjQUFjLEVBQUU7WUFDL0MsSUFBSSxDQUFDLG1CQUFtQixVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsV0FBVyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0NBQUE7QUFFRCwwQkFBMEI7QUFDMUIsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDhCQUE4QjtJQUN2QyxRQUFRLEVBQ0osd0dBQXdHO0NBQzdHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmVlbn0gZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtsc3RhdFN5bmMsIHN0YXQsIFN0YXRzfSBmcm9tICdmcyc7XG5pbXBvcnQge2lzQWJzb2x1dGUsIGpvaW4sIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtidWlsZFJlbGVhc2VPdXRwdXR9IGZyb20gJy4uLy4uL3JlbGVhc2UvYnVpbGQvaW5kZXgnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdWlsZEFuZExpbmtPcHRpb25zIHtcbiAgcHJvamVjdFJvb3Q6IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PEJ1aWxkQW5kTGlua09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3YucG9zaXRpb25hbCgncHJvamVjdFJvb3QnLCB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgbm9ybWFsaXplOiB0cnVlLFxuICAgIGNvZXJjZTogKHBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShwYXRoKSxcbiAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3Byb2plY3RSb290fTogQXJndW1lbnRzPEJ1aWxkQW5kTGlua09wdGlvbnM+KSB7XG4gIHRyeSB7XG4gICAgaWYgKCFsc3RhdFN5bmMocHJvamVjdFJvb3QpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBUaGUgJ3Byb2plY3RSb290JyBtdXN0IGJlIGEgZGlyZWN0b3J5OiAke3Byb2plY3RSb290fWApKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgZmluZCB0aGUgJ3Byb2plY3RSb290JyBwcm92aWRlZDogJHtwcm9qZWN0Um9vdH1gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcmVsZWFzZU91dHB1dHMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQoZmFsc2UpO1xuXG4gIGlmIChyZWxlYXNlT3V0cHV0cyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBpbmZvKGdyZWVuKGAg4pyTICBCdWlsdCByZWxlYXNlIG91dHB1dC5gKSk7XG5cbiAgZm9yIChjb25zdCB7b3V0cHV0UGF0aCwgbmFtZX0gb2YgcmVsZWFzZU91dHB1dHMpIHtcbiAgICBleGVjKGB5YXJuIGxpbmsgLS1jd2QgJHtvdXRwdXRQYXRofWApO1xuICAgIGV4ZWMoYHlhcm4gbGluayAtLWN3ZCAke3Byb2plY3RSb290fSAke25hbWV9YCk7XG4gIH1cblxuICBpbmZvKGdyZWVuKGAg4pyTICBMaW5rZWQgcmVsZWFzZSBwYWNrYWdlcyBpbiBwcm92aWRlZCBwcm9qZWN0LmApKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBCdWlsZEFuZExpbmtDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBCdWlsZEFuZExpbmtPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2J1aWxkLWFuZC1saW5rIDxwcm9qZWN0Um9vdD4nLFxuICBkZXNjcmliZTpcbiAgICAgICdCdWlsZHMgdGhlIHJlbGVhc2Ugb3V0cHV0LCByZWdpc3RlcnMgdGhlIG91dHB1dHMgYXMgbGlua2VkLCBhbmQgbGlua3MgdmlhIHlhcm4gdG8gdGhlIHByb3ZpZGVkIHByb2plY3QnLFxufTtcbiJdfQ==