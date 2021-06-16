/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { spawnInteractiveCommand, spawnWithDebugOutput } from '../../utils/child-process';
/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
export function runNpmPublish(packagePath, distTag, registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['publish', '--access', 'public', '--tag', distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { cwd: packagePath, mode: 'silent' });
    });
}
/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
export function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
    });
}
/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
export function npmIsLoggedIn(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['whoami'];
        // If a custom registry URL has been specified, add the `--registry` flag.
        if (registryUrl !== undefined) {
            args.push('--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        catch (e) {
            return false;
        }
        return true;
    });
}
/**
 * Log into NPM at a provided registry.
 * @throws With the `npm login` status code if the login failed.
 */
export function npmLogin(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['login', '--no-browser'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the login subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        // The login command prompts for username, password and other profile information. Hence
        // the process needs to be interactive (i.e. respecting current TTYs stdin).
        yield spawnInteractiveCommand('npm', args);
    });
}
/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
export function npmLogout(registryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['logout'];
        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
        // must be spliced into the correct place in the command as npm expects it to be the flag
        // immediately following the logout subcommand.
        if (registryUrl !== undefined) {
            args.splice(1, 0, '--registry', registryUrl);
        }
        try {
            yield spawnWithDebugOutput('npm', args, { mode: 'silent' });
        }
        finally {
            return npmIsLoggedIn(registryUrl);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUd4Rjs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLGFBQWEsQ0FDL0IsV0FBbUIsRUFBRSxPQUFtQixFQUFFLFdBQTZCOztRQUN6RSxNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRSwwRUFBMEU7UUFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLG1CQUFtQixDQUNyQyxXQUFtQixFQUFFLE9BQWUsRUFBRSxPQUFzQixFQUFFLFdBQTZCOztRQUM3RixNQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxXQUFXLElBQUksT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsMEVBQTBFO1FBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUN0QztRQUNELE1BQU0sb0JBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsYUFBYSxDQUFDLFdBQTZCOztRQUMvRCxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLDBFQUEwRTtRQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJO1lBQ0YsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7U0FDM0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0IsUUFBUSxDQUFDLFdBQTZCOztRQUMxRCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2QyxnR0FBZ0c7UUFDaEcseUZBQXlGO1FBQ3pGLDhDQUE4QztRQUM5QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM5QztRQUNELHdGQUF3RjtRQUN4Riw0RUFBNEU7UUFDNUUsTUFBTSx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQixTQUFTLENBQUMsV0FBNkI7O1FBQzNELE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsZ0dBQWdHO1FBQ2hHLHlGQUF5RjtRQUN6RiwrQ0FBK0M7UUFDL0MsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJO1lBQ0YsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7U0FDM0Q7Z0JBQVM7WUFDUixPQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7c3Bhd25JbnRlcmFjdGl2ZUNvbW1hbmQsIHNwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKipcbiAqIFJ1bnMgTlBNIHB1Ymxpc2ggd2l0aGluIGEgc3BlY2lmaWVkIHBhY2thZ2UgZGlyZWN0b3J5LlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHB1Ymxpc2ggZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTnBtUHVibGlzaChcbiAgICBwYWNrYWdlUGF0aDogc3RyaW5nLCBkaXN0VGFnOiBOcG1EaXN0VGFnLCByZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydwdWJsaXNoJywgJy0tYWNjZXNzJywgJ3B1YmxpYycsICctLXRhZycsIGRpc3RUYWddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge2N3ZDogcGFja2FnZVBhdGgsIG1vZGU6ICdzaWxlbnQnfSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgTlBNIHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24gZm9yIHRoZSBnaXZlbiBwYWNrYWdlLlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHRhZ2dpbmcgZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TnBtVGFnRm9yUGFja2FnZShcbiAgICBwYWNrYWdlTmFtZTogc3RyaW5nLCBkaXN0VGFnOiBzdHJpbmcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2Rpc3QtdGFnJywgJ2FkZCcsIGAke3BhY2thZ2VOYW1lfUAke3ZlcnNpb259YCwgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9nZ2VkIGludG8gTlBNLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9nZ2VkIGludG8gTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtSXNMb2dnZWRJbihyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWyd3aG9hbWknXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogTG9nIGludG8gTlBNIGF0IGEgcHJvdmlkZWQgcmVnaXN0cnkuXG4gKiBAdGhyb3dzIFdpdGggdGhlIGBucG0gbG9naW5gIHN0YXR1cyBjb2RlIGlmIHRoZSBsb2dpbiBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Mb2dpbihyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydsb2dpbicsICctLW5vLWJyb3dzZXInXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9naW4gc3ViY29tbWFuZC5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCAnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICAvLyBUaGUgbG9naW4gY29tbWFuZCBwcm9tcHRzIGZvciB1c2VybmFtZSwgcGFzc3dvcmQgYW5kIG90aGVyIHByb2ZpbGUgaW5mb3JtYXRpb24uIEhlbmNlXG4gIC8vIHRoZSBwcm9jZXNzIG5lZWRzIHRvIGJlIGludGVyYWN0aXZlIChpLmUuIHJlc3BlY3RpbmcgY3VycmVudCBUVFlzIHN0ZGluKS5cbiAgYXdhaXQgc3Bhd25JbnRlcmFjdGl2ZUNvbW1hbmQoJ25wbScsIGFyZ3MpO1xufVxuXG4vKipcbiAqIExvZyBvdXQgb2YgTlBNIGF0IGEgcHJvdmlkZWQgcmVnaXN0cnkuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIHdhcyBsb2dnZWQgb3V0IG9mIE5QTS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUxvZ291dChyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWydsb2dvdXQnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9nb3V0IHN1YmNvbW1hbmQuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5zcGxpY2UoMSwgMCwgJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gZmluYWxseSB7XG4gICAgcmV0dXJuIG5wbUlzTG9nZ2VkSW4ocmVnaXN0cnlVcmwpO1xuICB9XG59XG4iXX0=