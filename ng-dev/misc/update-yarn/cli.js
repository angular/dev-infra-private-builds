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
    /** Directory where node binary are globally installed. */
    const npmBinDir = (0, child_process_1.spawnSync)('npm', ['bin', '--global', 'yarn']).stdout.trim();
    /** The full path to the globally installed yarn binary. */
    const yarnBin = `${npmBinDir}/yarn`;
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
        (0, child_process_1.spawnSync)(yarnBin, ['policies', 'set-version', 'latest']);
        spinner.update('Confirming the version of yarn was updated.');
        const newYarnVersion = (0, child_process_1.spawnSync)(yarnBin, ['-v'], { env: useYarnPathEnv }).stdout.trim();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L21pc2MvdXBkYXRlLXlhcm4vY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUEyQztBQUMzQywrQkFBMEI7QUFFMUIsNkRBQW9EO0FBRXBELGlEQUFxRDtBQUNyRCxpREFBNEM7QUFDNUMsdUZBQWdGO0FBQ2hGLCtEQUFrRTtBQUVsRSxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQVc7SUFDaEMsT0FBTyxJQUFBLG1DQUFvQixFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCx1RkFBdUY7QUFDdkYsTUFBTSxjQUFjLEdBQUc7SUFDckIsR0FBRyxPQUFPLENBQUMsR0FBRztJQUNkLGdCQUFnQixFQUFFLEdBQUc7Q0FDdEIsQ0FBQztBQUVGLDREQUE0RDtBQUM1RCxNQUFNLFlBQVksR0FBRztJQUNuQixHQUFHLE9BQU8sQ0FBQyxHQUFHO0lBQ2QsS0FBSyxFQUFFLEdBQUc7Q0FDWCxDQUFDO0FBRUYsS0FBSyxVQUFVLE9BQU87SUFDcEIsMERBQTBEO0lBQzFELE1BQU0sU0FBUyxHQUFHLElBQUEseUJBQVMsRUFBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlFLDJEQUEyRDtJQUMzRCxNQUFNLE9BQU8sR0FBRyxHQUFHLFNBQVMsT0FBTyxDQUFDO0lBQ3BDLHdDQUF3QztJQUN4QyxNQUFNLEdBQUcsR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN6Qyw4Q0FBOEM7SUFDOUMsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztJQUMxQyxpRUFBaUU7SUFDakUsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUU3RCxJQUFJLEdB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Y2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3JlYWRkaXJTeW5jLCB1bmxpbmtTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5cbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NwaW5uZXInO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuXG5hc3luYyBmdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJncyk7XG59XG5cbi8qKiBFbnZpcm9ubWVudCBvYmplY3QgZW5hYmxpbmcgdGhlIHVzYWdlIG9mIHlhcm4tcGF0aCB0byBkZXRlcm1pbmUgdGhlIG5ldyB2ZXJzaW9uLiAqL1xuY29uc3QgdXNlWWFyblBhdGhFbnYgPSB7XG4gIC4uLnByb2Nlc3MuZW52LFxuICBZQVJOX0lHTk9SRV9QQVRIOiAnMCcsXG59O1xuXG4vKiogRW52aXJvbm1lbnQgb2JqZWN0IHRvIHByZXZlbnQgcnVubmluZyBodXNreSB3b3JrZmxvdy4gKi9cbmNvbnN0IHNraXBIdXNreUVudiA9IHtcbiAgLi4ucHJvY2Vzcy5lbnYsXG4gIEhVU0tZOiAnMCcsXG59O1xuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAvKiogRGlyZWN0b3J5IHdoZXJlIG5vZGUgYmluYXJ5IGFyZSBnbG9iYWxseSBpbnN0YWxsZWQuICovXG4gIGNvbnN0IG5wbUJpbkRpciA9IHNwYXduU3luYygnbnBtJywgWydiaW4nLCAnLS1nbG9iYWwnLCAneWFybiddKS5zdGRvdXQudHJpbSgpO1xuICAvKiogVGhlIGZ1bGwgcGF0aCB0byB0aGUgZ2xvYmFsbHkgaW5zdGFsbGVkIHlhcm4gYmluYXJ5LiAqL1xuICBjb25zdCB5YXJuQmluID0gYCR7bnBtQmluRGlyfS95YXJuYDtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBsb2NhbCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIG1haW4gYnJhbmNoIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IG1haW5CcmFuY2hOYW1lID0gZ2l0Lm1haW5CcmFuY2hOYW1lO1xuICAvKiogVGhlIG9yaWdpbmFsIGJyYW5jaCBvciByZWYgYmVmb3JlIHRoZSBjb21tYW5kIHdhcyBpbnZva2VkLiAqL1xuICBjb25zdCBvcmlnaW5hbEJyYW5jaE9yUmVmID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKHJlZCgnRm91bmQgY2hhbmdlcyBpbiB0aGUgbG9jYWwgcmVwb3NpdG9yeS4gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBmaWxlcy4nKSk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIEEgc3Bpbm5lciBpbnN0YW5jZS4gKi9cbiAgY29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKCcnKTtcbiAgdHJ5IHtcbiAgICBzcGlubmVyLnVwZGF0ZShgRmV0Y2hpbmcgdGhlIGxhdGVzdCBwcmltYXJ5IGJyYW5jaCBmcm9tIHVwc3RyZWFtOiBcIiR7bWFpbkJyYW5jaE5hbWV9XCJgKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBnaXQuZ2V0UmVwb0dpdFVybCgpLCBtYWluQnJhbmNoTmFtZV0pO1xuICAgIGdpdC5jaGVja291dCgnRkVUQ0hfSEVBRCcsIGZhbHNlKTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdSZW1vdmluZyBwcmV2aW91cyB5YXJuIHZlcnNpb24uJyk7XG4gICAgY29uc3QgeWFyblJlbGVhc2VzRGlyID0gam9pbihnaXQuYmFzZURpciwgJy55YXJuL3JlbGVhc2VzJyk7XG4gICAgcmVhZGRpclN5bmMoeWFyblJlbGVhc2VzRGlyKS5mb3JFYWNoKChmaWxlKSA9PiB1bmxpbmtTeW5jKGpvaW4oeWFyblJlbGVhc2VzRGlyLCBmaWxlKSkpO1xuXG4gICAgc3Bpbm5lci51cGRhdGUoJ1VwZGF0aW5nIHlhcm4gdmVyc2lvbi4nKTtcbiAgICBzcGF3blN5bmMoeWFybkJpbiwgWydwb2xpY2llcycsICdzZXQtdmVyc2lvbicsICdsYXRlc3QnXSk7XG5cbiAgICBzcGlubmVyLnVwZGF0ZSgnQ29uZmlybWluZyB0aGUgdmVyc2lvbiBvZiB5YXJuIHdhcyB1cGRhdGVkLicpO1xuICAgIGNvbnN0IG5ld1lhcm5WZXJzaW9uID0gc3Bhd25TeW5jKHlhcm5CaW4sIFsnLXYnXSwge2VudjogdXNlWWFyblBhdGhFbnZ9KS5zdGRvdXQudHJpbSgpO1xuICAgIGlmIChnaXQucnVuKFsnc3RhdHVzJywgJy0tcG9yY2VsYWluJ10pLnN0ZG91dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICAgIGVycm9yKHJlZCgnWWFybiBhbHJlYWR5IHVwIHRvIGRhdGUnKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyoqIFRoZSB0aXRsZSBmb3IgdGhlIFBSLiAqL1xuICAgIGNvbnN0IHRpdGxlID0gYGJ1aWxkOiB1cGRhdGUgdG8geWFybiB2JHtuZXdZYXJuVmVyc2lvbn1gO1xuICAgIC8qKiBUaGUgYm9keSBmb3IgdGhlIFBSLiAqL1xuICAgIGNvbnN0IGJvZHkgPSBgVXBkYXRlIHRvIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiB5YXJuLCAke25ld1lhcm5WZXJzaW9ufS5gO1xuICAgIC8qKiBUaGUgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBjaGFuZ2UuICovXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGAke3RpdGxlfVxcblxcbiR7Ym9keX1gO1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgYnJhbmNoIHRvIHVzZSBvbiByZW1vdGUuICovXG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGB5YXJuLXVwZGF0ZS12JHtuZXdZYXJuVmVyc2lvbn1gO1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgb3duZXIgZm9yIHJlbW90ZSBicmFuY2ggb24gR2l0aHViLiAqL1xuICAgIGNvbnN0IHtvd25lcjogbG9jYWxPd25lcn0gPSBhd2FpdCBnaXQuZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdTdGFnaW5nIHlhcm4gdmVuZG9yaW5nIGZpbGVzIGFuZCBjcmVhdGluZyBjb21taXQnKTtcbiAgICBnaXQucnVuKFsnYWRkJywgJy55YXJuL3JlbGVhc2VzLyoqJywgJy55YXJucmMnXSk7XG4gICAgZ2l0LnJ1bihbJ2NvbW1pdCcsICctcScsICctLW5vLXZlcmlmeScsICctbScsIGNvbW1pdE1lc3NhZ2VdLCB7ZW52OiBza2lwSHVza3lFbnZ9KTtcblxuICAgIHNwaW5uZXIudXBkYXRlKCdQdXNoaW5nIGNvbW1pdCBjaGFuZ2VzIHRvIGdpdGh1Yi4nKTtcbiAgICBnaXQucnVuKFsncHVzaCcsICctcScsICdvcmlnaW4nLCAnLS1mb3JjZS13aXRoLWxlYXNlJywgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuXG4gICAgc3Bpbm5lci51cGRhdGUoJ0NyZWF0aW5nIGEgUFIgZm9yIHRoZSBjaGFuZ2VzLicpO1xuICAgIGNvbnN0IHtudW1iZXJ9ID0gKFxuICAgICAgYXdhaXQgZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgICAuLi5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgYm9keSxcbiAgICAgICAgYmFzZTogbWFpbkJyYW5jaE5hbWUsXG4gICAgICAgIGhlYWQ6IGAke2xvY2FsT3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgfSlcbiAgICApLmRhdGE7XG5cbiAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgaW5mbyhgQ3JlYXRlZCBQUiAjJHtudW1iZXJ9IHRvIHVwZGF0ZSB0byB5YXJuIHYke25ld1lhcm5WZXJzaW9ufWApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGVycm9yKHJlZCgnQWJvcnRlZCB5YXJuIHVwZGF0ZSBkbyB0byBlcnJvcnM6JykpO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgIGdpdC5jaGVja291dChvcmlnaW5hbEJyYW5jaE9yUmVmLCB0cnVlKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBnaXQuY2hlY2tvdXQob3JpZ2luYWxCcmFuY2hPclJlZiwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBVcGRhdGVZYXJuQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZSA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3VwZGF0ZS15YXJuJyxcbiAgZGVzY3JpYmU6ICdBdXRvbWF0aWNhbGx5IHVwZGF0ZSB0aGUgdmVuZG9yZWQgeWFybiB2ZXJzaW9uIGluIHRoZSByZXBvc2l0b3J5IGFuZCBjcmVhdGUgYSBQUicsXG59O1xuIl19