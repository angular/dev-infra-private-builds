/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Minimatch } from 'minimatch';
/** Map that holds patterns and their corresponding Minimatch globs. */
const patternCache = new Map();
/**
 * Gets a glob for the given pattern. The cached glob will be returned
 * if available. Otherwise a new glob will be created and cached.
 */
export function getOrCreateGlob(pattern) {
    if (patternCache.has(pattern)) {
        return patternCache.get(pattern);
    }
    const glob = new Minimatch(pattern, { dot: true });
    patternCache.set(pattern, glob);
    return glob;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFhLFNBQVMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVoRCx1RUFBdUU7QUFDdkUsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXNCLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxPQUFlO0lBQzdDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM3QixPQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLENBQUM7S0FDbkM7SUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNqRCxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SU1pbmltYXRjaCwgTWluaW1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuXG4vKiogTWFwIHRoYXQgaG9sZHMgcGF0dGVybnMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgTWluaW1hdGNoIGdsb2JzLiAqL1xuY29uc3QgcGF0dGVybkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIElNaW5pbWF0Y2g+KCk7XG5cbi8qKlxuICogR2V0cyBhIGdsb2IgZm9yIHRoZSBnaXZlbiBwYXR0ZXJuLiBUaGUgY2FjaGVkIGdsb2Igd2lsbCBiZSByZXR1cm5lZFxuICogaWYgYXZhaWxhYmxlLiBPdGhlcndpc2UgYSBuZXcgZ2xvYiB3aWxsIGJlIGNyZWF0ZWQgYW5kIGNhY2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuOiBzdHJpbmcpIHtcbiAgaWYgKHBhdHRlcm5DYWNoZS5oYXMocGF0dGVybikpIHtcbiAgICByZXR1cm4gcGF0dGVybkNhY2hlLmdldChwYXR0ZXJuKSE7XG4gIH1cbiAgY29uc3QgZ2xvYiA9IG5ldyBNaW5pbWF0Y2gocGF0dGVybiwge2RvdDogdHJ1ZX0pO1xuICBwYXR0ZXJuQ2FjaGUuc2V0KHBhdHRlcm4sIGdsb2IpO1xuICByZXR1cm4gZ2xvYjtcbn1cbiJdfQ==