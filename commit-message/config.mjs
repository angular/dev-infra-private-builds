/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertNoErrors, getConfig } from '../utils/config';
/** Retrieve and validate the config as `CommitMessageConfig`. */
export function getCommitMessageConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The non-validated config object.
    const config = getConfig();
    if (config.commitMessage === undefined) {
        errors.push(`No configuration defined for "commitMessage"`);
    }
    assertNoErrors(errors);
    return config;
}
/** Scope requirement level to be set for each commit type. */
export var ScopeRequirement;
(function (ScopeRequirement) {
    ScopeRequirement[ScopeRequirement["Required"] = 0] = "Required";
    ScopeRequirement[ScopeRequirement["Optional"] = 1] = "Optional";
    ScopeRequirement[ScopeRequirement["Forbidden"] = 2] = "Forbidden";
})(ScopeRequirement || (ScopeRequirement = {}));
export var ReleaseNotesLevel;
(function (ReleaseNotesLevel) {
    ReleaseNotesLevel[ReleaseNotesLevel["Hidden"] = 0] = "Hidden";
    ReleaseNotesLevel[ReleaseNotesLevel["Visible"] = 1] = "Visible";
})(ReleaseNotesLevel || (ReleaseNotesLevel = {}));
/** The valid commit types for Angular commit messages. */
export const COMMIT_TYPES = {
    build: {
        name: 'build',
        description: 'Changes to local repository build system and tooling',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    ci: {
        name: 'ci',
        description: 'Changes to CI configuration and CI specific tooling',
        scope: ScopeRequirement.Forbidden,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    docs: {
        name: 'docs',
        description: 'Changes which exclusively affects documentation.',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    feat: {
        name: 'feat',
        description: 'Creates a new feature',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    fix: {
        name: 'fix',
        description: 'Fixes a previously discovered failure/bug',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    perf: {
        name: 'perf',
        description: 'Improves performance without any change in functionality or API',
        scope: ScopeRequirement.Required,
        releaseNotesLevel: ReleaseNotesLevel.Visible,
    },
    refactor: {
        name: 'refactor',
        description: 'Refactor without any change in functionality or API (includes style changes)',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    release: {
        name: 'release',
        description: 'A release point in the repository',
        scope: ScopeRequirement.Forbidden,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
    test: {
        name: 'test',
        description: 'Improvements or corrections made to the project\'s test suite',
        scope: ScopeRequirement.Optional,
        releaseNotesLevel: ReleaseNotesLevel.Hidden,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFFLFNBQVMsRUFBYyxNQUFNLGlCQUFpQixDQUFDO0FBVXZFLGlFQUFpRTtBQUNqRSxNQUFNLFVBQVUsc0JBQXNCO0lBQ3BDLG9EQUFvRDtJQUNwRCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIsbUNBQW1DO0lBQ25DLE1BQU0sTUFBTSxHQUErRCxTQUFTLEVBQUUsQ0FBQztJQUV2RixJQUFJLE1BQU0sQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQztLQUM3RDtJQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQWlDLENBQUM7QUFDM0MsQ0FBQztBQUVELDhEQUE4RDtBQUM5RCxNQUFNLENBQU4sSUFBWSxnQkFJWDtBQUpELFdBQVksZ0JBQWdCO0lBQzFCLCtEQUFRLENBQUE7SUFDUiwrREFBUSxDQUFBO0lBQ1IsaUVBQVMsQ0FBQTtBQUNYLENBQUMsRUFKVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBSTNCO0FBRUQsTUFBTSxDQUFOLElBQVksaUJBR1g7QUFIRCxXQUFZLGlCQUFpQjtJQUMzQiw2REFBTSxDQUFBO0lBQ04sK0RBQU8sQ0FBQTtBQUNULENBQUMsRUFIVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBRzVCO0FBVUQsMERBQTBEO0FBQzFELE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBZ0M7SUFDdkQsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLE9BQU87UUFDYixXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7SUFDRCxFQUFFLEVBQUU7UUFDRixJQUFJLEVBQUUsSUFBSTtRQUNWLFdBQVcsRUFBRSxxREFBcUQ7UUFDbEUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFNBQVM7UUFDakMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLGtEQUFrRDtRQUMvRCxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsSUFBSSxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXLEVBQUUsdUJBQXVCO1FBQ3BDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1FBQ2hDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE9BQU87S0FDN0M7SUFDRCxHQUFHLEVBQUU7UUFDSCxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSwyQ0FBMkM7UUFDeEQsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsT0FBTztLQUM3QztJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVyxFQUFFLGlFQUFpRTtRQUM5RSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO0tBQzdDO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFVBQVU7UUFDaEIsV0FBVyxFQUFFLDhFQUE4RTtRQUMzRixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO0tBQzVDO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsbUNBQW1DO1FBQ2hELEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO1FBQ2pDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLE1BQU07S0FDNUM7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLFdBQVcsRUFBRSwrREFBK0Q7UUFDNUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDaEMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtLQUM1QztDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIGNvbW1pdC1tZXNzYWdlIGNvbWFuZHMuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdE1lc3NhZ2VDb25maWcge1xuICBtYXhMaW5lTGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGg6IG51bWJlcjtcbiAgbWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz86IHN0cmluZ1tdO1xuICBzY29wZXM6IHN0cmluZ1tdO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYENvbW1pdE1lc3NhZ2VDb25maWdgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbW1pdE1lc3NhZ2VDb25maWcoKSB7XG4gIC8vIExpc3Qgb2YgZXJyb3JzIGVuY291bnRlcmVkIHZhbGlkYXRpbmcgdGhlIGNvbmZpZy5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGUgbm9uLXZhbGlkYXRlZCBjb25maWcgb2JqZWN0LlxuICBjb25zdCBjb25maWc6IFBhcnRpYWw8TmdEZXZDb25maWc8e2NvbW1pdE1lc3NhZ2U6IENvbW1pdE1lc3NhZ2VDb25maWd9Pj4gPSBnZXRDb25maWcoKTtcblxuICBpZiAoY29uZmlnLmNvbW1pdE1lc3NhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBObyBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIFwiY29tbWl0TWVzc2FnZVwiYCk7XG4gIH1cblxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnIGFzIFJlcXVpcmVkPHR5cGVvZiBjb25maWc+O1xufVxuXG4vKiogU2NvcGUgcmVxdWlyZW1lbnQgbGV2ZWwgdG8gYmUgc2V0IGZvciBlYWNoIGNvbW1pdCB0eXBlLiAqL1xuZXhwb3J0IGVudW0gU2NvcGVSZXF1aXJlbWVudCB7XG4gIFJlcXVpcmVkLFxuICBPcHRpb25hbCxcbiAgRm9yYmlkZGVuLFxufVxuXG5leHBvcnQgZW51bSBSZWxlYXNlTm90ZXNMZXZlbCB7XG4gIEhpZGRlbixcbiAgVmlzaWJsZSxcbn1cblxuLyoqIEEgY29tbWl0IHR5cGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VHlwZSB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQ7XG4gIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbDtcbn1cblxuLyoqIFRoZSB2YWxpZCBjb21taXQgdHlwZXMgZm9yIEFuZ3VsYXIgY29tbWl0IG1lc3NhZ2VzLiAqL1xuZXhwb3J0IGNvbnN0IENPTU1JVF9UWVBFUzoge1trZXk6IHN0cmluZ106IENvbW1pdFR5cGV9ID0ge1xuICBidWlsZDoge1xuICAgIG5hbWU6ICdidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIGxvY2FsIHJlcG9zaXRvcnkgYnVpbGQgc3lzdGVtIGFuZCB0b29saW5nJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBjaToge1xuICAgIG5hbWU6ICdjaScsXG4gICAgZGVzY3JpcHRpb246ICdDaGFuZ2VzIHRvIENJIGNvbmZpZ3VyYXRpb24gYW5kIENJIHNwZWNpZmljIHRvb2xpbmcnLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbixcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBkb2NzOiB7XG4gICAgbmFtZTogJ2RvY3MnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlcyB3aGljaCBleGNsdXNpdmVseSBhZmZlY3RzIGRvY3VtZW50YXRpb24uJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICBmZWF0OiB7XG4gICAgbmFtZTogJ2ZlYXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlcyBhIG5ldyBmZWF0dXJlJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSxcbiAgfSxcbiAgZml4OiB7XG4gICAgbmFtZTogJ2ZpeCcsXG4gICAgZGVzY3JpcHRpb246ICdGaXhlcyBhIHByZXZpb3VzbHkgZGlzY292ZXJlZCBmYWlsdXJlL2J1ZycsXG4gICAgc2NvcGU6IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQsXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUsXG4gIH0sXG4gIHBlcmY6IHtcbiAgICBuYW1lOiAncGVyZicsXG4gICAgZGVzY3JpcHRpb246ICdJbXByb3ZlcyBwZXJmb3JtYW5jZSB3aXRob3V0IGFueSBjaGFuZ2UgaW4gZnVuY3Rpb25hbGl0eSBvciBBUEknLFxuICAgIHNjb3BlOiBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkLFxuICAgIHJlbGVhc2VOb3Rlc0xldmVsOiBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlLFxuICB9LFxuICByZWZhY3Rvcjoge1xuICAgIG5hbWU6ICdyZWZhY3RvcicsXG4gICAgZGVzY3JpcHRpb246ICdSZWZhY3RvciB3aXRob3V0IGFueSBjaGFuZ2UgaW4gZnVuY3Rpb25hbGl0eSBvciBBUEkgKGluY2x1ZGVzIHN0eWxlIGNoYW5nZXMpJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxuICByZWxlYXNlOiB7XG4gICAgbmFtZTogJ3JlbGVhc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnQSByZWxlYXNlIHBvaW50IGluIHRoZSByZXBvc2l0b3J5JyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4sXG4gICAgcmVsZWFzZU5vdGVzTGV2ZWw6IFJlbGVhc2VOb3Rlc0xldmVsLkhpZGRlbixcbiAgfSxcbiAgdGVzdDoge1xuICAgIG5hbWU6ICd0ZXN0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0ltcHJvdmVtZW50cyBvciBjb3JyZWN0aW9ucyBtYWRlIHRvIHRoZSBwcm9qZWN0XFwncyB0ZXN0IHN1aXRlJyxcbiAgICBzY29wZTogU2NvcGVSZXF1aXJlbWVudC5PcHRpb25hbCxcbiAgICByZWxlYXNlTm90ZXNMZXZlbDogUmVsZWFzZU5vdGVzTGV2ZWwuSGlkZGVuLFxuICB9LFxufTtcbiJdfQ==