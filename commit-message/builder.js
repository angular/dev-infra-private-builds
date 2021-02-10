(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/builder", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessage = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var config_1 = require("@angular/dev-infra-private/commit-message/config");
    /** Validate commit message at the provided file path. */
    function buildCommitMessage() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var type, scope, summary;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // TODO(josephperrott): Add support for skipping wizard with local untracked config file
                        // TODO(josephperrott): Add default commit message information/commenting into generated messages
                        console_1.info('Just a few questions to start building the commit message!');
                        return [4 /*yield*/, promptForCommitMessageType()];
                    case 1:
                        type = _a.sent();
                        return [4 /*yield*/, promptForCommitMessageScopeForType(type)];
                    case 2:
                        scope = _a.sent();
                        return [4 /*yield*/, promptForCommitMessageSummary()];
                    case 3:
                        summary = _a.sent();
                        return [2 /*return*/, "" + type.name + (scope ? '(' + scope + ')' : '') + ": " + summary + "\n\n"];
                }
            });
        });
    }
    exports.buildCommitMessage = buildCommitMessage;
    /** Prompts in the terminal for the commit message's type. */
    function promptForCommitMessageType() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var typeOptions, typeName;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console_1.info('The type of change in the commit. Allows a reader to know the effect of the change,');
                        console_1.info('whether it brings a new feature, adds additional testing, documents the `project, etc.');
                        typeOptions = Object.values(config_1.COMMIT_TYPES).map(function (_a) {
                            var description = _a.description, name = _a.name;
                            return {
                                name: name + " - " + description,
                                value: name,
                                short: name,
                            };
                        });
                        return [4 /*yield*/, console_1.promptAutocomplete('Select a type for the commit:', typeOptions)];
                    case 1:
                        typeName = _a.sent();
                        return [2 /*return*/, config_1.COMMIT_TYPES[typeName]];
                }
            });
        });
    }
    /** Prompts in the terminal for the commit message's scope. */
    function promptForCommitMessageScopeForType(type) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the commit type's scope requirement is forbidden, return early.
                        if (type.scope === config_1.ScopeRequirement.Forbidden) {
                            console_1.info("Skipping scope selection as the '" + type.name + "' type does not allow scopes");
                            return [2 /*return*/, false];
                        }
                        config = config_1.getCommitMessageConfig();
                        console_1.info('The area of the repository the changes in this commit most affects.');
                        return [4 /*yield*/, console_1.promptAutocomplete('Select a scope for the commit:', config.commitMessage.scopes, type.scope === config_1.ScopeRequirement.Optional ? '<no scope>' : '')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    /** Prompts in the terminal for the commit message's summary. */
    function promptForCommitMessageSummary() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console_1.info('Provide a short summary of what the changes in the commit do');
                        return [4 /*yield*/, console_1.promptInput('Provide a short summary of the commit')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFTQSxvRUFBdUU7SUFFdkUsMkVBQTRGO0lBRTVGLHlEQUF5RDtJQUN6RCxTQUFzQixrQkFBa0I7Ozs7Ozt3QkFDdEMsd0ZBQXdGO3dCQUN4RixpR0FBaUc7d0JBQ2pHLGNBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO3dCQUd0RCxxQkFBTSwwQkFBMEIsRUFBRSxFQUFBOzt3QkFBekMsSUFBSSxHQUFHLFNBQWtDO3dCQUVqQyxxQkFBTSxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsRUFBQTs7d0JBQXRELEtBQUssR0FBRyxTQUE4Qzt3QkFFNUMscUJBQU0sNkJBQTZCLEVBQUUsRUFBQTs7d0JBQS9DLE9BQU8sR0FBRyxTQUFxQzt3QkFFckQsc0JBQU8sS0FBRyxJQUFJLENBQUMsSUFBSSxJQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBSyxPQUFPLFNBQU0sRUFBQzs7OztLQUN4RTtJQWJELGdEQWFDO0lBRUQsNkRBQTZEO0lBQzdELFNBQWUsMEJBQTBCOzs7Ozs7d0JBQ3ZDLGNBQUksQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO3dCQUM1RixjQUFJLENBQUMsd0ZBQXdGLENBQUMsQ0FBQzt3QkFHekYsV0FBVyxHQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQW1CO2dDQUFsQixXQUFXLGlCQUFBLEVBQUUsSUFBSSxVQUFBOzRCQUNqRCxPQUFPO2dDQUNMLElBQUksRUFBSyxJQUFJLFdBQU0sV0FBYTtnQ0FDaEMsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsS0FBSyxFQUFFLElBQUk7NkJBQ1osQ0FBQzt3QkFDSixDQUFDLENBQUMsQ0FBQzt3QkFFVSxxQkFBTSw0QkFBa0IsQ0FBQywrQkFBK0IsRUFBRSxXQUFXLENBQUMsRUFBQTs7d0JBQWpGLFFBQVEsR0FBRyxTQUFzRTt3QkFFdkYsc0JBQU8scUJBQVksQ0FBQyxRQUFRLENBQUMsRUFBQzs7OztLQUMvQjtJQUVELDhEQUE4RDtJQUM5RCxTQUFlLGtDQUFrQyxDQUFDLElBQWdCOzs7Ozs7d0JBQ2hFLHFFQUFxRTt3QkFDckUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLHlCQUFnQixDQUFDLFNBQVMsRUFBRTs0QkFDN0MsY0FBSSxDQUFDLHNDQUFvQyxJQUFJLENBQUMsSUFBSSxpQ0FBOEIsQ0FBQyxDQUFDOzRCQUNsRixzQkFBTyxLQUFLLEVBQUM7eUJBQ2Q7d0JBRUssTUFBTSxHQUFHLCtCQUFzQixFQUFFLENBQUM7d0JBRXhDLGNBQUksQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO3dCQUNyRSxxQkFBTSw0QkFBa0IsQ0FDM0IsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQzdELElBQUksQ0FBQyxLQUFLLEtBQUsseUJBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFBOzRCQUZqRSxzQkFBTyxTQUUwRCxFQUFDOzs7O0tBQ25FO0lBRUQsZ0VBQWdFO0lBQ2hFLFNBQWUsNkJBQTZCOzs7Ozt3QkFDMUMsY0FBSSxDQUFDLDhEQUE4RCxDQUFDLENBQUM7d0JBQzlELHFCQUFNLHFCQUFXLENBQUMsdUNBQXVDLENBQUMsRUFBQTs0QkFBakUsc0JBQU8sU0FBMEQsRUFBQzs7OztLQUNuRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtMaXN0Q2hvaWNlT3B0aW9uc30gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge2luZm8sIHByb21wdEF1dG9jb21wbGV0ZSwgcHJvbXB0SW5wdXR9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgQ29tbWl0VHlwZSwgZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZywgU2NvcGVSZXF1aXJlbWVudH0gZnJvbSAnLi9jb25maWcnO1xuXG4vKiogVmFsaWRhdGUgY29tbWl0IG1lc3NhZ2UgYXQgdGhlIHByb3ZpZGVkIGZpbGUgcGF0aC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZENvbW1pdE1lc3NhZ2UoKSB7XG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IEFkZCBzdXBwb3J0IGZvciBza2lwcGluZyB3aXphcmQgd2l0aCBsb2NhbCB1bnRyYWNrZWQgY29uZmlnIGZpbGVcbiAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogQWRkIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgaW5mb3JtYXRpb24vY29tbWVudGluZyBpbnRvIGdlbmVyYXRlZCBtZXNzYWdlc1xuICBpbmZvKCdKdXN0IGEgZmV3IHF1ZXN0aW9ucyB0byBzdGFydCBidWlsZGluZyB0aGUgY29tbWl0IG1lc3NhZ2UhJyk7XG5cbiAgLyoqIFRoZSBjb21taXQgbWVzc2FnZSB0eXBlLiAqL1xuICBjb25zdCB0eXBlID0gYXdhaXQgcHJvbXB0Rm9yQ29tbWl0TWVzc2FnZVR5cGUoKTtcbiAgLyoqIFRoZSBjb21taXQgbWVzc2FnZSBzY29wZS4gKi9cbiAgY29uc3Qgc2NvcGUgPSBhd2FpdCBwcm9tcHRGb3JDb21taXRNZXNzYWdlU2NvcGVGb3JUeXBlKHR5cGUpO1xuICAvKiogVGhlIGNvbW1pdCBtZXNzYWdlIHN1bW1hcnkuICovXG4gIGNvbnN0IHN1bW1hcnkgPSBhd2FpdCBwcm9tcHRGb3JDb21taXRNZXNzYWdlU3VtbWFyeSgpO1xuXG4gIHJldHVybiBgJHt0eXBlLm5hbWV9JHtzY29wZSA/ICcoJyArIHNjb3BlICsgJyknIDogJyd9OiAke3N1bW1hcnl9XFxuXFxuYDtcbn1cblxuLyoqIFByb21wdHMgaW4gdGhlIHRlcm1pbmFsIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UncyB0eXBlLiAqL1xuYXN5bmMgZnVuY3Rpb24gcHJvbXB0Rm9yQ29tbWl0TWVzc2FnZVR5cGUoKTogUHJvbWlzZTxDb21taXRUeXBlPiB7XG4gIGluZm8oJ1RoZSB0eXBlIG9mIGNoYW5nZSBpbiB0aGUgY29tbWl0LiBBbGxvd3MgYSByZWFkZXIgdG8ga25vdyB0aGUgZWZmZWN0IG9mIHRoZSBjaGFuZ2UsJyk7XG4gIGluZm8oJ3doZXRoZXIgaXQgYnJpbmdzIGEgbmV3IGZlYXR1cmUsIGFkZHMgYWRkaXRpb25hbCB0ZXN0aW5nLCBkb2N1bWVudHMgdGhlIGBwcm9qZWN0LCBldGMuJyk7XG5cbiAgLyoqIExpc3Qgb2YgY29tbWl0IHR5cGUgb3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZSBwcm9tcHQuICovXG4gIGNvbnN0IHR5cGVPcHRpb25zOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID1cbiAgICAgIE9iamVjdC52YWx1ZXMoQ09NTUlUX1RZUEVTKS5tYXAoKHtkZXNjcmlwdGlvbiwgbmFtZX0pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBgJHtuYW1lfSAtICR7ZGVzY3JpcHRpb259YCxcbiAgICAgICAgICB2YWx1ZTogbmFtZSxcbiAgICAgICAgICBzaG9ydDogbmFtZSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAvKiogVGhlIGtleSBvZiBhIGNvbW1pdCBtZXNzYWdlIHR5cGUsIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIHZpYSBwcm9tcHQuICovXG4gIGNvbnN0IHR5cGVOYW1lID0gYXdhaXQgcHJvbXB0QXV0b2NvbXBsZXRlKCdTZWxlY3QgYSB0eXBlIGZvciB0aGUgY29tbWl0OicsIHR5cGVPcHRpb25zKTtcblxuICByZXR1cm4gQ09NTUlUX1RZUEVTW3R5cGVOYW1lXTtcbn1cblxuLyoqIFByb21wdHMgaW4gdGhlIHRlcm1pbmFsIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UncyBzY29wZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByb21wdEZvckNvbW1pdE1lc3NhZ2VTY29wZUZvclR5cGUodHlwZTogQ29tbWl0VHlwZSk6IFByb21pc2U8c3RyaW5nfGZhbHNlPiB7XG4gIC8vIElmIHRoZSBjb21taXQgdHlwZSdzIHNjb3BlIHJlcXVpcmVtZW50IGlzIGZvcmJpZGRlbiwgcmV0dXJuIGVhcmx5LlxuICBpZiAodHlwZS5zY29wZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4pIHtcbiAgICBpbmZvKGBTa2lwcGluZyBzY29wZSBzZWxlY3Rpb24gYXMgdGhlICcke3R5cGUubmFtZX0nIHR5cGUgZG9lcyBub3QgYWxsb3cgc2NvcGVzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8qKiBDb21taXQgbWVzc2FnZSBjb25maWd1cmF0aW9uICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbW1pdE1lc3NhZ2VDb25maWcoKTtcblxuICBpbmZvKCdUaGUgYXJlYSBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgY2hhbmdlcyBpbiB0aGlzIGNvbW1pdCBtb3N0IGFmZmVjdHMuJyk7XG4gIHJldHVybiBhd2FpdCBwcm9tcHRBdXRvY29tcGxldGUoXG4gICAgICAnU2VsZWN0IGEgc2NvcGUgZm9yIHRoZSBjb21taXQ6JywgY29uZmlnLmNvbW1pdE1lc3NhZ2Uuc2NvcGVzLFxuICAgICAgdHlwZS5zY29wZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCA/ICc8bm8gc2NvcGU+JyA6ICcnKTtcbn1cblxuLyoqIFByb21wdHMgaW4gdGhlIHRlcm1pbmFsIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UncyBzdW1tYXJ5LiAqL1xuYXN5bmMgZnVuY3Rpb24gcHJvbXB0Rm9yQ29tbWl0TWVzc2FnZVN1bW1hcnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaW5mbygnUHJvdmlkZSBhIHNob3J0IHN1bW1hcnkgb2Ygd2hhdCB0aGUgY2hhbmdlcyBpbiB0aGUgY29tbWl0IGRvJyk7XG4gIHJldHVybiBhd2FpdCBwcm9tcHRJbnB1dCgnUHJvdmlkZSBhIHNob3J0IHN1bW1hcnkgb2YgdGhlIGNvbW1pdCcpO1xufVxuIl19