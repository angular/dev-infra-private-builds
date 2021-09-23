"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCiParser = void 0;
const cli_1 = require("./gather-test-results/cli");
/** Build the parser for the ci commands. */
function buildCiParser(yargs) {
    return yargs.help().strict().command(cli_1.GatherTestResultsModule);
}
exports.buildCiParser = buildCiParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NpL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQSxtREFBa0U7QUFFbEUsNENBQTRDO0FBQzVDLFNBQWdCLGFBQWEsQ0FBQyxLQUFXO0lBQ3ZDLE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyw2QkFBdUIsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCxzQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBcmd2fSBmcm9tICd5YXJncyc7XG5pbXBvcnQge0dhdGhlclRlc3RSZXN1bHRzTW9kdWxlfSBmcm9tICcuL2dhdGhlci10ZXN0LXJlc3VsdHMvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjaSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENpUGFyc2VyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5oZWxwKCkuc3RyaWN0KCkuY29tbWFuZChHYXRoZXJUZXN0UmVzdWx0c01vZHVsZSk7XG59XG4iXX0=