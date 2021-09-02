"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildAndLinkCommandModule = void 0;
const chalk_1 = require("chalk");
const fs_1 = require("fs");
const path_1 = require("path");
const index_1 = require("../../release/build/index");
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
const config_1 = require("../../utils/config");
const config_2 = require("../../release/config");
/** Yargs command builder for the command. */
function builder(argv) {
    return argv.positional('projectRoot', {
        type: 'string',
        normalize: true,
        coerce: (path) => (0, path_1.resolve)(path),
        demandOption: true,
    });
}
/** Yargs command handler for the command. */
async function handler({ projectRoot }) {
    try {
        if (!(0, fs_1.lstatSync)(projectRoot).isDirectory()) {
            (0, console_1.error)((0, console_1.red)(`  ✘   The 'projectRoot' must be a directory: ${projectRoot}`));
            process.exit(1);
        }
    }
    catch {
        (0, console_1.error)((0, console_1.red)(`  ✘   Could not find the 'projectRoot' provided: ${projectRoot}`));
        process.exit(1);
    }
    const config = (0, config_1.getConfig)();
    (0, config_2.assertValidReleaseConfig)(config);
    const builtPackages = await (0, index_1.buildReleaseOutput)();
    if (builtPackages === null) {
        (0, console_1.error)((0, console_1.red)(`  ✘   Could not build release output. Please check output above.`));
        process.exit(1);
    }
    (0, console_1.info)((0, chalk_1.green)(` ✓  Built release output.`));
    for (const { outputPath, name } of builtPackages) {
        await (0, child_process_1.spawn)('yarn', ['link', '--cwd', outputPath]);
        await (0, child_process_1.spawn)('yarn', ['link', '--cwd', projectRoot, name]);
    }
    (0, console_1.info)((0, chalk_1.green)(` ✓  Linked release packages in provided project.`));
}
/** CLI command module. */
exports.BuildAndLinkCommandModule = {
    builder,
    handler,
    command: 'build-and-link <projectRoot>',
    describe: 'Builds the release output, registers the outputs as linked, and links via yarn to the provided project',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUE0QjtBQUM1QiwyQkFBNkI7QUFDN0IsK0JBQTZCO0FBRzdCLHFEQUE2RDtBQUM3RCw2REFBZ0Q7QUFDaEQsaURBQXFEO0FBQ3JELCtDQUE2QztBQUM3QyxpREFBOEQ7QUFPOUQsNkNBQTZDO0FBQzdDLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtRQUNwQyxJQUFJLEVBQUUsUUFBUTtRQUNkLFNBQVMsRUFBRSxJQUFJO1FBQ2YsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUM7UUFDdkMsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELDZDQUE2QztBQUM3QyxLQUFLLFVBQVUsT0FBTyxDQUFDLEVBQUMsV0FBVyxFQUFpQztJQUNsRSxJQUFJO1FBQ0YsSUFBSSxDQUFDLElBQUEsY0FBUyxFQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3pDLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLGdEQUFnRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNGO0lBQUMsTUFBTTtRQUNOLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLG9EQUFvRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsa0JBQVMsR0FBRSxDQUFDO0lBQzNCLElBQUEsaUNBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFakMsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFBLDBCQUFrQixHQUFFLENBQUM7SUFFakQsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1FBQzFCLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLGtFQUFrRSxDQUFDLENBQUMsQ0FBQztRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsSUFBQSxjQUFJLEVBQUMsSUFBQSxhQUFLLEVBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0lBRXpDLEtBQUssTUFBTSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxhQUFhLEVBQUU7UUFDOUMsTUFBTSxJQUFBLHFCQUFLLEVBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sSUFBQSxxQkFBSyxFQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDM0Q7SUFFRCxJQUFBLGNBQUksRUFBQyxJQUFBLGFBQUssRUFBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELDBCQUEwQjtBQUNiLFFBQUEseUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDhCQUE4QjtJQUN2QyxRQUFRLEVBQ04sd0dBQXdHO0NBQzNHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmVlbn0gZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtsc3RhdFN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi4vLi4vcmVsZWFzZS9idWlsZC9pbmRleCc7XG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi9yZWxlYXNlL2NvbmZpZyc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRBbmRMaW5rT3B0aW9ucyB7XG4gIHByb2plY3RSb290OiBzdHJpbmc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxCdWlsZEFuZExpbmtPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2LnBvc2l0aW9uYWwoJ3Byb2plY3RSb290Jywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIG5vcm1hbGl6ZTogdHJ1ZSxcbiAgICBjb2VyY2U6IChwYXRoOiBzdHJpbmcpID0+IHJlc29sdmUocGF0aCksXG4gICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtwcm9qZWN0Um9vdH06IEFyZ3VtZW50czxCdWlsZEFuZExpbmtPcHRpb25zPikge1xuICB0cnkge1xuICAgIGlmICghbHN0YXRTeW5jKHByb2plY3RSb290KS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgVGhlICdwcm9qZWN0Um9vdCcgbXVzdCBiZSBhIGRpcmVjdG9yeTogJHtwcm9qZWN0Um9vdH1gKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGZpbmQgdGhlICdwcm9qZWN0Um9vdCcgcHJvdmlkZWQ6ICR7cHJvamVjdFJvb3R9YCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcblxuICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgYnVpbGRSZWxlYXNlT3V0cHV0KCk7XG5cbiAgaWYgKGJ1aWx0UGFja2FnZXMgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGJ1aWxkIHJlbGVhc2Ugb3V0cHV0LiBQbGVhc2UgY2hlY2sgb3V0cHV0IGFib3ZlLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgaW5mbyhncmVlbihgIOKckyAgQnVpbHQgcmVsZWFzZSBvdXRwdXQuYCkpO1xuXG4gIGZvciAoY29uc3Qge291dHB1dFBhdGgsIG5hbWV9IG9mIGJ1aWx0UGFja2FnZXMpIHtcbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnbGluaycsICctLWN3ZCcsIG91dHB1dFBhdGhdKTtcbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnbGluaycsICctLWN3ZCcsIHByb2plY3RSb290LCBuYW1lXSk7XG4gIH1cblxuICBpbmZvKGdyZWVuKGAg4pyTICBMaW5rZWQgcmVsZWFzZSBwYWNrYWdlcyBpbiBwcm92aWRlZCBwcm9qZWN0LmApKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBCdWlsZEFuZExpbmtDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBCdWlsZEFuZExpbmtPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2J1aWxkLWFuZC1saW5rIDxwcm9qZWN0Um9vdD4nLFxuICBkZXNjcmliZTpcbiAgICAnQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCwgcmVnaXN0ZXJzIHRoZSBvdXRwdXRzIGFzIGxpbmtlZCwgYW5kIGxpbmtzIHZpYSB5YXJuIHRvIHRoZSBwcm92aWRlZCBwcm9qZWN0Jyxcbn07XG4iXX0=