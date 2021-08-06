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
/** Yargs command builder for the command. */
function builder(argv) {
    return argv.positional('projectRoot', {
        type: 'string',
        normalize: true,
        coerce: (path) => path_1.resolve(path),
        demandOption: true,
    });
}
/** Yargs command handler for the command. */
async function handler({ projectRoot }) {
    try {
        if (!fs_1.lstatSync(projectRoot).isDirectory()) {
            console_1.error(console_1.red(`  ✘   The 'projectRoot' must be a directory: ${projectRoot}`));
            process.exit(1);
        }
    }
    catch {
        console_1.error(console_1.red(`  ✘   Could not find the 'projectRoot' provided: ${projectRoot}`));
        process.exit(1);
    }
    const releaseOutputs = await index_1.buildReleaseOutput(false);
    if (releaseOutputs === null) {
        console_1.error(console_1.red(`  ✘   Could not build release output. Please check output above.`));
        process.exit(1);
    }
    console_1.info(chalk_1.green(` ✓  Built release output.`));
    for (const { outputPath, name } of releaseOutputs) {
        await child_process_1.spawn('yarn', ['link', '--cwd', outputPath]);
        await child_process_1.spawn('yarn', ['link', '--cwd', projectRoot, name]);
    }
    console_1.info(chalk_1.green(` ✓  Linked release packages in provided project.`));
}
/** CLI command module. */
exports.BuildAndLinkCommandModule = {
    builder,
    handler,
    command: 'build-and-link <projectRoot>',
    describe: 'Builds the release output, registers the outputs as linked, and links via yarn to the provided project',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUE0QjtBQUM1QiwyQkFBNkI7QUFDN0IsK0JBQTZCO0FBRzdCLHFEQUE2RDtBQUM3RCw2REFBZ0Q7QUFDaEQsaURBQXFEO0FBT3JELDZDQUE2QztBQUM3QyxTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7UUFDcEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsSUFBSTtRQUNmLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQztRQUN2QyxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsNkNBQTZDO0FBQzdDLEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQWlDO0lBQ2xFLElBQUk7UUFDRixJQUFJLENBQUMsY0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3pDLGVBQUssQ0FBQyxhQUFHLENBQUMsZ0RBQWdELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0tBQ0Y7SUFBQyxNQUFNO1FBQ04sZUFBSyxDQUFDLGFBQUcsQ0FBQyxvREFBb0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxNQUFNLGNBQWMsR0FBRyxNQUFNLDBCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXZELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQixlQUFLLENBQUMsYUFBRyxDQUFDLGtFQUFrRSxDQUFDLENBQUMsQ0FBQztRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsY0FBSSxDQUFDLGFBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7SUFFekMsS0FBSyxNQUFNLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxJQUFJLGNBQWMsRUFBRTtRQUMvQyxNQUFNLHFCQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0scUJBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzNEO0lBRUQsY0FBSSxDQUFDLGFBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELDBCQUEwQjtBQUNiLFFBQUEseUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDhCQUE4QjtJQUN2QyxRQUFRLEVBQ04sd0dBQXdHO0NBQzNHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmVlbn0gZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtsc3RhdFN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi4vLi4vcmVsZWFzZS9idWlsZC9pbmRleCc7XG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRBbmRMaW5rT3B0aW9ucyB7XG4gIHByb2plY3RSb290OiBzdHJpbmc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxCdWlsZEFuZExpbmtPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2LnBvc2l0aW9uYWwoJ3Byb2plY3RSb290Jywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIG5vcm1hbGl6ZTogdHJ1ZSxcbiAgICBjb2VyY2U6IChwYXRoOiBzdHJpbmcpID0+IHJlc29sdmUocGF0aCksXG4gICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtwcm9qZWN0Um9vdH06IEFyZ3VtZW50czxCdWlsZEFuZExpbmtPcHRpb25zPikge1xuICB0cnkge1xuICAgIGlmICghbHN0YXRTeW5jKHByb2plY3RSb290KS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgVGhlICdwcm9qZWN0Um9vdCcgbXVzdCBiZSBhIGRpcmVjdG9yeTogJHtwcm9qZWN0Um9vdH1gKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGZpbmQgdGhlICdwcm9qZWN0Um9vdCcgcHJvdmlkZWQ6ICR7cHJvamVjdFJvb3R9YCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHJlbGVhc2VPdXRwdXRzID0gYXdhaXQgYnVpbGRSZWxlYXNlT3V0cHV0KGZhbHNlKTtcblxuICBpZiAocmVsZWFzZU91dHB1dHMgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGJ1aWxkIHJlbGVhc2Ugb3V0cHV0LiBQbGVhc2UgY2hlY2sgb3V0cHV0IGFib3ZlLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgaW5mbyhncmVlbihgIOKckyAgQnVpbHQgcmVsZWFzZSBvdXRwdXQuYCkpO1xuXG4gIGZvciAoY29uc3Qge291dHB1dFBhdGgsIG5hbWV9IG9mIHJlbGVhc2VPdXRwdXRzKSB7XG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbJ2xpbmsnLCAnLS1jd2QnLCBvdXRwdXRQYXRoXSk7XG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbJ2xpbmsnLCAnLS1jd2QnLCBwcm9qZWN0Um9vdCwgbmFtZV0pO1xuICB9XG5cbiAgaW5mbyhncmVlbihgIOKckyAgTGlua2VkIHJlbGVhc2UgcGFja2FnZXMgaW4gcHJvdmlkZWQgcHJvamVjdC5gKSk7XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUuICovXG5leHBvcnQgY29uc3QgQnVpbGRBbmRMaW5rQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgQnVpbGRBbmRMaW5rT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZC1hbmQtbGluayA8cHJvamVjdFJvb3Q+JyxcbiAgZGVzY3JpYmU6XG4gICAgJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQsIHJlZ2lzdGVycyB0aGUgb3V0cHV0cyBhcyBsaW5rZWQsIGFuZCBsaW5rcyB2aWEgeWFybiB0byB0aGUgcHJvdmlkZWQgcHJvamVjdCcsXG59O1xuIl19