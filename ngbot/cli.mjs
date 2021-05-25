import { verify } from './verify';
/** Build the parser for the NgBot commands. */
export function buildNgbotParser(localYargs) {
    return localYargs.help().strict().demandCommand().command('verify', 'Verify the NgBot config', {}, () => verify());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL25nYm90L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhDLCtDQUErQztBQUMvQyxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsVUFBc0I7SUFDckQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUNyRCxRQUFRLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDL0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt2ZXJpZnl9IGZyb20gJy4vdmVyaWZ5JztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBOZ0JvdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE5nYm90UGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpLnN0cmljdCgpLmRlbWFuZENvbW1hbmQoKS5jb21tYW5kKFxuICAgICAgJ3ZlcmlmeScsICdWZXJpZnkgdGhlIE5nQm90IGNvbmZpZycsIHt9LCAoKSA9PiB2ZXJpZnkoKSk7XG59XG4iXX0=