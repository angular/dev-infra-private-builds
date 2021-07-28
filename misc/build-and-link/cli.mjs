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
import { spawn } from '../../utils/child-process';
import { error, info, red } from '../../utils/console';
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
            yield spawn('yarn', ['link', '--cwd', outputPath]);
            yield spawn('yarn', ['link', '--cwd', projectRoot, name]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL21pc2MvYnVpbGQtYW5kLWxpbmsvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzVCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDN0IsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUc3QixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEQsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFRckQsNkNBQTZDO0FBQzdDLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtRQUNwQyxJQUFJLEVBQUUsUUFBUTtRQUNkLFNBQVMsRUFBRSxJQUFJO1FBQ2YsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCw2Q0FBNkM7QUFDN0MsU0FBZSxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQWlDOztRQUNsRSxJQUFJO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Y7UUFBQyxXQUFNO1lBQ04sS0FBSyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCxNQUFNLGNBQWMsR0FBRyxNQUFNLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtZQUMzQixLQUFLLENBQUMsR0FBRyxDQUFDLGtFQUFrRSxDQUFDLENBQUMsQ0FBQztZQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFFekMsS0FBSyxNQUFNLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxJQUFJLGNBQWMsRUFBRTtZQUMvQyxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FBQTtBQUVELDBCQUEwQjtBQUMxQixNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsOEJBQThCO0lBQ3ZDLFFBQVEsRUFDSix3R0FBd0c7Q0FDN0csQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dyZWVufSBmcm9tICdjaGFsayc7XG5pbXBvcnQge2xzdGF0U3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YnVpbGRSZWxlYXNlT3V0cHV0fSBmcm9tICcuLi8uLi9yZWxlYXNlL2J1aWxkL2luZGV4JztcbmltcG9ydCB7c3Bhd259IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkQW5kTGlua09wdGlvbnMge1xuICBwcm9qZWN0Um9vdDogc3RyaW5nO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8QnVpbGRBbmRMaW5rT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndi5wb3NpdGlvbmFsKCdwcm9qZWN0Um9vdCcsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBub3JtYWxpemU6IHRydWUsXG4gICAgY29lcmNlOiAocGF0aDogc3RyaW5nKSA9PiByZXNvbHZlKHBhdGgpLFxuICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHJvamVjdFJvb3R9OiBBcmd1bWVudHM8QnVpbGRBbmRMaW5rT3B0aW9ucz4pIHtcbiAgdHJ5IHtcbiAgICBpZiAoIWxzdGF0U3luYyhwcm9qZWN0Um9vdCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFRoZSAncHJvamVjdFJvb3QnIG11c3QgYmUgYSBkaXJlY3Rvcnk6ICR7cHJvamVjdFJvb3R9YCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBmaW5kIHRoZSAncHJvamVjdFJvb3QnIHByb3ZpZGVkOiAke3Byb2plY3RSb290fWApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCByZWxlYXNlT3V0cHV0cyA9IGF3YWl0IGJ1aWxkUmVsZWFzZU91dHB1dChmYWxzZSk7XG5cbiAgaWYgKHJlbGVhc2VPdXRwdXRzID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBidWlsZCByZWxlYXNlIG91dHB1dC4gUGxlYXNlIGNoZWNrIG91dHB1dCBhYm92ZS5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oZ3JlZW4oYCDinJMgIEJ1aWx0IHJlbGVhc2Ugb3V0cHV0LmApKTtcblxuICBmb3IgKGNvbnN0IHtvdXRwdXRQYXRoLCBuYW1lfSBvZiByZWxlYXNlT3V0cHV0cykge1xuICAgIGF3YWl0IHNwYXduKCd5YXJuJywgWydsaW5rJywgJy0tY3dkJywgb3V0cHV0UGF0aF0pO1xuICAgIGF3YWl0IHNwYXduKCd5YXJuJywgWydsaW5rJywgJy0tY3dkJywgcHJvamVjdFJvb3QsIG5hbWVdKTtcbiAgfVxuXG4gIGluZm8oZ3JlZW4oYCDinJMgIExpbmtlZCByZWxlYXNlIHBhY2thZ2VzIGluIHByb3ZpZGVkIHByb2plY3QuYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlLiAqL1xuZXhwb3J0IGNvbnN0IEJ1aWxkQW5kTGlua0NvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIEJ1aWxkQW5kTGlua09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQtYW5kLWxpbmsgPHByb2plY3RSb290PicsXG4gIGRlc2NyaWJlOlxuICAgICAgJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQsIHJlZ2lzdGVycyB0aGUgb3V0cHV0cyBhcyBsaW5rZWQsIGFuZCBsaW5rcyB2aWEgeWFybiB0byB0aGUgcHJvdmlkZWQgcHJvamVjdCcsXG59O1xuIl19