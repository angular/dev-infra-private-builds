(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge/messages", ["require", "exports", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTargettedBranchesConfirmationPromptMessage = exports.getCaretakerNotePromptMessage = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
    function getCaretakerNotePromptMessage(pullRequest) {
        return console_1.red('Pull request has a caretaker note applied. Please make sure you read it.') +
            ("\nQuick link to PR: " + pullRequest.url + "\nDo you want to proceed merging?");
    }
    exports.getCaretakerNotePromptMessage = getCaretakerNotePromptMessage;
    function getTargettedBranchesConfirmationPromptMessage(pullRequest) {
        var targetBranchListAsString = pullRequest.targetBranches.map(function (b) { return " - " + b + "\n"; }).join('');
        return "Pull request #" + pullRequest.prNumber + " will merge into:\n" + targetBranchListAsString + "\nDo you want to proceed merging?";
    }
    exports.getTargettedBranchesConfirmationPromptMessage = getTargettedBranchesConfirmationPromptMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXdDO0lBSXhDLFNBQWdCLDZCQUE2QixDQUFDLFdBQXdCO1FBQ3BFLE9BQU8sYUFBRyxDQUFDLDBFQUEwRSxDQUFDO2FBQ2xGLHlCQUF1QixXQUFXLENBQUMsR0FBRyxzQ0FBbUMsQ0FBQSxDQUFDO0lBQ2hGLENBQUM7SUFIRCxzRUFHQztJQUVELFNBQWdCLDZDQUE2QyxDQUFDLFdBQXdCO1FBQ3BGLElBQU0sd0JBQXdCLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFNLENBQUMsT0FBSSxFQUFYLENBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRixPQUFPLG1CQUFpQixXQUFXLENBQUMsUUFBUSwyQkFDeEMsd0JBQXdCLHNDQUFtQyxDQUFDO0lBQ2xFLENBQUM7SUFKRCxzR0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICByZXR1cm4gcmVkKCdQdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UgcmVhZCBpdC4nKSArXG4gICAgICBgXFxuUXVpY2sgbGluayB0byBQUjogJHtwdWxsUmVxdWVzdC51cmx9XFxuRG8geW91IHdhbnQgdG8gcHJvY2VlZCBtZXJnaW5nP2A7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogc3RyaW5nIHtcbiAgY29uc3QgdGFyZ2V0QnJhbmNoTGlzdEFzU3RyaW5nID0gcHVsbFJlcXVlc3QudGFyZ2V0QnJhbmNoZXMubWFwKGIgPT4gYCAtICR7Yn1cXG5gKS5qb2luKCcnKTtcbiAgcmV0dXJuIGBQdWxsIHJlcXVlc3QgIyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9IHdpbGwgbWVyZ2UgaW50bzpcXG4ke1xuICAgICAgdGFyZ2V0QnJhbmNoTGlzdEFzU3RyaW5nfVxcbkRvIHlvdSB3YW50IHRvIHByb2NlZWQgbWVyZ2luZz9gO1xufVxuIl19