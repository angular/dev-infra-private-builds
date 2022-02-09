"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateYarnCommandModule = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
const spinner_1 = require("../../utils/spinner");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const github_yargs_1 = require("../../utils/git/github-yargs");
const resolve_yarn_bin_1 = require("../../utils/resolve-yarn-bin");
async function builder(yargs) {
    return (0, github_yargs_1.addGithubTokenOption)(yargs);
}
/** Environment object enabling the usage of yarn-path to determine the new version. */
const useYarnPathEnv = {
    ...process.env,
    YARN_IGNORE_PATH: '0',
};
/** Environment object to prevent running husky workflow. */
const skipHuskyEnv = {
    ...process.env,
    HUSKY: '0',
};
async function handler() {
    /**
     * Process command that refers to the global Yarn installation.
     *
     * Note that we intend to use the global Yarn command here as this allows us to let Yarn
     * respect the `.yarnrc` file, allowing us to check if the update has completed properly.
     * Just using `yarn` does not necessarily resolve to the global Yarn version as Yarn-initiated
     * sub-processes will have a modified `process.env.PATH` that directly points to the Yarn
     * version that spawned the sub-process.
     */
    const yarnGlobalBin = (await (0, resolve_yarn_bin_1.getYarnPathFromNpmGlobalBinaries)()) ?? 'yarn';
    /** Instance of the local git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    /** The main branch name of the repository. */
    const mainBranchName = git.mainBranchName;
    /** The original branch or ref before the command was invoked. */
    const originalBranchOrRef = git.getCurrentBranchOrRevision();
    if (git.hasUncommittedChanges()) {
        (0, console_1.error)((0, console_1.red)('Found changes in the local repository. Make sure there are no uncommitted files.'));
        process.exitCode = 1;
        return;
    }
    /** A spinner instance. */
    const spinner = new spinner_1.Spinner('');
    try {
        spinner.update(`Fetching the latest primary branch from upstream: "${mainBranchName}"`);
        git.run(['fetch', '-q', git.getRepoGitUrl(), mainBranchName]);
        git.checkout('FETCH_HEAD', false);
        spinner.update('Removing previous yarn version.');
        const yarnReleasesDir = (0, path_1.join)(git.baseDir, '.yarn/releases');
        (0, fs_1.readdirSync)(yarnReleasesDir).forEach((file) => (0, fs_1.unlinkSync)((0, path_1.join)(yarnReleasesDir, file)));
        spinner.update('Updating yarn version.');
        (0, child_process_1.spawnSync)(yarnGlobalBin, ['policies', 'set-version', 'latest']);
        spinner.update('Confirming the version of yarn was updated.');
        const newYarnVersion = (0, child_process_1.spawnSync)(yarnGlobalBin, ['-v'], { env: useYarnPathEnv }).stdout.trim();
        if (git.run(['status', '--porcelain']).stdout.length === 0) {
            spinner.complete();
            (0, console_1.error)((0, console_1.red)('Yarn already up to date'));
            process.exitCode = 0;
            return;
        }
        /** The title for the PR. */
        const title = `build: update to yarn v${newYarnVersion}`;
        /** The body for the PR. */
        const body = `Update to the latest version of yarn, ${newYarnVersion}.`;
        /** The commit message for the change. */
        const commitMessage = `${title}\n\n${body}`;
        /** The name of the branch to use on remote. */
        const branchName = `yarn-update-v${newYarnVersion}`;
        /** The name of the owner for remote branch on Github. */
        const { owner: localOwner } = await git.getForkOfAuthenticatedUser();
        spinner.update('Staging yarn vendoring files and creating commit');
        git.run(['add', '.yarn/releases/**', '.yarnrc']);
        git.run(['commit', '-q', '--no-verify', '-m', commitMessage], { env: skipHuskyEnv });
        spinner.update('Pushing commit changes to github.');
        git.run(['push', '-q', 'origin', '--force-with-lease', `HEAD:refs/heads/${branchName}`]);
        spinner.update('Creating a PR for the changes.');
        const { number } = (await git.github.pulls.create({
            ...git.remoteParams,
            title,
            body,
            base: mainBranchName,
            head: `${localOwner}:${branchName}`,
        })).data;
        spinner.complete();
        (0, console_1.info)(`Created PR #${number} to update to yarn v${newYarnVersion}`);
    }
    catch (e) {
        spinner.complete();
        (0, console_1.error)((0, console_1.red)('Aborted yarn update do to errors:'));
        (0, console_1.error)(e);
        process.exitCode = 1;
        git.checkout(originalBranchOrRef, true);
    }
    finally {
        git.checkout(originalBranchOrRef, true);
    }
}
/** CLI command module. */
exports.UpdateYarnCommandModule = {
    builder,
    handler,
    command: 'update-yarn',
    describe: 'Automatically update the vendored yarn version in the repository and create a PR',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L21pc2MvdXBkYXRlLXlhcm4vY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUEyQztBQUMzQywrQkFBMEI7QUFFMUIsNkRBQW9EO0FBRXBELGlEQUFxRDtBQUNyRCxpREFBNEM7QUFDNUMsdUZBQWdGO0FBQ2hGLCtEQUFrRTtBQUNsRSxtRUFBOEU7QUFFOUUsS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUFXO0lBQ2hDLE9BQU8sSUFBQSxtQ0FBb0IsRUFBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsdUZBQXVGO0FBQ3ZGLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLEdBQUcsT0FBTyxDQUFDLEdBQUc7SUFDZCxnQkFBZ0IsRUFBRSxHQUFHO0NBQ3RCLENBQUM7QUFFRiw0REFBNEQ7QUFDNUQsTUFBTSxZQUFZLEdBQUc7SUFDbkIsR0FBRyxPQUFPLENBQUMsR0FBRztJQUNkLEtBQUssRUFBRSxHQUFHO0NBQ1gsQ0FBQztBQUVGLEtBQUssVUFBVSxPQUFPO0lBQ3BCOzs7Ozs7OztPQVFHO0lBQ0gsTUFBTSxhQUFhLEdBQUcsQ0FBQyxNQUFNLElBQUEsbURBQWdDLEdBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQztJQUMzRSx3Q0FBd0M7SUFDeEMsTUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsOENBQThDO0lBQzlDLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUM7SUFDMUMsaUVBQWlFO0lBQ2pFLE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFFN0QsSUFBSSxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRTtRQUMvQixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyxrRkFBa0YsQ0FBQyxDQUFDLENBQUM7UUFD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Q0FBQztRQUV6RixPQUFPLENBQUMsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDakQsTUFBTSxFQUFDLE1BQU0sRUFBQyxHQUFHLENBQ2YsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDNUIsR0FBRyxHQUFHLENBQUMsWUFBWTtZQUNuQixLQUFLO1lBQ0wsSUFBSTtZQUNKLElBQUksRUFBRSxjQUFjO1lBQ3BCLElBQUksRUFBRSxHQUFHLFVBQVUsSUFBSSxVQUFVLEVBQUU7U0FDcEMsQ0FBQyxDQUNILENBQUMsSUFBSSxDQUFDO1FBRVAsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLElBQUEsY0FBSSxFQUFDLGVBQWUsTUFBTSx1QkFBdUIsY0FBYyxFQUFFLENBQUMsQ0FBQztLQUNwRTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNULE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDekM7WUFBUztRQUNSLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDekM7QUFDSCxDQUFDO0FBRUQsMEJBQTBCO0FBQ2IsUUFBQSx1QkFBdUIsR0FBa0I7SUFDcEQsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsYUFBYTtJQUN0QixRQUFRLEVBQUUsa0ZBQWtGO0NBQzdGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWFkZGlyU3luYywgdW5saW5rU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7QXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtzcGF3blN5bmN9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtTcGlubmVyfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcbmltcG9ydCB7Z2V0WWFyblBhdGhGcm9tTnBtR2xvYmFsQmluYXJpZXN9IGZyb20gJy4uLy4uL3V0aWxzL3Jlc29sdmUteWFybi1iaW4nO1xuXG5hc3luYyBmdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJncyk7XG59XG5cbi8qKiBFbnZpcm9ubWVudCBvYmplY3QgZW5hYmxpbmcgdGhlIHVzYWdlIG9mIHlhcm4tcGF0aCB0byBkZXRlcm1pbmUgdGhlIG5ldyB2ZXJzaW9uLiAqL1xuY29uc3QgdXNlWWFyblBhdGhFbnYgPSB7XG4gIC4uLnByb2Nlc3MuZW52LFxuICBZQVJOX0lHTk9SRV9QQVRIOiAnMCcsXG59O1xuXG4vKiogRW52aXJvbm1lbnQgb2JqZWN0IHRvIHByZXZlbnQgcnVubmluZyBodXNreSB3b3JrZmxvdy4gKi9cbmNvbnN0IHNraXBIdXNreUVudiA9IHtcbiAgLi4ucHJvY2Vzcy5lbnYsXG4gIEhVU0tZOiAnMCcsXG59O1xuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAvKipcbiAgICogUHJvY2VzcyBjb21tYW5kIHRoYXQgcmVmZXJzIHRvIHRoZSBnbG9iYWwgWWFybiBpbnN0YWxsYXRpb24uXG4gICAqXG4gICAqIE5vdGUgdGhhdCB3ZSBpbnRlbmQgdG8gdXNlIHRoZSBnbG9iYWwgWWFybiBjb21tYW5kIGhlcmUgYXMgdGhpcyBhbGxvd3MgdXMgdG8gbGV0IFlhcm5cbiAgICogcmVzcGVjdCB0aGUgYC55YXJucmNgIGZpbGUsIGFsbG93aW5nIHVzIHRvIGNoZWNrIGlmIHRoZSB1cGRhdGUgaGFzIGNvbXBsZXRlZCBwcm9wZXJseS5cbiAgICogSnVzdCB1c2luZyBgeWFybmAgZG9lcyBub3QgbmVjZXNzYXJpbHkgcmVzb2x2ZSB0byB0aGUgZ2xvYmFsIFlhcm4gdmVyc2lvbiBhcyBZYXJuLWluaXRpYXRlZFxuICAgKiBzdWItcHJvY2Vzc2VzIHdpbGwgaGF2ZSBhIG1vZGlmaWVkIGBwcm9jZXNzLmVudi5QQVRIYCB0aGF0IGRpcmVjdGx5IHBvaW50cyB0byB0aGUgWWFyblxuICAgKiB2ZXJzaW9uIHRoYXQgc3Bhd25lZCB0aGUgc3ViLXByb2Nlc3MuXG4gICAqL1xuICBjb25zdCB5YXJuR2xvYmFsQmluID0gKGF3YWl0IGdldFlhcm5QYXRoRnJvbU5wbUdsb2JhbEJpbmFyaWVzKCkpID8/ICd5YXJuJztcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBsb2NhbCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIG1haW4gYnJhbmNoIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IG1haW5CcmFuY2hOYW1lID0gZ2l0Lm1haW5CcmFuY2hOYW1lO1xuICAvKiogVGhlIG9yaWdpbmFsIGJyYW5jaCBvciByZWYgYmVmb3JlIHRoZSBjb21tYW5kIHdhcyBpbnZva2VkLiAqL1xuICBjb25zdCBvcmlnaW5hbEJyYW5jaE9yUmVmID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKHJlZCgnRm91bmQgY2hhbmdlcyBpbiB0aGUgbG9jYWwgcmVwb3NpdG9yeS4gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBmaWxlcy4nKSk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIEEgc3Bpbm5lciBpbnN0YW5jZS4gKi9cbiAgY29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKCcnKTtcbiAgdHJ5IHtcbiAgICBzcGlubmVyLnVwZGF0ZShgRmV0Y2hpbmcgdGhlIGxhdGVzdCBwcmltYXJ5IGJyYW5jaCBmcm9tIHVwc3RyZWFtOiBcIiR7bWFpbkJyYW5jaE5hbWV9XCJgKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBnaXQuZ2V0UmVwb0dpdFVybCgpLCBtYWluQnJhbmNoTmFtZV0pO1xuICAgIGdpdC5jaGVja291dCgnRkVUQ0hfSEVBRCcsIGZhbHNlKTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdSZW1vdmluZyBwcmV2aW91cyB5YXJuIHZlcnNpb24uJyk7XG4gICAgY29uc3QgeWFyblJlbGVhc2VzRGlyID0gam9pbihnaXQuYmFzZURpciwgJy55YXJuL3JlbGVhc2VzJyk7XG4gICAgcmVhZGRpclN5bmMoeWFyblJlbGVhc2VzRGlyKS5mb3JFYWNoKChmaWxlKSA9PiB1bmxpbmtTeW5jKGpvaW4oeWFyblJlbGVhc2VzRGlyLCBmaWxlKSkpO1xuXG4gICAgc3Bpbm5lci51cGRhdGUoJ1VwZGF0aW5nIHlhcm4gdmVyc2lvbi4nKTtcbiAgICBzcGF3blN5bmMoeWFybkdsb2JhbEJpbiwgWydwb2xpY2llcycsICdzZXQtdmVyc2lvbicsICdsYXRlc3QnXSk7XG5cbiAgICBzcGlubmVyLnVwZGF0ZSgnQ29uZmlybWluZyB0aGUgdmVyc2lvbiBvZiB5YXJuIHdhcyB1cGRhdGVkLicpO1xuICAgIGNvbnN0IG5ld1lhcm5WZXJzaW9uID0gc3Bhd25TeW5jKHlhcm5HbG9iYWxCaW4sIFsnLXYnXSwge2VudjogdXNlWWFyblBhdGhFbnZ9KS5zdGRvdXQudHJpbSgpO1xuICAgIGlmIChnaXQucnVuKFsnc3RhdHVzJywgJy0tcG9yY2VsYWluJ10pLnN0ZG91dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICAgIGVycm9yKHJlZCgnWWFybiBhbHJlYWR5IHVwIHRvIGRhdGUnKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyoqIFRoZSB0aXRsZSBmb3IgdGhlIFBSLiAqL1xuICAgIGNvbnN0IHRpdGxlID0gYGJ1aWxkOiB1cGRhdGUgdG8geWFybiB2JHtuZXdZYXJuVmVyc2lvbn1gO1xuICAgIC8qKiBUaGUgYm9keSBmb3IgdGhlIFBSLiAqL1xuICAgIGNvbnN0IGJvZHkgPSBgVXBkYXRlIHRvIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiB5YXJuLCAke25ld1lhcm5WZXJzaW9ufS5gO1xuICAgIC8qKiBUaGUgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBjaGFuZ2UuICovXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGAke3RpdGxlfVxcblxcbiR7Ym9keX1gO1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgYnJhbmNoIHRvIHVzZSBvbiByZW1vdGUuICovXG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGB5YXJuLXVwZGF0ZS12JHtuZXdZYXJuVmVyc2lvbn1gO1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgb3duZXIgZm9yIHJlbW90ZSBicmFuY2ggb24gR2l0aHViLiAqL1xuICAgIGNvbnN0IHtvd25lcjogbG9jYWxPd25lcn0gPSBhd2FpdCBnaXQuZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdTdGFnaW5nIHlhcm4gdmVuZG9yaW5nIGZpbGVzIGFuZCBjcmVhdGluZyBjb21taXQnKTtcbiAgICBnaXQucnVuKFsnYWRkJywgJy55YXJuL3JlbGVhc2VzLyoqJywgJy55YXJucmMnXSk7XG4gICAgZ2l0LnJ1bihbJ2NvbW1pdCcsICctcScsICctLW5vLXZlcmlmeScsICctbScsIGNvbW1pdE1lc3NhZ2VdLCB7ZW52OiBza2lwSHVza3lFbnZ9KTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdQdXNoaW5nIGNvbW1pdCBjaGFuZ2VzIHRvIGdpdGh1Yi4nKTtcbiAgICBnaXQucnVuKFsncHVzaCcsICctcScsICdvcmlnaW4nLCAnLS1mb3JjZS13aXRoLWxlYXNlJywgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuXG4gICAgc3Bpbm5lci51cGRhdGUoJ0NyZWF0aW5nIGEgUFIgZm9yIHRoZSBjaGFuZ2VzLicpO1xuICAgIGNvbnN0IHtudW1iZXJ9ID0gKFxuICAgICAgYXdhaXQgZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgICAuLi5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYmFzZTogbWFpbkJyYW5jaE5hbWUsXG4gICAgICAgIGhlYWQ6IGAke2xvY2FsT3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgfSlcbiAgICApLmRhdGE7XG5cbiAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgaW5mbyhgQ3JlYXRlZCBQUiAjJHtudW1iZXJ9IHRvIHVwZGF0ZSB0byB5YXJuIHYke25ld1lhcm5WZXJzaW9ufWApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGVycm9yKHJlZCgnQWJvcnRlZCB5YXJuIHVwZGF0ZSBkbyB0byBlcnJvcnM6JykpO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgIGdpdC5jaGVja291dChvcmlnaW5hbEJyYW5jaE9yUmVmLCB0cnVlKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBnaXQuY2hlY2tvdXQob3JpZ2luYWxCcmFuY2hPclJlZiwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBVcGRhdGVZYXJuQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZSA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3VwZGF0ZS15YXJuJyxcbiAgZGVzY3JpYmU6ICdBdXRvbWF0aWNhbGx5IHVwZGF0ZSB0aGUgdmVuZG9yZWQgeWFybiB2ZXJzaW9uIGluIHRoZSByZXBvc2l0b3J5IGFuZCBjcmVhdGUgYSBQUicsXG59O1xuIl19