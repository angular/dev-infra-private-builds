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
        define("@angular/dev-infra-private/ts-circular-dependencies", ["require", "exports", "tslib", "fs", "glob", "path", "yargs", "chalk", "@angular/dev-infra-private/ts-circular-dependencies/analyzer", "@angular/dev-infra-private/ts-circular-dependencies/golden", "@angular/dev-infra-private/ts-circular-dependencies/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var glob_1 = require("glob");
    var path_1 = require("path");
    var yargs = require("yargs");
    var chalk_1 = require("chalk");
    var analyzer_1 = require("@angular/dev-infra-private/ts-circular-dependencies/analyzer");
    var golden_1 = require("@angular/dev-infra-private/ts-circular-dependencies/golden");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    var projectDir = path_1.join(__dirname, '../../');
    var packagesDir = path_1.join(projectDir, 'packages/');
    // The default glob does not capture deprecated packages such as http, or the webworker platform.
    var defaultGlob = path_1.join(packagesDir, '!(http|platform-webworker|platform-webworker-dynamic)/**/*.ts');
    if (require.main === module) {
        var _a = yargs.help()
            .version(false)
            .strict()
            .command('check <golden-file>', 'Checks if the circular dependencies have changed.')
            .command('approve <golden-file>', 'Approves the current circular dependencies.')
            .demandCommand()
            .option('approve', { type: 'boolean', description: 'Approves the current circular dependencies.' })
            .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
            .option('base-dir', {
            type: 'string',
            description: 'Base directory used for shortening paths in the golden file.',
            default: projectDir,
            defaultDescription: 'Project directory'
        })
            .option('glob', {
            type: 'string',
            description: 'Glob that matches source files which should be checked.',
            default: defaultGlob,
            defaultDescription: 'All release packages'
        })
            .argv, command = _a._, goldenFile = _a.goldenFile, glob = _a.glob, baseDir = _a.baseDir, warnings = _a.warnings;
        var isApprove = command.includes('approve');
        process.exit(main(baseDir, isApprove, goldenFile, glob, warnings));
    }
    /**
     * Runs the ts-circular-dependencies tool.
     * @param baseDir Base directory which is used to build up relative file paths in goldens.
     * @param approve Whether the detected circular dependencies should be approved.
     * @param goldenFile Path to the golden file.
     * @param glob Glob that is used to collect all source files which should be checked/approved.
     * @param printWarnings Whether warnings should be printed. Warnings for unresolved modules/files
     *     are not printed by default.
     * @returns Status code.
     */
    function main(baseDir, approve, goldenFile, glob, printWarnings) {
        var analyzer = new analyzer_1.Analyzer(resolveModule);
        var cycles = [];
        var checkedNodes = new WeakSet();
        glob_1.sync(glob, { absolute: true }).forEach(function (filePath) {
            var sourceFile = analyzer.getSourceFile(filePath);
            cycles.push.apply(cycles, tslib_1.__spread(analyzer.findCycles(sourceFile, checkedNodes)));
        });
        var actual = golden_1.convertReferenceChainToGolden(cycles, baseDir);
        console.info(chalk_1.default.green("   Current number of cycles: " + chalk_1.default.yellow(cycles.length.toString())));
        if (approve) {
            fs_1.writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
            console.info(chalk_1.default.green('✅  Updated golden file.'));
            return 0;
        }
        else if (!fs_1.existsSync(goldenFile)) {
            console.error(chalk_1.default.red("\u274C  Could not find golden file: " + goldenFile));
            return 1;
        }
        // By default, warnings for unresolved files or modules are not printed. This is because
        // it's common that third-party modules are not resolved/visited. Also generated files
        // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
        if (printWarnings &&
            (analyzer.unresolvedFiles.size !== 0 || analyzer.unresolvedModules.size !== 0)) {
            console.info(chalk_1.default.yellow('The following imports could not be resolved:'));
            analyzer.unresolvedModules.forEach(function (specifier) { return console.info("  \u2022 " + specifier); });
            analyzer.unresolvedFiles.forEach(function (value, key) {
                console.info("  \u2022 " + getRelativePath(baseDir, key));
                value.forEach(function (specifier) { return console.info("      " + specifier); });
            });
        }
        var expected = JSON.parse(fs_1.readFileSync(goldenFile, 'utf8'));
        var _a = golden_1.compareGoldens(actual, expected), fixedCircularDeps = _a.fixedCircularDeps, newCircularDeps = _a.newCircularDeps;
        var isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;
        if (isMatching) {
            console.info(chalk_1.default.green('✅  Golden matches current circular dependencies.'));
            return 0;
        }
        console.error(chalk_1.default.red('❌  Golden does not match current circular dependencies.'));
        if (newCircularDeps.length !== 0) {
            console.error(chalk_1.default.yellow("   New circular dependencies which are not allowed:"));
            newCircularDeps.forEach(function (c) { return console.error("     \u2022 " + convertReferenceChainToString(c)); });
        }
        if (fixedCircularDeps.length !== 0) {
            console.error(chalk_1.default.yellow("   Fixed circular dependencies that need to be removed from the golden:"));
            fixedCircularDeps.forEach(function (c) { return console.error("     \u2022 " + convertReferenceChainToString(c)); });
            console.info();
            // Print the command for updating the golden. Note that we hard-code the script name for
            // approving default packages golden in `goldens/`. We cannot infer the script name passed to
            // Yarn automatically since script are launched in a child process where `argv0` is different.
            if (path_1.resolve(goldenFile) === path_1.resolve(projectDir, 'goldens/packages-circular-deps.json')) {
                console.info(chalk_1.default.yellow("   Please approve the new golden with: yarn ts-circular-deps:approve"));
            }
            else {
                console.info(chalk_1.default.yellow("   Please update the golden. The following command can be " +
                    ("run: yarn ts-circular-deps approve " + getRelativePath(baseDir, goldenFile) + ".")));
            }
        }
        return 1;
    }
    exports.main = main;
    /** Gets the specified path relative to the base directory. */
    function getRelativePath(baseDir, path) {
        return file_system_1.convertPathToForwardSlash(path_1.relative(baseDir, path));
    }
    /** Converts the given reference chain to its string representation. */
    function convertReferenceChainToString(chain) {
        return chain.join(' → ');
    }
    /**
     * Custom module resolver that maps specifiers starting with `@angular/` to the
     * local packages folder.
     */
    function resolveModule(specifier) {
        if (specifier.startsWith('@angular/')) {
            return packagesDir + specifier.substr('@angular/'.length);
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlCQUEyRDtJQUMzRCw2QkFBc0M7SUFDdEMsNkJBQTZDO0lBRTdDLDZCQUErQjtJQUMvQiwrQkFBMEI7SUFFMUIseUZBQW9EO0lBQ3BELHFGQUErRTtJQUMvRSwrRkFBd0Q7SUFFeEQsSUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxJQUFNLFdBQVcsR0FBRyxXQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELGlHQUFpRztJQUNqRyxJQUFNLFdBQVcsR0FDYixXQUFJLENBQUMsV0FBVyxFQUFFLCtEQUErRCxDQUFDLENBQUM7SUFFdkYsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUNyQixJQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQkF1Qk8sRUF2Qk4sY0FBVSxFQUFFLDBCQUFVLEVBQUUsY0FBSSxFQUFFLG9CQUFPLEVBQUUsc0JBdUJqQyxDQUFDO1FBQ2QsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUNwRTtJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLElBQUksQ0FDaEIsT0FBZSxFQUFFLE9BQWdCLEVBQUUsVUFBa0IsRUFBRSxJQUFZLEVBQ25FLGFBQXNCO1FBQ3hCLElBQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3QyxJ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QUFTLGVBQWUsQ0FBQyxPQUFlLEVBQUUsSUFBWTtRQUNwRCxPQUFPLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFNBQVMsNkJBQTZCLENBQUMsS0FBNkI7UUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLGFBQWEsQ0FBQyxTQUFpQjtRQUN0QyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDckMsT0FBTyxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtqb2luLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5cbmNvbnN0IHByb2plY3REaXIgPSBqb2luKF9fZGlybmFtZSwgJy4uLy4uLycpO1xuY29uc3QgcGFja2FnZXNEaXIgPSBqb2luKHByb2plY3REaXIsICdwYWNrYWdlcy8nKTtcbi8vIFRoZSBkZWZhdWx0IGdsb2IgZG9lcyBub3QgY2FwdHVyZSBkZXByZWNhdGVkIHBhY2thZ2VzIHN1Y2ggYXMgaHR0cCwgb3IgdGhlIHdlYndvcmtlciBwbGF0Zm9ybS5cbmNvbnN0IGRlZmF1bHRHbG9iID1cbiAgICBqb2luKHBhY2thZ2VzRGlyLCAnIShodHRwfHBsYXRmb3JtLXdlYndvcmtlcnxwbGF0Zm9ybS13ZWJ3b3JrZXItZHluYW1pYykvKiovKi50cycpO1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgY29uc3Qge186IGNvbW1hbmQsIGdvbGRlbkZpbGUsIGdsb2IsIGJhc2VEaXIsIHdhcm5pbmdzfSA9XG4gICAgICB5YXJncy5oZWxwKClcbiAgICAgICAgICAudmVyc2lvbihmYWxzZSlcbiAgICAgICAgICAuc3RyaWN0KClcbiAgICAgICAgICAuY29tbWFuZCgnY2hlY2sgPGdvbGRlbi1maWxlPicsICdDaGVja3MgaWYgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuJylcbiAgICAgICAgICAuY29tbWFuZCgnYXBwcm92ZSA8Z29sZGVuLWZpbGU+JywgJ0FwcHJvdmVzIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKVxuICAgICAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgICAgICAub3B0aW9uKFxuICAgICAgICAgICAgICAnYXBwcm92ZScsXG4gICAgICAgICAgICAgIHt0eXBlOiAnYm9vbGVhbicsIGRlc2NyaXB0aW9uOiAnQXBwcm92ZXMgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLid9KVxuICAgICAgICAgIC5vcHRpb24oJ3dhcm5pbmdzJywge3R5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdQcmludHMgYWxsIHdhcm5pbmdzLid9KVxuICAgICAgICAgIC5vcHRpb24oJ2Jhc2UtZGlyJywge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Jhc2UgZGlyZWN0b3J5IHVzZWQgZm9yIHNob3J0ZW5pbmcgcGF0aHMgaW4gdGhlIGdvbGRlbiBmaWxlLicsXG4gICAgICAgICAgICBkZWZhdWx0OiBwcm9qZWN0RGlyLFxuICAgICAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnUHJvamVjdCBkaXJlY3RvcnknXG4gICAgICAgICAgfSlcbiAgICAgICAgICAub3B0aW9uKCdnbG9iJywge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dsb2IgdGhhdCBtYXRjaGVzIHNvdXJjZSBmaWxlcyB3aGljaCBzaG91bGQgYmUgY2hlY2tlZC4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdEdsb2IsXG4gICAgICAgICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICdBbGwgcmVsZWFzZSBwYWNrYWdlcydcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hcmd2O1xuICBjb25zdCBpc0FwcHJvdmUgPSBjb21tYW5kLmluY2x1ZGVzKCdhcHByb3ZlJyk7XG4gIHByb2Nlc3MuZXhpdChtYWluKGJhc2VEaXIsIGlzQXBwcm92ZSwgZ29sZGVuRmlsZSwgZ2xvYiwgd2FybmluZ3MpKTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSB0cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMgdG9vbC5cbiAqIEBwYXJhbSBiYXNlRGlyIEJhc2UgZGlyZWN0b3J5IHdoaWNoIGlzIHVzZWQgdG8gYnVpbGQgdXAgcmVsYXRpdmUgZmlsZSBwYXRocyBpbiBnb2xkZW5zLlxuICogQHBhcmFtIGFwcHJvdmUgV2hldGhlciB0aGUgZGV0ZWN0ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBhcHByb3ZlZC5cbiAqIEBwYXJhbSBnb2xkZW5GaWxlIFBhdGggdG8gdGhlIGdvbGRlbiBmaWxlLlxuICogQHBhcmFtIGdsb2IgR2xvYiB0aGF0IGlzIHVzZWQgdG8gY29sbGVjdCBhbGwgc291cmNlIGZpbGVzIHdoaWNoIHNob3VsZCBiZSBjaGVja2VkL2FwcHJvdmVkLlxuICogQHBhcmFtIHByaW50V2FybmluZ3MgV2hldGhlciB3YXJuaW5ncyBzaG91bGQgYmUgcHJpbnRlZC4gV2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgbW9kdWxlcy9maWxlc1xuICogICAgIGFyZSBub3QgcHJpbnRlZCBieSBkZWZhdWx0LlxuICogQHJldHVybnMgU3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKFxuICAgIGJhc2VEaXI6IHN0cmluZywgYXBwcm92ZTogYm9vbGVhbiwgZ29sZGVuRmlsZTogc3RyaW5nLCBnbG9iOiBzdHJpbmcsXG4gICAgcHJpbnRXYXJuaW5nczogYm9vbGVhbik6IG51bWJlciB7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IEFuYWx5emVyKHJlc29sdmVNb2R1bGUpO1xuICBjb25zdCBjeWNsZXM6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgY29uc3QgY2hlY2tlZE5vZGVzID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBnbG9iU3luYyhnbG9iLCB7YWJzb2x1dGU6IHRydWV9KS5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gYW5hbHl6ZXIuZ2V0U291cmNlRmlsZShmaWxlUGF0aCk7XG4gICAgY3ljbGVzLnB1c2goLi4uYW5hbHl6ZXIuZmluZEN5Y2xlcyhzb3VyY2VGaWxlLCBjaGVja2VkTm9kZXMpKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0dWFsID0gY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4oY3ljbGVzLCBiYXNlRGlyKTtcblxuICBjb25zb2xlLmluZm8oXG4gICAgICBjaGFsay5ncmVlbihgICAgQ3VycmVudCBudW1iZXIgb2YgY3ljbGVzOiAke2NoYWxrLnllbGxvdyhjeWNsZXMubGVuZ3RoLnRvU3RyaW5nKCkpfWApKTtcblxuICBpZiAoYXBwcm92ZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZ29sZGVuRmlsZSwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsLCBudWxsLCAyKSk7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKCfinIUgIFVwZGF0ZWQgZ29sZGVuIGZpbGUuJykpO1xuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKCFleGlzdHNTeW5jKGdvbGRlbkZpbGUpKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYOKdjCAgQ291bGQgbm90IGZpbmQgZ29sZGVuIGZpbGU6ICR7Z29sZGVuRmlsZX1gKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBCeSBkZWZhdWx0LCB3YXJuaW5ncyBmb3IgdW5yZXNvbHZlZCBmaWxlcyBvciBtb2R1bGVzIGFyZSBub3QgcHJpbnRlZC4gVGhpcyBpcyBiZWNhdXNlXG4gIC8vIGl0J3MgY29tbW9uIHRoYXQgdGhpcmQtcGFydHkgbW9kdWxlcyBhcmUgbm90IHJlc29sdmVkL3Zpc2l0ZWQuIEFsc28gZ2VuZXJhdGVkIGZpbGVzXG4gIC8vIGZyb20gdGhlIFZpZXcgRW5naW5lIGNvbXBpbGVyIChpLmUuIGZhY3Rvcmllcywgc3VtbWFyaWVzKSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gIGlmIChwcmludFdhcm5pbmdzICYmXG4gICAgICAoYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLnNpemUgIT09IDAgfHwgYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMuc2l6ZSAhPT0gMCkpIHtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KCdUaGUgZm9sbG93aW5nIGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkOicpKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5mb3JFYWNoKHNwZWNpZmllciA9PiBjb25zb2xlLmluZm8oYCAg4oCiICR7c3BlY2lmaWVyfWApKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkRmlsZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY29uc29sZS5pbmZvKGAgIOKAoiAke2dldFJlbGF0aXZlUGF0aChiYXNlRGlyLCBrZXkpfWApO1xuICAgICAgdmFsdWUuZm9yRWFjaChzcGVjaWZpZXIgPT4gY29uc29sZS5pbmZvKGAgICAgICAke3NwZWNpZmllcn1gKSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBleHBlY3RlZDogR29sZGVuID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoZ29sZGVuRmlsZSwgJ3V0ZjgnKSk7XG4gIGNvbnN0IHtmaXhlZENpcmN1bGFyRGVwcywgbmV3Q2lyY3VsYXJEZXBzfSA9IGNvbXBhcmVHb2xkZW5zKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICBjb25zdCBpc01hdGNoaW5nID0gZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwICYmIG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggPT09IDA7XG5cbiAgaWYgKGlzTWF0Y2hpbmcpIHtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oJ+KchSAgR29sZGVuIG1hdGNoZXMgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ+KdjCAgR29sZGVuIGRvZXMgbm90IG1hdGNoIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgaWYgKG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnllbGxvdyhgICAgTmV3IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB3aGljaCBhcmUgbm90IGFsbG93ZWQ6YCkpO1xuICAgIG5ld0NpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gY29uc29sZS5lcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gIH1cbiAgaWYgKGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGNoYWxrLnllbGxvdyhgICAgRml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIGdvbGRlbjpgKSk7XG4gICAgZml4ZWRDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGNvbnNvbGUuZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGNvbnNvbGUuaW5mbygpO1xuICAgIC8vIFByaW50IHRoZSBjb21tYW5kIGZvciB1cGRhdGluZyB0aGUgZ29sZGVuLiBOb3RlIHRoYXQgd2UgaGFyZC1jb2RlIHRoZSBzY3JpcHQgbmFtZSBmb3JcbiAgICAvLyBhcHByb3ZpbmcgZGVmYXVsdCBwYWNrYWdlcyBnb2xkZW4gaW4gYGdvbGRlbnMvYC4gV2UgY2Fubm90IGluZmVyIHRoZSBzY3JpcHQgbmFtZSBwYXNzZWQgdG9cbiAgICAvLyBZYXJuIGF1dG9tYXRpY2FsbHkgc2luY2Ugc2NyaXB0IGFyZSBsYXVuY2hlZCBpbiBhIGNoaWxkIHByb2Nlc3Mgd2hlcmUgYGFyZ3YwYCBpcyBkaWZmZXJlbnQuXG4gICAgaWYgKHJlc29sdmUoZ29sZGVuRmlsZSkgPT09IHJlc29sdmUocHJvamVjdERpciwgJ2dvbGRlbnMvcGFja2FnZXMtY2lyY3VsYXItZGVwcy5qc29uJykpIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICBjaGFsay55ZWxsb3coYCAgIFBsZWFzZSBhcHByb3ZlIHRoZSBuZXcgZ29sZGVuIHdpdGg6IHlhcm4gdHMtY2lyY3VsYXItZGVwczphcHByb3ZlYCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KFxuICAgICAgICAgIGAgICBQbGVhc2UgdXBkYXRlIHRoZSBnb2xkZW4uIFRoZSBmb2xsb3dpbmcgY29tbWFuZCBjYW4gYmUgYCArXG4gICAgICAgICAgYHJ1bjogeWFybiB0cy1jaXJjdWxhci1kZXBzIGFwcHJvdmUgJHtnZXRSZWxhdGl2ZVBhdGgoYmFzZURpciwgZ29sZGVuRmlsZSl9LmApKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59XG5cbi8qKiBHZXRzIHRoZSBzcGVjaWZpZWQgcGF0aCByZWxhdGl2ZSB0byB0aGUgYmFzZSBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoYmFzZURpcjogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgcGF0aCkpO1xufVxuXG4vKiogQ29udmVydHMgdGhlIGdpdmVuIHJlZmVyZW5jZSBjaGFpbiB0byBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiAqL1xuZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoY2hhaW46IFJlZmVyZW5jZUNoYWluPHN0cmluZz4pIHtcbiAgcmV0dXJuIGNoYWluLmpvaW4oJyDihpIgJyk7XG59XG5cbi8qKlxuICogQ3VzdG9tIG1vZHVsZSByZXNvbHZlciB0aGF0IG1hcHMgc3BlY2lmaWVycyBzdGFydGluZyB3aXRoIGBAYW5ndWxhci9gIHRvIHRoZVxuICogbG9jYWwgcGFja2FnZXMgZm9sZGVyLlxuICovXG5mdW5jdGlvbiByZXNvbHZlTW9kdWxlKHNwZWNpZmllcjogc3RyaW5nKSB7XG4gIGlmIChzcGVjaWZpZXIuc3RhcnRzV2l0aCgnQGFuZ3VsYXIvJykpIHtcbiAgICByZXR1cm4gcGFja2FnZXNEaXIgKyBzcGVjaWZpZXIuc3Vic3RyKCdAYW5ndWxhci8nLmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=