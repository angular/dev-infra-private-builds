/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPrParser = void 0;
    var yargs = require("yargs");
    var discover_new_conflicts_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts");
    /** A Date object 30 days ago. */
    var THIRTY_DAYS_AGO = (function () {
        var date = new Date();
        // Set the hours, minutes and seconds to 0 to only consider date.
        date.setHours(0, 0, 0, 0);
        // Set the date to 30 days in the past.
        date.setDate(date.getDate() - 30);
        return date;
    })();
    /** Build the parser for the pr commands. */
    function buildPrParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('discover-new-conflicts <pr>', 'Check if a pending PR causes new conflicts for other pending PRs', function (args) {
            return args.option('date', {
                description: 'Only consider PRs updated since provided date',
                defaultDescription: '30 days ago',
                coerce: Date.parse,
                default: THIRTY_DAYS_AGO,
            });
        }, function (_a) {
            var pr = _a.pr, date = _a.date;
            // If a provided date is not able to be parsed, yargs provides it as NaN.
            if (isNaN(date)) {
                console.error('Unable to parse the value provided via --date flag');
                process.exit(1);
            }
            discover_new_conflicts_1.discoverNewConflictsForPr(pr, date);
        });
    }
    exports.buildPrParser = buildPrParser;
    if (require.main === module) {
        buildPrParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBK0I7SUFDL0IsK0ZBQW1FO0lBRW5FLGlDQUFpQztJQUNqQyxJQUFNLGVBQWUsR0FBRyxDQUFDO1FBQ3ZCLElBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDeEIsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVMLDRDQUE0QztJQUM1QyxTQUFnQixhQUFhLENBQUMsVUFBc0I7UUFDbEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUNyRCw2QkFBNkIsRUFDN0Isa0VBQWtFLEVBQ2xFLFVBQUEsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pCLFdBQVcsRUFBRSwrQ0FBK0M7Z0JBQzVELGtCQUFrQixFQUFFLGFBQWE7Z0JBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDbEIsT0FBTyxFQUFFLGVBQWU7YUFDekIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxFQUNELFVBQUMsRUFBVTtnQkFBVCxFQUFFLFFBQUEsRUFBRSxJQUFJLFVBQUE7WUFDUix5RUFBeUU7WUFDekUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2dCQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1lBQ0Qsa0RBQXlCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQXBCRCxzQ0FvQkM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByfSBmcm9tICcuL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMnO1xuXG4vKiogQSBEYXRlIG9iamVjdCAzMCBkYXlzIGFnby4gKi9cbmNvbnN0IFRISVJUWV9EQVlTX0FHTyA9ICgoKSA9PiB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAvLyBTZXQgdGhlIGhvdXJzLCBtaW51dGVzIGFuZCBzZWNvbmRzIHRvIDAgdG8gb25seSBjb25zaWRlciBkYXRlLlxuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAvLyBTZXQgdGhlIGRhdGUgdG8gMzAgZGF5cyBpbiB0aGUgcGFzdC5cbiAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gMzApO1xuICByZXR1cm4gZGF0ZTtcbn0pKCk7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgcHIgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQclBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKS5zdHJpY3QoKS5kZW1hbmRDb21tYW5kKCkuY29tbWFuZChcbiAgICAgICdkaXNjb3Zlci1uZXctY29uZmxpY3RzIDxwcj4nLFxuICAgICAgJ0NoZWNrIGlmIGEgcGVuZGluZyBQUiBjYXVzZXMgbmV3IGNvbmZsaWN0cyBmb3Igb3RoZXIgcGVuZGluZyBQUnMnLFxuICAgICAgYXJncyA9PiB7XG4gICAgICAgIHJldHVybiBhcmdzLm9wdGlvbignZGF0ZScsIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ09ubHkgY29uc2lkZXIgUFJzIHVwZGF0ZWQgc2luY2UgcHJvdmlkZWQgZGF0ZScsXG4gICAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnMzAgZGF5cyBhZ28nLFxuICAgICAgICAgIGNvZXJjZTogRGF0ZS5wYXJzZSxcbiAgICAgICAgICBkZWZhdWx0OiBUSElSVFlfREFZU19BR08sXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgICh7cHIsIGRhdGV9KSA9PiB7XG4gICAgICAgIC8vIElmIGEgcHJvdmlkZWQgZGF0ZSBpcyBub3QgYWJsZSB0byBiZSBwYXJzZWQsIHlhcmdzIHByb3ZpZGVzIGl0IGFzIE5hTi5cbiAgICAgICAgaWYgKGlzTmFOKGRhdGUpKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIHBhcnNlIHRoZSB2YWx1ZSBwcm92aWRlZCB2aWEgLS1kYXRlIGZsYWcnKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihwciwgZGF0ZSk7XG4gICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkUHJQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=