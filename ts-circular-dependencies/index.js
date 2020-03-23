#!/usr/bin/env node
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
        define("@angular/dev-infra-private/ts-circular-dependencies", ["require", "exports", "tslib", "fs", "glob", "path", "yargs", "chalk", "@angular/dev-infra-private/ts-circular-dependencies/analyzer", "@angular/dev-infra-private/ts-circular-dependencies/golden", "@angular/dev-infra-private/ts-circular-dependencies/file_system", "@angular/dev-infra-private/utils/config"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var projectDir = config_1.getRepoBaseDir();
    var packagesDir = path_1.join(projectDir, 'packages/');
    // The default glob does not capture deprecated packages such as http, or the webworker platform.
    var defaultGlob = path_1.join(packagesDir, '!(http|platform-webworker|platform-webworker-dynamic)/**/*.ts');
    if (require.main === module) {
        var _a = yargs.help()
            .strict()
            .command('check <goldenFile>', 'Checks if the circular dependencies have changed.')
            .command('approve <goldenFile>', 'Approves the current circular dependencies.')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkQ7SUFDM0QsNkJBQXNDO0lBQ3RDLDZCQUE2QztJQUU3Qyw2QkFBK0I7SUFDL0IsK0JBQTBCO0lBRTFCLHlGQUFvRDtJQUNwRCxxRkFBK0U7SUFDL0UsK0ZBQXdEO0lBRXhELGtFQUErQztJQUUvQyxJQUFNLFVBQVUsR0FBRyx1QkFBYyxFQUFFLENBQUM7SUFDcEMsSUFBTSxXQUFXLEdBQUcsV0FBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNsRCxpR0FBaUc7SUFDakcsSUFBTSxXQUFXLEdBQ2IsV0FBSSxDQUFDLFdBQVcsRUFBRSwrREFBK0QsQ0FBQyxDQUFDO0lBRXZGLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDckIsSUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQkFzQk8sRUF0Qk4sY0FBVSxFQUFFLDBCQUFVLEVBQUUsY0FBSSxFQUFFLG9CQUFPLEVBQUUsc0JBc0JqQyxDQUFDO1FBQ2QsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUNwRTtJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLElBQUksQ0FDaEIsT0FBZSxFQUFFLE9BQWdCLEVBQUUsVUFBa0IsRUFBRSxJQUFZLEVBQ25FLGFBQXNCO1FBQ3hCLElBQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3QyxJQUFNLE1B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QWUsQ0FBQyxPQUFlLEVBQUUsSUFBWTtRQUNwRCxPQUFPLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFNBQVMsNkJBQTZCLENBQUMsS0FBNkI7UUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLGFBQWEsQ0FBQyxTQUFpQjtRQUN0QyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDckMsT0FBTyxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtqb2luLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmNvbnN0IHByb2plY3REaXIgPSBnZXRSZXBvQmFzZURpcigpO1xuY29uc3QgcGFja2FnZXNEaXIgPSBqb2luKHByb2plY3REaXIsICdwYWNrYWdlcy8nKTtcbi8vIFRoZSBkZWZhdWx0IGdsb2IgZG9lcyBub3QgY2FwdHVyZSBkZXByZWNhdGVkIHBhY2thZ2VzIHN1Y2ggYXMgaHR0cCwgb3IgdGhlIHdlYndvcmtlciBwbGF0Zm9ybS5cbmNvbnN0IGRlZmF1bHRHbG9iID1cbiAgICBqb2luKHBhY2thZ2VzRGlyLCAnIShodHRwfHBsYXRmb3JtLXdlYndvcmtlcnxwbGF0Zm9ybS13ZWJ3b3JrZXItZHluYW1pYykvKiovKi50cycpO1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgY29uc3Qge186IGNvbW1hbmQsIGdvbGRlbkZpbGUsIGdsb2IsIGJhc2VEaXIsIHdhcm5pbmdzfSA9XG4gICAgICB5YXJncy5oZWxwKClcbiAgICAgICAgICAuc3RyaWN0KClcbiAgICAgICAgICAuY29tbWFuZCgnY2hlY2sgPGdvbGRlbkZpbGU+JywgJ0NoZWNrcyBpZiB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGhhdmUgY2hhbmdlZC4nKVxuICAgICAgICAgIC5jb21tYW5kKCdhcHByb3ZlIDxnb2xkZW5GaWxlPicsICdBcHByb3ZlcyB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJylcbiAgICAgICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAgICAgLm9wdGlvbihcbiAgICAgICAgICAgICAgJ2FwcHJvdmUnLFxuICAgICAgICAgICAgICB7dHlwZTogJ2Jvb2xlYW4nLCBkZXNjcmlwdGlvbjogJ0FwcHJvdmVzIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nfSlcbiAgICAgICAgICAub3B0aW9uKCd3YXJuaW5ncycsIHt0eXBlOiAnYm9vbGVhbicsIGRlc2NyaXB0aW9uOiAnUHJpbnRzIGFsbCB3YXJuaW5ncy4nfSlcbiAgICAgICAgICAub3B0aW9uKCdiYXNlLWRpcicsIHtcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCYXNlIGRpcmVjdG9yeSB1c2VkIGZvciBzaG9ydGVuaW5nIHBhdGhzIGluIHRoZSBnb2xkZW4gZmlsZS4nLFxuICAgICAgICAgICAgZGVmYXVsdDogcHJvamVjdERpcixcbiAgICAgICAgICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ1Byb2plY3QgZGlyZWN0b3J5J1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbignZ2xvYicsIHtcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHbG9iIHRoYXQgbWF0Y2hlcyBzb3VyY2UgZmlsZXMgd2hpY2ggc2hvdWxkIGJlIGNoZWNrZWQuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRHbG9iLFxuICAgICAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnQWxsIHJlbGVhc2UgcGFja2FnZXMnXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXJndjtcbiAgY29uc3QgaXNBcHByb3ZlID0gY29tbWFuZC5pbmNsdWRlcygnYXBwcm92ZScpO1xuICBwcm9jZXNzLmV4aXQobWFpbihiYXNlRGlyLCBpc0FwcHJvdmUsIGdvbGRlbkZpbGUsIGdsb2IsIHdhcm5pbmdzKSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzIHRvb2wuXG4gKiBAcGFyYW0gYmFzZURpciBCYXNlIGRpcmVjdG9yeSB3aGljaCBpcyB1c2VkIHRvIGJ1aWxkIHVwIHJlbGF0aXZlIGZpbGUgcGF0aHMgaW4gZ29sZGVucy5cbiAqIEBwYXJhbSBhcHByb3ZlIFdoZXRoZXIgdGhlIGRldGVjdGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBzaG91bGQgYmUgYXBwcm92ZWQuXG4gKiBAcGFyYW0gZ29sZGVuRmlsZSBQYXRoIHRvIHRoZSBnb2xkZW4gZmlsZS5cbiAqIEBwYXJhbSBnbG9iIEdsb2IgdGhhdCBpcyB1c2VkIHRvIGNvbGxlY3QgYWxsIHNvdXJjZSBmaWxlcyB3aGljaCBzaG91bGQgYmUgY2hlY2tlZC9hcHByb3ZlZC5cbiAqIEBwYXJhbSBwcmludFdhcm5pbmdzIFdoZXRoZXIgd2FybmluZ3Mgc2hvdWxkIGJlIHByaW50ZWQuIFdhcm5pbmdzIGZvciB1bnJlc29sdmVkIG1vZHVsZXMvZmlsZXNcbiAqICAgICBhcmUgbm90IHByaW50ZWQgYnkgZGVmYXVsdC5cbiAqIEByZXR1cm5zIFN0YXR1cyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgICBiYXNlRGlyOiBzdHJpbmcsIGFwcHJvdmU6IGJvb2xlYW4sIGdvbGRlbkZpbGU6IHN0cmluZywgZ2xvYjogc3RyaW5nLFxuICAgIHByaW50V2FybmluZ3M6IGJvb2xlYW4pOiBudW1iZXIge1xuICBjb25zdCBhbmFseXplciA9IG5ldyBBbmFseXplcihyZXNvbHZlTW9kdWxlKTtcbiAgY29uc3QgY3ljbGVzOiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gIGNvbnN0IGNoZWNrZWROb2RlcyA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgZ2xvYlN5bmMoZ2xvYiwge2Fic29sdXRlOiB0cnVlfSkuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGFuYWx5emVyLmdldFNvdXJjZUZpbGUoZmlsZVBhdGgpO1xuICAgIGN5Y2xlcy5wdXNoKC4uLmFuYWx5emVyLmZpbmRDeWNsZXMoc291cmNlRmlsZSwgY2hlY2tlZE5vZGVzKSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdHVhbCA9IGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuKGN5Y2xlcywgYmFzZURpcik7XG5cbiAgY29uc29sZS5pbmZvKFxuICAgICAgY2hhbGsuZ3JlZW4oYCAgIEN1cnJlbnQgbnVtYmVyIG9mIGN5Y2xlczogJHtjaGFsay55ZWxsb3coY3ljbGVzLmxlbmd0aC50b1N0cmluZygpKX1gKSk7XG5cbiAgaWYgKGFwcHJvdmUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGdvbGRlbkZpbGUsIEpTT04uc3RyaW5naWZ5KGFjdHVhbCwgbnVsbCwgMikpO1xuICAgIGNvbnNvbGUuaW5mbyhjaGFsay5ncmVlbign4pyFICBVcGRhdGVkIGdvbGRlbiBmaWxlLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmICghZXhpc3RzU3luYyhnb2xkZW5GaWxlKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGDinYwgIENvdWxkIG5vdCBmaW5kIGdvbGRlbiBmaWxlOiAke2dvbGRlbkZpbGV9YCkpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLy8gQnkgZGVmYXVsdCwgd2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgZmlsZXMgb3IgbW9kdWxlcyBhcmUgbm90IHByaW50ZWQuIFRoaXMgaXMgYmVjYXVzZVxuICAvLyBpdCdzIGNvbW1vbiB0aGF0IHRoaXJkLXBhcnR5IG1vZHVsZXMgYXJlIG5vdCByZXNvbHZlZC92aXNpdGVkLiBBbHNvIGdlbmVyYXRlZCBmaWxlc1xuICAvLyBmcm9tIHRoZSBWaWV3IEVuZ2luZSBjb21waWxlciAoaS5lLiBmYWN0b3JpZXMsIHN1bW1hcmllcykgY2Fubm90IGJlIHJlc29sdmVkLlxuICBpZiAocHJpbnRXYXJuaW5ncyAmJlxuICAgICAgKGFuYWx5emVyLnVucmVzb2x2ZWRGaWxlcy5zaXplICE9PSAwIHx8IGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzLnNpemUgIT09IDApKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdygnVGhlIGZvbGxvd2luZyBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZDonKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMuZm9yRWFjaChzcGVjaWZpZXIgPT4gY29uc29sZS5pbmZvKGAgIOKAoiAke3NwZWNpZmllcn1gKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgICDigKIgJHtnZXRSZWxhdGl2ZVBhdGgoYmFzZURpciwga2V5KX1gKTtcbiAgICAgIHZhbHVlLmZvckVhY2goc3BlY2lmaWVyID0+IGNvbnNvbGUuaW5mbyhgICAgICAgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWQ6IEdvbGRlbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGdvbGRlbkZpbGUsICd1dGY4JykpO1xuICBjb25zdCB7Zml4ZWRDaXJjdWxhckRlcHMsIG5ld0NpcmN1bGFyRGVwc30gPSBjb21wYXJlR29sZGVucyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgY29uc3QgaXNNYXRjaGluZyA9IGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMCAmJiBuZXdDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwO1xuXG4gIGlmIChpc01hdGNoaW5nKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKCfinIUgIEdvbGRlbiBtYXRjaGVzIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCfinYwgIEdvbGRlbiBkb2VzIG5vdCBtYXRjaCBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gIGlmIChuZXdDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYCAgIE5ldyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgd2hpY2ggYXJlIG5vdCBhbGxvd2VkOmApKTtcbiAgICBuZXdDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGNvbnNvbGUuZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICB9XG4gIGlmIChmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay55ZWxsb3coYCAgIEZpeGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBnb2xkZW46YCkpO1xuICAgIGZpeGVkQ2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBjb25zb2xlLmVycm9yKGAgICAgIOKAoiAke2NvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGMpfWApKTtcbiAgICBjb25zb2xlLmluZm8oKTtcbiAgICAvLyBQcmludCB0aGUgY29tbWFuZCBmb3IgdXBkYXRpbmcgdGhlIGdvbGRlbi4gTm90ZSB0aGF0IHdlIGhhcmQtY29kZSB0aGUgc2NyaXB0IG5hbWUgZm9yXG4gICAgLy8gYXBwcm92aW5nIGRlZmF1bHQgcGFja2FnZXMgZ29sZGVuIGluIGBnb2xkZW5zL2AuIFdlIGNhbm5vdCBpbmZlciB0aGUgc2NyaXB0IG5hbWUgcGFzc2VkIHRvXG4gICAgLy8gWWFybiBhdXRvbWF0aWNhbGx5IHNpbmNlIHNjcmlwdCBhcmUgbGF1bmNoZWQgaW4gYSBjaGlsZCBwcm9jZXNzIHdoZXJlIGBhcmd2MGAgaXMgZGlmZmVyZW50LlxuICAgIGlmIChyZXNvbHZlKGdvbGRlbkZpbGUpID09PSByZXNvbHZlKHByb2plY3REaXIsICdnb2xkZW5zL3BhY2thZ2VzLWNpcmN1bGFyLWRlcHMuanNvbicpKSB7XG4gICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgY2hhbGsueWVsbG93KGAgICBQbGVhc2UgYXBwcm92ZSB0aGUgbmV3IGdvbGRlbiB3aXRoOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHM6YXBwcm92ZWApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhcbiAgICAgICAgICBgICAgUGxlYXNlIHVwZGF0ZSB0aGUgZ29sZGVuLiBUaGUgZm9sbG93aW5nIGNvbW1hbmQgY2FuIGJlIGAgK1xuICAgICAgICAgIGBydW46IHlhcm4gdHMtY2lyY3VsYXItZGVwcyBhcHByb3ZlICR7Z2V0UmVsYXRpdmVQYXRoKGJhc2VEaXIsIGdvbGRlbkZpbGUpfS5gKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiAxO1xufVxuXG4vKiogR2V0cyB0aGUgc3BlY2lmaWVkIHBhdGggcmVsYXRpdmUgdG8gdGhlIGJhc2UgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGJhc2VEaXI6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIHBhdGgpKTtcbn1cblxuLyoqIENvbnZlcnRzIHRoZSBnaXZlbiByZWZlcmVuY2UgY2hhaW4gdG8gaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbi4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGNoYWluOiBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+KSB7XG4gIHJldHVybiBjaGFpbi5qb2luKCcg4oaSICcpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBtb2R1bGUgcmVzb2x2ZXIgdGhhdCBtYXBzIHNwZWNpZmllcnMgc3RhcnRpbmcgd2l0aCBgQGFuZ3VsYXIvYCB0byB0aGVcbiAqIGxvY2FsIHBhY2thZ2VzIGZvbGRlci5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZU1vZHVsZShzcGVjaWZpZXI6IHN0cmluZykge1xuICBpZiAoc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJ0Bhbmd1bGFyLycpKSB7XG4gICAgcmV0dXJuIHBhY2thZ2VzRGlyICsgc3BlY2lmaWVyLnN1YnN0cignQGFuZ3VsYXIvJy5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19