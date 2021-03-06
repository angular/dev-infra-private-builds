/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { addGithubTokenOption } from '../../utils/git/github-yargs';
import { updateCaretakerTeamViaPrompt } from './update-github-team';
/** Builds the command. */
function builder(yargs) {
    return addGithubTokenOption(yargs);
}
/** Handles the command. */
function handler() {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateCaretakerTeamViaPrompt();
    });
}
/** yargs command module for assisting in handing off caretaker.  */
export const HandoffModule = {
    handler,
    builder,
    command: 'handoff',
    describe: 'Run a handoff assistant to aide in moving to the next caretaker',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9oYW5kb2ZmL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFbEUsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFPbEUsMEJBQTBCO0FBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7SUFDMUIsT0FBTyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLFNBQWUsT0FBTzs7UUFDcEIsTUFBTSw0QkFBNEIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7Q0FBQTtBQUVELG9FQUFvRTtBQUNwRSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQStDO0lBQ3ZFLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLFNBQVM7SUFDbEIsUUFBUSxFQUFFLGlFQUFpRTtDQUM1RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHt1cGRhdGVDYXJldGFrZXJUZWFtVmlhUHJvbXB0fSBmcm9tICcuL3VwZGF0ZS1naXRodWItdGVhbSc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBDYXJldGFrZXJIYW5kb2ZmT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJncyk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgYXdhaXQgdXBkYXRlQ2FyZXRha2VyVGVhbVZpYVByb21wdCgpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZm9yIGFzc2lzdGluZyBpbiBoYW5kaW5nIG9mZiBjYXJldGFrZXIuICAqL1xuZXhwb3J0IGNvbnN0IEhhbmRvZmZNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENhcmV0YWtlckhhbmRvZmZPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ2hhbmRvZmYnLFxuICBkZXNjcmliZTogJ1J1biBhIGhhbmRvZmYgYXNzaXN0YW50IHRvIGFpZGUgaW4gbW92aW5nIHRvIHRoZSBuZXh0IGNhcmV0YWtlcicsXG59O1xuIl19