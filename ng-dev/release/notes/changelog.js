"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Changelog = exports.splitMarker = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const semver = require("semver");
const git_client_1 = require("../../utils/git/git-client");
/** Project-relative path for the changelog file. */
const changelogPath = 'CHANGELOG.md';
/** Project-relative path for the changelog archive file. */
const changelogArchivePath = 'CHANGELOG_ARCHIVE.md';
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
        this.filePath = (0, path_1.join)(this.git.baseDir, changelogPath);
        /** The absolute path to the changelog archive file. */
        this.archiveFilePath = (0, path_1.join)(this.git.baseDir, changelogArchivePath);
        this._entries = undefined;
        this._archiveEntries = undefined;
    }
    /** Prepend a changelog entry to the current changelog file. */
    static prependEntryToChangelogFile(entry, git = git_client_1.GitClient.get()) {
        const changelog = new this(git);
        changelog.prependEntryToChangelogFile(entry);
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
    static moveEntriesPriorToVersionToArchive(version, git = git_client_1.GitClient.get()) {
        const changelog = new this(git);
        changelog.moveEntriesPriorToVersionToArchive(version);
    }
    // TODO(josephperrott): Remove this after it is unused.
    /** Retrieve the file paths for the changelog files. */
    static getChangelogFilePaths(git = git_client_1.GitClient.get()) {
        return new this(git);
    }
    /**
     * The changelog entries in the CHANGELOG.md file.
     * Delays reading the CHANGELOG.md file until it is actually used.
     */
    get entries() {
        if (this._entries === undefined) {
            return (this._entries = this.getEntriesFor(this.filePath));
        }
        return this._entries;
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
    prependEntryToChangelogFile(entry) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2hhbmdlbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyRDtBQUMzRCwrQkFBMEI7QUFDMUIsaUNBQWlDO0FBQ2pDLDJEQUFxRDtBQUVyRCxvREFBb0Q7QUFDcEQsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBRXJDLDREQUE0RDtBQUM1RCxNQUFNLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0FBRXBELDBFQUEwRTtBQUM3RCxRQUFBLFdBQVcsR0FBRyxpQ0FBaUMsQ0FBQztBQUU3RDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLFVBQVUsR0FBRyxPQUFPLG1CQUFXLE1BQU0sQ0FBQztBQUU1QywyRkFBMkY7QUFDM0YsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBUS9ELE1BQWEsU0FBUztJQXNEcEIsWUFBNEIsR0FBYztRQUFkLFFBQUcsR0FBSCxHQUFHLENBQVc7UUEzQjFDLCtDQUErQztRQUN0QyxhQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUQsdURBQXVEO1FBQzlDLG9CQUFlLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQVdoRSxhQUFRLEdBQWlDLFNBQVMsQ0FBQztRQVduRCxvQkFBZSxHQUFpQyxTQUFTLENBQUM7SUFFckIsQ0FBQztJQXJEOUMsK0RBQStEO0lBQy9ELE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxLQUFhLEVBQUUsR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxD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QU87S0FDUixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogUHJvamVjdC1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG5jb25zdCBjaGFuZ2Vsb2dQYXRoID0gJ0NIQU5HRUxPRy5tZCc7XG5cbi8qKiBQcm9qZWN0LXJlbGF0aXZlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgYXJjaGl2ZSBmaWxlLiAqL1xuY29uc3QgY2hhbmdlbG9nQXJjaGl2ZVBhdGggPSAnQ0hBTkdFTE9HX0FSQ0hJVkUubWQnO1xuXG4vKiogQSBtYXJrZXIgdXNlZCB0byBzcGxpdCBhIENIQU5HRUxPRy5tZCBmaWxlIGludG8gaW5kaXZpZHVhbCBlbnRyaWVzLiAqL1xuZXhwb3J0IGNvbnN0IHNwbGl0TWFya2VyID0gJzwhLS0gQ0hBTkdFTE9HIFNQTElUIE1BUktFUiAtLT4nO1xuXG4vKipcbiAqIEEgc3RyaW5nIHRvIHVzZSBiZXR3ZWVuIGVhY2ggY2hhbmdlbG9nIGVudHJ5IHdoZW4gam9pbmluZyB0aGVtIHRvZ2V0aGVyLlxuICpcbiAqIFNpbmNlIGFsbCBldmVyeSBjaGFuZ2Vsb2cgZW50cnkncyBjb250ZW50IGlzIHRyaW1tZWQsIHdoZW4gam9pbmluZyBiYWNrIHRvZ2V0aGVyLCB0d28gbmV3IGxpbmVzXG4gKiBtdXN0IGJlIHBsYWNlZCBhcm91bmQgdGhlIHNwbGl0TWFya2VyIHRvIGNyZWF0ZSBhIG9uZSBsaW5lIGJ1ZmZlciBhcm91bmQgdGhlIGNvbW1lbnQgaW4gdGhlXG4gKiBtYXJrZG93bi5cbiAqIGkuZS5cbiAqIDxjaGFuZ2Vsb2cgZW50cnkgY29udGVudD5cbiAqXG4gKiA8IS0tIENIQU5HRUxPRyBTUExJVCBNQVJLRVIgLS0+XG4gKlxuICogPGNoYW5nZWxvZyBlbnRyeSBjb250ZW50PlxuICovXG5jb25zdCBqb2luTWFya2VyID0gYFxcblxcbiR7c3BsaXRNYXJrZXJ9XFxuXFxuYDtcblxuLyoqIEEgUmVnRXhwIG1hdGNoZXIgdG8gZXh0cmFjdCB0aGUgdmVyc2lvbiBvZiBhIGNoYW5nZWxvZyBlbnRyeSBmcm9tIHRoZSBlbnRyeSBjb250ZW50LiAqL1xuY29uc3QgdmVyc2lvbkFuY2hvck1hdGNoZXIgPSBuZXcgUmVnRXhwKGA8YSBuYW1lPVwiKC4qKVwiPjwvYT5gKTtcblxuLyoqIEFuIGluZGl2aWR1YWwgY2hhbmdlbG9nIGVudHJ5LiAqL1xuaW50ZXJmYWNlIENoYW5nZWxvZ0VudHJ5IHtcbiAgY29udGVudDogc3RyaW5nO1xuICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hhbmdlbG9nIHtcbiAgLyoqIFByZXBlbmQgYSBjaGFuZ2Vsb2cgZW50cnkgdG8gdGhlIGN1cnJlbnQgY2hhbmdlbG9nIGZpbGUuICovXG4gIHN0YXRpYyBwcmVwZW5kRW50cnlUb0NoYW5nZWxvZ0ZpbGUoZW50cnk6IHN0cmluZywgZ2l0ID0gR2l0Q2xpZW50LmdldCgpKSB7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IHRoaXMoZ2l0KTtcbiAgICBjaGFuZ2Vsb2cucHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFsbCBjaGFuZ2Vsb2cgZW50cmllcyBmcm9tIHRoZSBDSEFOR0VMT0cubWQgZmlsZSBmb3IgdmVyc2lvbnMgcHJpb3IgdG8gdGhlIHByb3ZpZGVkXG4gICAqIHZlcnNpb24gdG8gdGhlIGNoYW5nZWxvZyBhcmNoaXZlLlxuICAgKlxuICAgKiBWZXJzaW9ucyBzaG91bGQgYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggZW50cmllcyBhcmUgbW92ZWQgdG8gYXJjaGl2ZSBhcyB2ZXJzaW9ucyBhcmUgdGhlXG4gICAqIG1vc3QgYWNjdXJhdGUgcGllY2Ugb2YgY29udGV4dCBmb3VuZCB3aXRoaW4gYSBjaGFuZ2Vsb2cgZW50cnkgdG8gZGV0ZXJtaW5lIGl0cyByZWxhdGlvbnNoaXAgdG9cbiAgICogb3RoZXIgY2hhbmdlbG9nIGVudHJpZXMuICBUaGlzIGFsbG93cyBmb3IgZXhhbXBsZSwgbW92aW5nIGFsbCBjaGFuZ2Vsb2cgZW50cmllcyBvdXQgb2YgdGhlXG4gICAqIG1haW4gY2hhbmdlbG9nIHdoZW4gYSB2ZXJzaW9uIG1vdmVzIG91dCBvZiBzdXBwb3J0LlxuICAgKi9cbiAgc3RhdGljIG1vdmVFbnRyaWVzUHJpb3JUb1ZlcnNpb25Ub0FyY2hpdmUodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgZ2l0ID0gR2l0Q2xpZW50LmdldCgpKSB7XG4gICAgY29uc3QgY2hhbmdlbG9nID0gbmV3IHRoaXMoZ2l0KTtcbiAgICBjaGFuZ2Vsb2cubW92ZUVudHJpZXNQcmlvclRvVmVyc2lvblRvQXJjaGl2ZSh2ZXJzaW9uKTtcbiAgfVxuXG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IFJlbW92ZSB0aGlzIGFmdGVyIGl0IGlzIHVudXNlZC5cbiAgLyoqIFJldHJpZXZlIHRoZSBmaWxlIHBhdGhzIGZvciB0aGUgY2hhbmdlbG9nIGZpbGVzLiAqL1xuICBzdGF0aWMgZ2V0Q2hhbmdlbG9nRmlsZVBhdGhzKGdpdCA9IEdpdENsaWVudC5nZXQoKSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhnaXQpO1xuICB9XG5cbiAgLyoqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBjaGFuZ2Vsb2cgZmlsZS4gKi9cbiAgcmVhZG9ubHkgZmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsIGNoYW5nZWxvZ1BhdGgpO1xuICAvKiogVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGNoYW5nZWxvZyBhcmNoaXZlIGZpbGUuICovXG4gIHJlYWRvbmx5IGFyY2hpdmVGaWxlUGF0aCA9IGpvaW4odGhpcy5naXQuYmFzZURpciwgY2hhbmdlbG9nQXJjaGl2ZVBhdGgpO1xuICAvKipcbiAgICogVGhlIGNoYW5nZWxvZyBlbnRyaWVzIGluIHRoZSBDSEFOR0VMT0cubWQgZmlsZS5cbiAgICogRGVsYXlzIHJlYWRpbmcgdGhlIENIQU5HRUxPRy5tZCBmaWxlIHVudGlsIGl0IGlzIGFjdHVhbGx5IHVzZWQuXG4gICAqL1xuICBwcml2YXRlIGdldCBlbnRyaWVzKCkge1xuICAgIGlmICh0aGlzLl9lbnRyaWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAodGhpcy5fZW50cmllcyA9IHRoaXMuZ2V0RW50cmllc0Zvcih0aGlzLmZpbGVQYXRoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbnRyaWVzO1xuICB9XG4gIHByaXZhdGUgX2VudHJpZXM6IHVuZGVmaW5lZCB8IENoYW5nZWxvZ0VudHJ5W10gPSB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlbG9nIGVudHJpZXMgaW4gdGhlIENIQU5HRUxPR19BUkNISVZFLm1kIGZpbGUuXG4gICAqIERlbGF5cyByZWFkaW5nIHRoZSBDSEFOR0VMT0dfQVJDSElWRS5tZCBmaWxlIHVudGlsIGl0IGlzIGFjdHVhbGx5IHVzZWQuXG4gICAqL1xuICBwcml2YXRlIGdldCBhcmNoaXZlRW50cmllcygpIHtcbiAgICBpZiAodGhpcy5fYXJjaGl2ZUVudHJpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICh0aGlzLl9hcmNoaXZlRW50cmllcyA9IHRoaXMuZ2V0RW50cmllc0Zvcih0aGlzLmFyY2hpdmVGaWxlUGF0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXJjaGl2ZUVudHJpZXM7XG4gIH1cbiAgcHJpdmF0ZSBfYXJjaGl2ZUVudHJpZXM6IHVuZGVmaW5lZCB8IENoYW5nZWxvZ0VudHJ5W10gPSB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwcml2YXRlIGdpdDogR2l0Q2xpZW50KSB7fVxuXG4gIC8qKiBQcmVwZW5kIGEgY2hhbmdlbG9nIGVudHJ5IHRvIHRoZSBjaGFuZ2Vsb2cuICovXG4gIHByaXZhdGUgcHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKGVudHJ5OiBzdHJpbmcpIHtcbiAgICB0aGlzLmVudHJpZXMudW5zaGlmdChwYXJzZUNoYW5nZWxvZ0VudHJ5KGVudHJ5KSk7XG4gICAgdGhpcy53cml0ZVRvQ2hhbmdlbG9nRmlsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYWxsIGNoYW5nZWxvZyBlbnRyaWVzIGZyb20gdGhlIENIQU5HRUxPRy5tZCBmaWxlIGZvciB2ZXJzaW9ucyBwcmlvciB0byB0aGUgcHJvdmlkZWRcbiAgICogdmVyc2lvbiB0byB0aGUgY2hhbmdlbG9nIGFyY2hpdmUuXG4gICAqXG4gICAqIFZlcnNpb25zIHNob3VsZCBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCBlbnRyaWVzIGFyZSBtb3ZlZCB0byBhcmNoaXZlIGFzIHZlcnNpb25zIGFyZSB0aGVcbiAgICogbW9zdCBhY2N1cmF0ZSBwaWVjZSBvZiBjb250ZXh0IGZvdW5kIHdpdGhpbiBhIGNoYW5nZWxvZyBlbnRyeSB0byBkZXRlcm1pbmUgaXRzIHJlbGF0aW9uc2hpcCB0b1xuICAgKiBvdGhlciBjaGFuZ2Vsb2cgZW50cmllcy4gIFRoaXMgYWxsb3dzIGZvciBleGFtcGxlLCBtb3ZpbmcgYWxsIGNoYW5nZWxvZyBlbnRyaWVzIG91dCBvZiB0aGVcbiAgICogbWFpbiBjaGFuZ2Vsb2cgd2hlbiBhIHZlcnNpb24gbW92ZXMgb3V0IG9mIHN1cHBvcnQuXG4gICAqL1xuICBwcml2YXRlIG1vdmVFbnRyaWVzUHJpb3JUb1ZlcnNpb25Ub0FyY2hpdmUodmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIFsuLi50aGlzLmVudHJpZXNdLnJldmVyc2UoKS5mb3JFYWNoKChlbnRyeTogQ2hhbmdlbG9nRW50cnkpID0+IHtcbiAgICAgIGlmIChzZW12ZXIubHQoZW50cnkudmVyc2lvbiwgdmVyc2lvbikpIHtcbiAgICAgICAgdGhpcy5hcmNoaXZlRW50cmllcy51bnNoaWZ0KGVudHJ5KTtcbiAgICAgICAgdGhpcy5lbnRyaWVzLnNwbGljZSh0aGlzLmVudHJpZXMuaW5kZXhPZihlbnRyeSksIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy53cml0ZVRvQ2hhbmdlbG9nRmlsZSgpO1xuICAgIGlmICh0aGlzLmFyY2hpdmVFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgdGhpcy53cml0ZVRvQ2hhbmdlbG9nQXJjaGl2ZUZpbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBjaGFuZ2Vsb2cgYXJjaGl2ZSBmaWxlIHdpdGggdGhlIGtub3duIGNoYW5nZWxvZyBhcmNoaXZlIGVudHJpZXMuICovXG4gIHByaXZhdGUgd3JpdGVUb0NoYW5nZWxvZ0FyY2hpdmVGaWxlKCk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWxvZ0FyY2hpdmUgPSB0aGlzLmFyY2hpdmVFbnRyaWVzLm1hcCgoZW50cnkpID0+IGVudHJ5LmNvbnRlbnQpLmpvaW4oam9pbk1hcmtlcik7XG4gICAgd3JpdGVGaWxlU3luYyh0aGlzLmFyY2hpdmVGaWxlUGF0aCwgY2hhbmdlbG9nQXJjaGl2ZSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBjaGFuZ2Vsb2cgZmlsZSB3aXRoIHRoZSBrbm93biBjaGFuZ2Vsb2cgZW50cmllcy4gKi9cbiAgcHJpdmF0ZSB3cml0ZVRvQ2hhbmdlbG9nRmlsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBjaGFuZ2Vsb2cgPSB0aGlzLmVudHJpZXMubWFwKChlbnRyeSkgPT4gZW50cnkuY29udGVudCkuam9pbihqb2luTWFya2VyKTtcbiAgICB3cml0ZUZpbGVTeW5jKHRoaXMuZmlsZVBhdGgsIGNoYW5nZWxvZyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGNoYW5nZWxvZyBlbnRyaWVzIGZvciB0aGUgcHJvdmlkZSBjaGFuZ2Vsb2cgcGF0aCwgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3QgYW5cbiAgICogZW1wdHkgYXJyYXkgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBwcml2YXRlIGdldEVudHJpZXNGb3IocGF0aDogc3RyaW5nKTogQ2hhbmdlbG9nRW50cnlbXSB7XG4gICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIHJlYWRGaWxlU3luYyhwYXRoLCB7ZW5jb2Rpbmc6ICd1dGY4J30pXG4gICAgICAgIC8vIFVzZSB0aGUgdmVyc2lvbk1hcmtlciBhcyB0aGUgc2VwYXJhdG9yIGZvciAuc3BsaXQoKS5cbiAgICAgICAgLnNwbGl0KHNwbGl0TWFya2VyKVxuICAgICAgICAvLyBJZiB0aGUgYHNwbGl0KClgIG1ldGhvZCBmaW5kcyB0aGUgc2VwYXJhdG9yIGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kIG9mIGEgc3RyaW5nLCBpdFxuICAgICAgICAvLyBpbmNsdWRlcyBhbiBlbXB0eSBzdHJpbmcgYXQgdGhlIHJlc3BlY3RpdmUgbG9jYWl0b24sIHNvIHdlIGZpbHRlciB0byByZW1vdmUgYWxsIG9mIHRoZXNlXG4gICAgICAgIC8vIHBvdGVudGlhbCBlbXB0eSBzdHJpbmdzLlxuICAgICAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkudHJpbSgpLmxlbmd0aCAhPT0gMClcbiAgICAgICAgLy8gQ3JlYXRlIGEgQ2hhbmdlbG9nRW50cnkgZm9yIGVhY2ggb2YgdGhlIHN0cmluZyBlbnRyeS5cbiAgICAgICAgLm1hcChwYXJzZUNoYW5nZWxvZ0VudHJ5KVxuICAgICk7XG4gIH1cbn1cblxuLyoqIFBhcnNlIHRoZSBwcm92aWRlZCBzdHJpbmcgaW50byBhIENoYW5nZWxvZ0VudHJ5IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHBhcnNlQ2hhbmdlbG9nRW50cnkoY29udGVudDogc3RyaW5nKTogQ2hhbmdlbG9nRW50cnkge1xuICBjb25zdCB2ZXJzaW9uTWF0Y2hlclJlc3VsdCA9IHZlcnNpb25BbmNob3JNYXRjaGVyLmV4ZWMoY29udGVudCk7XG4gIGlmICh2ZXJzaW9uTWF0Y2hlclJlc3VsdCA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIHZlcnNpb24gZm9yIGNoYW5nZWxvZyBlbnRyeTogJHtjb250ZW50fWApO1xuICB9XG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UodmVyc2lvbk1hdGNoZXJSZXN1bHRbMV0pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBgVW5hYmxlIHRvIGRldGVybWluZSB2ZXJzaW9uIGZvciBjaGFuZ2Vsb2cgZW50cnksIHdpdGggdGFnOiAke3ZlcnNpb25NYXRjaGVyUmVzdWx0WzFdfWAsXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogY29udGVudC50cmltKCksXG4gICAgdmVyc2lvbixcbiAgfTtcbn1cbiJdfQ==