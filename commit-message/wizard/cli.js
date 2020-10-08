/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/wizard/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/commit-message/wizard/wizard"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WizardModule = void 0;
    var tslib_1 = require("tslib");
    var wizard_1 = require("@angular/dev-infra-private/commit-message/wizard/wizard");
    /** Builds the command. */
    function builder(yargs) {
        return yargs
            .positional('filePath', {
            description: 'The file path to write the generated commit message into',
            type: 'string',
            demandOption: true,
        })
            .positional('source', {
            choices: ['message', 'template', 'merge', 'squash', 'commit'],
            description: 'The source of the commit message as described here: ' +
                'https://git-scm.com/docs/githooks#_prepare_commit_msg'
        })
            .positional('commitSha', {
            description: 'The commit sha if source is set to `commit`',
            type: 'string',
        });
    }
    /** Handles the command. */
    function handler(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wizard_1.runWizard(args)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.WizardModule = {
        handler: handler,
        builder: builder,
        command: 'wizard <filePath> [source] [commitSha]',
        // Description: Run the wizard to build a base commit message before opening to complete.
        // No describe is defiend to hide the command from the --help.
        describe: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3dpemFyZC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQU1ILGtGQUFtQztJQVNuQywwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUs7YUFDUCxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ3RCLFdBQVcsRUFBRSwwREFBMEQ7WUFDdkUsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDO2FBQ0QsVUFBVSxDQUFDLFFBQVEsRUFBRTtZQUNwQixPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFVO1lBQ3RFLFdBQVcsRUFBRSxzREFBc0Q7Z0JBQy9ELHVEQUF1RDtTQUM1RCxDQUFDO2FBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRTtZQUN2QixXQUFXLEVBQUUsNkNBQTZDO1lBQzFELElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixTQUFlLE9BQU8sQ0FBQyxJQUE4Qjs7Ozs0QkFDbkQscUJBQU0sa0JBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQTs7d0JBQXJCLFNBQXFCLENBQUM7Ozs7O0tBQ3ZCO0lBRUQsb0RBQW9EO0lBQ3ZDLFFBQUEsWUFBWSxHQUFxQztRQUM1RCxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsd0NBQXdDO1FBQ2pELHlGQUF5RjtRQUN6Riw4REFBOEQ7UUFDOUQsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi4vY29tbWl0LW1lc3NhZ2Utc291cmNlJztcblxuaW1wb3J0IHtydW5XaXphcmR9IGZyb20gJy4vd2l6YXJkJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFdpemFyZE9wdGlvbnMge1xuICBmaWxlUGF0aDogc3RyaW5nO1xuICBjb21taXRTaGE6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIHNvdXJjZTogQ29tbWl0TXNnU291cmNlfHVuZGVmaW5lZDtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgICAucG9zaXRpb25hbCgnZmlsZVBhdGgnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZpbGUgcGF0aCB0byB3cml0ZSB0aGUgZ2VuZXJhdGVkIGNvbW1pdCBtZXNzYWdlIGludG8nLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCdzb3VyY2UnLCB7XG4gICAgICAgIGNob2ljZXM6IFsnbWVzc2FnZScsICd0ZW1wbGF0ZScsICdtZXJnZScsICdzcXVhc2gnLCAnY29tbWl0J10gYXMgY29uc3QsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHNvdXJjZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgYXMgZGVzY3JpYmVkIGhlcmU6ICcgK1xuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJ1xuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCdjb21taXRTaGEnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGNvbW1pdCBzaGEgaWYgc291cmNlIGlzIHNldCB0byBgY29tbWl0YCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihhcmdzOiBBcmd1bWVudHM8V2l6YXJkT3B0aW9ucz4pIHtcbiAgYXdhaXQgcnVuV2l6YXJkKGFyZ3MpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gICovXG5leHBvcnQgY29uc3QgV2l6YXJkTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBXaXphcmRPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ3dpemFyZCA8ZmlsZVBhdGg+IFtzb3VyY2VdIFtjb21taXRTaGFdJyxcbiAgLy8gRGVzY3JpcHRpb246IFJ1biB0aGUgd2l6YXJkIHRvIGJ1aWxkIGEgYmFzZSBjb21taXQgbWVzc2FnZSBiZWZvcmUgb3BlbmluZyB0byBjb21wbGV0ZS5cbiAgLy8gTm8gZGVzY3JpYmUgaXMgZGVmaWVuZCB0byBoaWRlIHRoZSBjb21tYW5kIGZyb20gdGhlIC0taGVscC5cbiAgZGVzY3JpYmU6IGZhbHNlLFxufTtcbiJdfQ==