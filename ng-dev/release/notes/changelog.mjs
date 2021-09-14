"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Changelog = exports.splitMarker = exports.changelogArchivePath = exports.changelogPath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const semver = require("semver");
/** Project-relative path for the changelog file. */
exports.changelogPath = 'CHANGELOG.md';
/** Project-relative path for the changelog archive file. */
exports.changelogArchivePath = 'CHANGELOG_ARCHIVE.md';
/** A marker used to split a CHANGELOG.md file into individual entries. */
exports.splitMarker = '<!-- CHANGELOG SPLIT MARKER -->';
/**
 * A string to use between each changelog entry when joining them together.
 *
 * Since all every changelog entry's content is trimmed, when joining back together, two new lines
 * must be placed around the splitMarker to create a one line buffer around the comment in the
 * markdown.
 * i.e.
 * <changelog entry content>
 *
 * <!-- CHANGELOG SPLIT MARKER -->
 *
 * <changelog entry content>
 */
const joinMarker = `\n\n${exports.splitMarker}\n\n`;
/** A RegExp matcher to extract the version of a changelog entry from the entry content. */
const versionAnchorMatcher = new RegExp(`<a name="(.*)"></a>`);
class Changelog {
    constructor(git) {
        this.git = git;
        /** The absolute path to the changelog file. */
        this.filePath = (0, path_1.join)(this.git.baseDir, exports.changelogPath);
        /** The absolute path to the changelog archive file. */
        this.archiveFilePath = (0, path_1.join)(this.git.baseDir, exports.changelogArchivePath);
        /** The changelog entries in the CHANGELOG.md file. */
        this.entries = this.getEntriesFor(this.filePath);
        this._archiveEntries = undefined;
    }
    /**
     * The changelog entries in the CHANGELOG_ARCHIVE.md file.
     * Delays reading the CHANGELOG_ARCHIVE.md file until it is actually used.
     */
    get archiveEntries() {
        if (this._archiveEntries === undefined) {
            return (this._archiveEntries = this.getEntriesFor(this.archiveFilePath));
        }
        return this._archiveEntries;
    }
    /** Prepend a changelog entry to the changelog. */
    prependEntryToChangelog(entry) {
        this.entries.unshift(parseChangelogEntry(entry));
        this.writeToChangelogFile();
    }
    /**
     * Move all changelog entries from the CHANGELOG.md file for versions prior to the provided
     * version to the changelog archive.
     *
     * Versions should be used to determine which entries are moved to archive as versions are the
     * most accurate piece of context found within a changelog entry to determine its relationship to
     * other changelog entries.  This allows for example, moving all changelog entries out of the
     * main changelog when a version moves out of support.
     */
    moveEntriesPriorToVersionToArchive(version) {
        [...this.entries].reverse().forEach((entry) => {
            if (semver.lt(entry.version, version)) {
                this.archiveEntries.unshift(entry);
                this.entries.splice(this.entries.indexOf(entry), 1);
            }
        });
        this.writeToChangelogFile();
        if (this.archiveEntries.length) {
            this.writeToChangelogArchiveFile();
        }
    }
    /** Update the changelog archive file with the known changelog archive entries. */
    writeToChangelogArchiveFile() {
        const changelogArchive = this.archiveEntries.map((entry) => entry.content).join(joinMarker);
        (0, fs_1.writeFileSync)(this.archiveFilePath, changelogArchive);
    }
    /** Update the changelog file with the known changelog entries. */
    writeToChangelogFile() {
        const changelog = this.entries.map((entry) => entry.content).join(joinMarker);
        (0, fs_1.writeFileSync)(this.filePath, changelog);
    }
    /**
     * Retrieve the changelog entries for the provide changelog path, if the file does not exist an
     * empty array is returned.
     */
    getEntriesFor(path) {
        if (!(0, fs_1.existsSync)(path)) {
            return [];
        }
        return ((0, fs_1.readFileSync)(path, { encoding: 'utf8' })
            // Use the versionMarker as the separator for .split().
            .split(exports.splitMarker)
            // If the `split()` method finds the separator at the beginning or end of a string, it
            // includes an empty string at the respective locaiton, so we filter to remove all of these
            // potential empty strings.
            .filter((entry) => entry.trim().length !== 0)
            // Create a ChangelogEntry for each of the string entry.
            .map(parseChangelogEntry));
    }
}
exports.Changelog = Changelog;
/** Parse the provided string into a ChangelogEntry object. */
function parseChangelogEntry(content) {
    const versionMatcherResult = versionAnchorMatcher.exec(content);
    if (versionMatcherResult === null) {
        throw Error(`Unable to determine version for changelog entry: ${content}`);
    }
    const version = semver.parse(versionMatcherResult[1]);
    if (version === null) {
        throw Error(`Unable to determine version for changelog entry, with tag: ${versionMatcherResult[1]}`);
    }
    return {
        content: content.trim(),
        version,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2hhbmdlbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyRDtBQUMzRCwrQkFBMEI7QUFDMUIsaUNBQWlDO0FBR2pDLG9EQUFvRDtBQUN2QyxRQUFBLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFFNUMsNERBQTREO0FBQy9DLFFBQUEsb0JBQW9CLEdBQUcsc0JBQXNCLENBQUM7QUFFM0QsMEVBQTBFO0FBQzdELFFBQUEsV0FBVyxHQUFHLGlDQUFpQyxDQUFDO0FBRTdEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sVUFBVSxHQUFHLE9BQU8sbUJBQVcsTUFBTSxDQUFDO0FBRTVDLDJGQUEyRjtBQUMzRixNQUFNLG9CQUFvQixHQUFHLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFRL0QsTUFBYSxTQUFTO0lBbUJwQixZQUFvQixHQUFjO1FBQWQsUUFBRyxHQUFILEdBQUcsQ0FBVztRQWxCbEMsK0NBQStDO1FBQ3RDLGFBQVEsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxxQkFBYSxDQUFDLENBQUM7UUFDMUQsdURBQXVEO1FBQzlDLG9CQUFlLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsNEJBQW9CLENBQUMsQ0FBQztRQUN4RSxzREFBc0Q7UUFDOUMsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBVzVDLG9CQUFlLEdBQWlDLFNBQVMsQ0FBQztJQUU3QixDQUFDO0lBWnRDOzs7T0FHRztJQUNILElBQVksY0FBYztRQUN4QixJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMs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QU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDcEIsTUFBTSxLQUFLLENBQ1QsOERBQThELG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ3hGLENBQUM7S0FDSDtJQUVELE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRTtRQUN2QixPQUFPO0tBQ1IsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcblxuLyoqIFByb2plY3QtcmVsYXRpdmUgcGF0aCBmb3IgdGhlIGNoYW5nZWxvZyBmaWxlLiAqL1xuZXhwb3J0IGNvbnN0IGNoYW5nZWxvZ1BhdGggPSAnQ0hBTkdFTE9HLm1kJztcblxuLyoqIFByb2plY3QtcmVsYXRpdmUgcGF0aCBmb3IgdGhlIGNoYW5nZWxvZyBhcmNoaXZlIGZpbGUuICovXG5leHBvcnQgY29uc3QgY2hhbmdlbG9nQXJjaGl2ZVBhdGggPSAnQ0hBTkdFTE9HX0FSQ0hJVkUubWQnO1xuXG4vKiogQSBtYXJrZXIgdXNlZCB0byBzcGxpdCBhIENIQU5HRUxPRy5tZCBmaWxlIGludG8gaW5kaXZpZHVhbCBlbnRyaWVzLiAqL1xuZXhwb3J0IGNvbnN0IHNwbGl0TWFya2VyID0gJzwhLS0gQ0hBTkdFTE9HIFNQTElUIE1BUktFUiAtLT4nO1xuXG4vKipcbiAqIEEgc3RyaW5nIHRvIHVzZSBiZXR3ZWVuIGVhY2ggY2hhbmdlbG9nIGVudHJ5IHdoZW4gam9pbmluZyB0aGVtIHRvZ2V0aGVyLlxuICpcbiAqIFNpbmNlIGFsbCBldmVyeSBjaGFuZ2Vsb2cgZW50cnkncyBjb250ZW50IGlzIHRyaW1tZWQsIHdoZW4gam9pbmluZyBiYWNrIHRvZ2V0aGVyLCB0d28gbmV3IGxpbmVzXG4gKiBtdXN0IGJlIHBsYWNlZCBhcm91bmQgdGhlIHNwbGl0TWFya2VyIHRvIGNyZWF0ZSBhIG9uZSBsaW5lIGJ1ZmZlciBhcm91bmQgdGhlIGNvbW1lbnQgaW4gdGhlXG4gKiBtYXJrZG93bi5cbiAqIGkuZS5cbiAqIDxjaGFuZ2Vsb2cgZW50cnkgY29udGVudD5cbiAqXG4gKiA8IS0tIENIQU5HRUxPRyBTUExJVCBNQVJLRVIgLS0+XG4gKlxuICogPGNoYW5nZWxvZyBlbnRyeSBjb250ZW50PlxuICovXG5jb25zdCBqb2luTWFya2VyID0gYFxcblxcbiR7c3BsaXRNYXJrZXJ9XFxuXFxuYDtcblxuLyoqIEEgUmVnRXhwIG1hdGNoZXIgdG8gZXh0cmFjdCB0aGUgdmVyc2lvbiBvZiBhIGNoYW5nZWxvZyBlbnRyeSBmcm9tIHRoZSBlbnRyeSBjb250ZW50LiAqL1xuY29uc3QgdmVyc2lvbkFuY2hvck1hdGNoZXIgPSBuZXcgUmVnRXhwKGA8YSBuYW1lPVwiKC4qKVwiPjwvYT5gKTtcblxuLyoqIEFuIGluZGl2aWR1YWwgY2hhbmdlbG9nIGVudHJ5LiAqL1xuaW50ZXJmYWNlIENoYW5nZWxvZ0VudHJ5IHtcbiAgY29udGVudDogc3RyaW5nO1xuICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIHtcbiAgLyoqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBjaGFuZ2Vsb2cgZmlsZS4gKi9cbiAgcmVhZG9ubHkgZmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsIGNoYW5nZWxvZ1BhdGgpO1xuICAvKiogVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGNoYW5nZWxvZyBhcmNoaXZlIGZpbGUuICovXG4gIHJlYWRvbmx5IGFyY2hpdmVGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgY2hhbmdlbG9nQXJjaGl2ZVBhdGgpO1xuICAvKiogVGhlIGNoYW5nZWxvZyBlbnRyaWVzIGluIHRoZSBDSEFOR0VMT0cubWQgZmlsZS4gKi9cbiAgcHJpdmF0ZSBlbnRyaWVzID0gdGhpcy5nZXRFbnRyaWVzRm9yKHRoaXMuZmlsZVBhdGgpO1xuICAvKipcbiAgICogVGhlIGNoYW5nZWxvZyBlbnRyaWVzIGluIHRoZSBDSEFOR0VMT0dfQVJDSElWRS5tZCBmaWxlLlxuICAgKiBEZWxheXMgcmVhZGluZyB0aGUgQ0hBTkdFTE9HX0FSQ0hJVkUubWQgZmlsZSB1bnRpbCBpdCBpcyBhY3R1YWxseSB1c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXQgYXJjaGl2ZUVudHJpZXMoKSB7XG4gICAgaWYgKHRoaXMuX2FyY2hpdmVFbnRyaWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAodGhpcy5fYXJjaGl2ZUVudHJpZXMgPSB0aGlzLmdldEVudHJpZXNGb3IodGhpcy5hcmNoaXZlRmlsZVBhdGgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FyY2hpdmVFbnRyaWVzO1xuICB9XG4gIHByaXZhdGUgX2FyY2hpdmVFbnRyaWVzOiB1bmRlZmluZWQgfCBDaGFuZ2Vsb2dFbnRyeVtdID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2l0OiBHaXRDbGllbnQpIHt9XG5cbiAgLyoqIFByZXBlbmQgYSBjaGFuZ2Vsb2cgZW50cnkgdG8gdGhlIGNoYW5nZWxvZy4gKi9cbiAgcHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2coZW50cnk6IHN0cmluZykge1xuICAgIHRoaXMuZW50cmllcy51bnNoaWZ0KHBhcnNlQ2hhbmdlbG9nRW50cnkoZW50cnkpKTtcbiAgICB0aGlzLndyaXRlVG9DaGFuZ2Vsb2dGaWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogTW92ZSBhbGwgY2hhbmdlbG9nIGVudHJpZXMgZnJvbSB0aGUgQ0hBTkdFTE9HLm1kIGZpbGUgZm9yIHZlcnNpb25zIHByaW9yIHRvIHRoZSBwcm92aWRlZFxuICAgKiB2ZXJzaW9uIHRvIHRoZSBjaGFuZ2Vsb2cgYXJjaGl2ZS5cbiAgICpcbiAgICogVmVyc2lvbnMgc2hvdWxkIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGVudHJpZXMgYXJlIG1vdmVkIHRvIGFyY2hpdmUgYXMgdmVyc2lvbnMgYXJlIHRoZVxuICAgKiBtb3N0IGFjY3VyYXRlIHBpZWNlIG9mIGNvbnRleHQgZm91bmQgd2l0aGluIGEgY2hhbmdlbG9nIGVudHJ5IHRvIGRldGVybWluZSBpdHMgcmVsYXRpb25zaGlwIHRvXG4gICAqIG90aGVyIGNoYW5nZWxvZyBlbnRyaWVzLiAgVGhpcyBhbGxvd3MgZm9yIGV4YW1wbGUsIG1vdmluZyBhbGwgY2hhbmdlbG9nIGVudHJpZXMgb3V0IG9mIHRoZVxuICAgKiBtYWluIGNoYW5nZWxvZyB3aGVuIGEgdmVyc2lvbiBtb3ZlcyBvdXQgb2Ygc3VwcG9ydC5cbiAgICovXG4gIG1vdmVFbnRyaWVzUHJpb3JUb1ZlcnNpb25Ub0FyY2hpdmUodmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIFsuLi50aGlzLmVudHJpZXNdLnJldmVyc2UoKS5mb3JFYWNoKChlbnRyeTogQ2hhbmdlbG9nRW50cnkpID0+IHtcbiAgICAgIGlmIChzZW12ZXIubHQoZW50cnkudmVyc2lvbiwgdmVyc2lvbikpIHtcbiAgICAgICAgdGhpcy5hcmNoaXZlRW50cmllcy51bnNoaWZ0KGVudHJ5KTtcbiAgICAgICAgdGhpcy5lbnRyaWVzLnNwbGljZSh0aGlzLmVudHJpZXMuaW5kZXhPZihlbnRyeSksIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy53cml0ZVRvQ2hhbmdlbG9nRmlsZSgpO1xuICAgIGlmICh0aGlzLmFyY2hpdmVFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgdGhpcy53cml0ZVRvQ2hhbmdlbG9nQXJjaGl2ZUZpbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBjaGFuZ2Vsb2cgYXJjaGl2ZSBmaWxlIHdpdGggdGhlIGtub3duIGNoYW5nZWxvZyBhcmNoaXZlIGVudHJpZXMuICovXG4gIHByaXZhdGUgd3JpdGVUb0NoYW5nZWxvZ0FyY2hpdmVGaWxlKCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWxvZ0FyY2hpdmUgPSB0aGlzLmFyY2hpdmVFbnRyaWVzLm1hcCgoZW50cnkpID0+IGVudHJ5LmNvbnRlbnQpLmpvaW4oam9pbk1hcmtlcik7XG4gICAgd3JpdGVGaWxlU3luYyh0aGlzLmFyY2hpdmVGaWxlUGF0aCwgY2hhbmdlbG9nQXJjaGl2ZSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBjaGFuZ2Vsb2cgZmlsZSB3aXRoIHRoZSBrbm93biBjaGFuZ2Vsb2cgZW50cmllcy4gKi9cbiAgcHJpdmF0ZSB3cml0ZVRvQ2hhbmdlbG9nRmlsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBjaGFuZ2Vsb2cgPSB0aGlzLmVudHJpZXMubWFwKChlbnRyeSkgPT4gZW50cnkuY29udGVudCkuam9pbihqb2luTWFya2VyKTtcbiAgICB3cml0ZUZpbGVTeW5jKHRoaXMuZmlsZVBhdGgsIGNoYW5nZWxvZyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGNoYW5nZWxvZyBlbnRyaWVzIGZvciB0aGUgcHJvdmlkZSBjaGFuZ2Vsb2cgcGF0aCwgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3QgYW5cbiAgICogZW1wdHkgYXJyYXkgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBwcml2YXRlIGdldEVudHJpZXNGb3IocGF0aDogc3RyaW5nKTogQ2hhbmdlbG9nRW50cnlbXSB7XG4gICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIHJlYWRGaWxlU3luYyhwYXRoLCB7ZW5jb2Rpbmc6ICd1dGY4J30pXG4gICAgICAgIC8vIFVzZSB0aGUgdmVyc2lvbk1hcmtlciBhcyB0aGUgc2VwYXJhdG9yIGZvciAuc3BsaXQoKS5cbiAgICAgICAgLnNwbGl0KHNwbGl0TWFya2VyKVxuICAgICAgICAvLyBJZiB0aGUgYHNwbGl0KClgIG1ldGhvZCBmaW5kcyB0aGUgc2VwYXJhdG9yIGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kIG9mIGEgc3RyaW5nLCBpdFxuICAgICAgICAvLyBpbmNsdWRlcyBhbiBlbXB0eSBzdHJpbmcgYXQgdGhlIHJlc3BlY3RpdmUgbG9jYWl0b24sIHNvIHdlIGZpbHRlciB0byByZW1vdmUgYWxsIG9mIHRoZXNlXG4gICAgICAgIC8vIHBvdGVudGlhbCBlbXB0eSBzdHJpbmdzLlxuICAgICAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkudHJpbSgpLmxlbmd0aCAhPT0gMClcbiAgICAgICAgLy8gQ3JlYXRlIGEgQ2hhbmdlbG9nRW50cnkgZm9yIGVhY2ggb2YgdGhlIHN0cmluZyBlbnRyeS5cbiAgICAgICAgLm1hcChwYXJzZUNoYW5nZWxvZ0VudHJ5KVxuICAgICk7XG4gIH1cbn1cblxuLyoqIFBhcnNlIHRoZSBwcm92aWRlZCBzdHJpbmcgaW50byBhIENoYW5nZWxvZ0VudHJ5IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHBhcnNlQ2hhbmdlbG9nRW50cnkoY29udGVudDogc3RyaW5nKTogQ2hhbmdlbG9nRW50cnkge1xuICBjb25zdCB2ZXJzaW9uTWF0Y2hlclJlc3VsdCA9IHZlcnNpb25BbmNob3JNYXRjaGVyLmV4ZWMoY29udGVudCk7XG4gIGlmICh2ZXJzaW9uTWF0Y2hlclJlc3VsdCA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIHZlcnNpb24gZm9yIGNoYW5nZWxvZyBlbnRyeTogJHtjb250ZW50fWApO1xuICB9XG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UodmVyc2lvbk1hdGNoZXJSZXN1bHRbMV0pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBgVW5hYmxlIHRvIGRldGVybWluZSB2ZXJzaW9uIGZvciBjaGFuZ2Vsb2cgZW50cnksIHdpdGggdGFnOiAke3ZlcnNpb25NYXRjaGVyUmVzdWx0WzFdfWAsXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogY29udGVudC50cmltKCksXG4gICAgdmVyc2lvbixcbiAgfTtcbn1cbiJdfQ==