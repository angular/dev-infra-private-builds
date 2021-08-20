"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCaretakerParser = void 0;
const console_1 = require("console");
const config_1 = require("../utils/config");
const cli_1 = require("./check/cli");
const config_2 = require("./config");
const cli_2 = require("./handoff/cli");
/** Build the parser for the caretaker commands. */
function buildCaretakerParser(yargs) {
    return yargs
        .middleware(caretakerCommandCanRun, false)
        .command(cli_1.CheckModule)
        .command(cli_2.HandoffModule);
}
exports.buildCaretakerParser = buildCaretakerParser;
function caretakerCommandCanRun(argv) {
    const config = config_1.getConfig();
    try {
        config_2.assertValidCaretakerConfig(config);
    }
    catch {
        console_1.info('The `caretaker` command is not enabled in this repository.');
        console_1.info(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUNBQTZCO0FBRTdCLDRDQUEwQztBQUMxQyxxQ0FBd0M7QUFDeEMscUNBQW9EO0FBQ3BELHVDQUE0QztBQUU1QyxtREFBbUQ7QUFDbkQsU0FBZ0Isb0JBQW9CLENBQUMsS0FBVztJQUM5QyxPQUFPLEtBQUs7U0FDVCxVQUFVLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDO1NBQ3pDLE9BQU8sQ0FBQyxpQkFBVyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxtQkFBYSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUxELG9EQUtDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFlO0lBQzdDLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixJQUFJO1FBQ0YsbUNBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEM7SUFBQyxNQUFNO1FBQ04sY0FBSSxDQUFDLDREQUE0RCxDQUFDLENBQUM7UUFDbkUsY0FBSSxDQUFDLG9GQUFvRixDQUFDLENBQUM7UUFDM0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmZvfSBmcm9tICdjb25zb2xlJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7Q2hlY2tNb2R1bGV9IGZyb20gJy4vY2hlY2svY2xpJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRDYXJldGFrZXJDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7SGFuZG9mZk1vZHVsZX0gZnJvbSAnLi9oYW5kb2ZmL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ2FyZXRha2VyUGFyc2VyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgIC5taWRkbGV3YXJlKGNhcmV0YWtlckNvbW1hbmRDYW5SdW4sIGZhbHNlKVxuICAgIC5jb21tYW5kKENoZWNrTW9kdWxlKVxuICAgIC5jb21tYW5kKEhhbmRvZmZNb2R1bGUpO1xufVxuXG5mdW5jdGlvbiBjYXJldGFrZXJDb21tYW5kQ2FuUnVuKGFyZ3Y6IEFyZ3VtZW50cykge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgdHJ5IHtcbiAgICBhc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZyhjb25maWcpO1xuICB9IGNhdGNoIHtcbiAgICBpbmZvKCdUaGUgYGNhcmV0YWtlcmAgY29tbWFuZCBpcyBub3QgZW5hYmxlZCBpbiB0aGlzIHJlcG9zaXRvcnkuJyk7XG4gICAgaW5mbyhgICAgVG8gZW5hYmxlIGl0LCBwcm92aWRlIGEgY2FyZXRha2VyIGNvbmZpZyBpbiB0aGUgcmVwb3NpdG9yeSdzIC5uZy1kZXYvIGRpcmVjdG9yeWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19