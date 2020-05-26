#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
        define("@angular/dev-infra-private/ts-circular-dependencies", ["require", "exports", "tslib", "fs", "glob", "path", "yargs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/ts-circular-dependencies/analyzer", "@angular/dev-infra-private/ts-circular-dependencies/golden", "@angular/dev-infra-private/ts-circular-dependencies/file_system", "@angular/dev-infra-private/ts-circular-dependencies/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = exports.tsCircularDependenciesBuilder = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var glob_1 = require("glob");
    var path_1 = require("path");
    var yargs = require("yargs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var analyzer_1 = require("@angular/dev-infra-private/ts-circular-dependencies/analyzer");
    var golden_1 = require("@angular/dev-infra-private/ts-circular-dependencies/golden");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    var config_1 = require("@angular/dev-infra-private/ts-circular-dependencies/config");
    function tsCircularDependenciesBuilder(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .option('config', { type: 'string', demandOption: true, description: 'Path to the configuration file.' })
            .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
            .command('check', 'Checks if the circular dependencies have changed.', {}, function (argv) {
            var configArg = argv.config, warnings = argv.warnings;
            var configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
            var config = config_1.loadTestConfig(configPath);
            process.exit(main(false, config, warnings));
        })
            .command('approve', 'Approves the current circular dependencies.', {}, function (argv) {
            var configArg = argv.config, warnings = argv.warnings;
            var configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
            var config = config_1.loadTestConfig(configPath);
            process.exit(main(true, config, warnings));
        });
    }
    exports.tsCircularDependenciesBuilder = tsCircularDependenciesBuilder;
    /**
     * Runs the ts-circular-dependencies tool.
     * @param approve Whether the detected circular dependencies should be approved.
     * @param config Configuration for the current circular dependencies test.
     * @param printWarnings Whether warnings should be printed out.
     * @returns Status code.
     */
    function main(approve, config, printWarnings) {
        var baseDir = config.baseDir, goldenFile = config.goldenFile, glob = config.glob, resolveModule = config.resolveModule, approveCommand = config.approveCommand;
        var analyzer = new analyzer_1.Analyzer(resolveModule);
        var cycles = [];
        var checkedNodes = new WeakSet();
        glob_1.sync(glob, { absolute: true }).forEach(function (filePath) {
            var sourceFile = analyzer.getSourceFile(filePath);
            cycles.push.apply(cycles, tslib_1.__spread(analyzer.findCycles(sourceFile, checkedNodes)));
        });
        var actual = golden_1.convertReferenceChainToGolden(cycles, baseDir);
        console_1.info(console_1.green("   Current number of cycles: " + console_1.yellow(cycles.length.toString())));
        if (approve) {
            fs_1.writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
            console_1.info(console_1.green('✅  Updated golden file.'));
            return 0;
        }
        else if (!fs_1.existsSync(goldenFile)) {
            console_1.error(console_1.red("\u274C  Could not find golden file: " + goldenFile));
            return 1;
        }
        var warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;
        // By default, warnings for unresolved files or modules are not printed. This is because
        // it's common that third-party modules are not resolved/visited. Also generated files
        // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
        if (printWarnings && warningsCount !== 0) {
            console_1.info(console_1.yellow('⚠  The following imports could not be resolved:'));
            Array.from(analyzer.unresolvedModules).sort().forEach(function (specifier) { return console_1.info("  \u2022 " + specifier); });
            analyzer.unresolvedFiles.forEach(function (value, key) {
                console_1.info("  \u2022 " + getRelativePath(baseDir, key));
                value.sort().forEach(function (specifier) { return console_1.info("      " + specifier); });
            });
        }
        else {
            console_1.info(console_1.yellow("\u26A0  " + warningsCount + " imports could not be resolved."));
            console_1.info(console_1.yellow("   Please rerun with \"--warnings\" to inspect unresolved imports."));
        }
        var expected = JSON.parse(fs_1.readFileSync(goldenFile, 'utf8'));
        var _a = golden_1.compareGoldens(actual, expected), fixedCircularDeps = _a.fixedCircularDeps, newCircularDeps = _a.newCircularDeps;
        var isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;
        if (isMatching) {
            console_1.info(console_1.green('✅  Golden matches current circular dependencies.'));
            return 0;
        }
        console_1.error(console_1.red('❌  Golden does not match current circular dependencies.'));
        if (newCircularDeps.length !== 0) {
            console_1.error(console_1.yellow("   New circular dependencies which are not allowed:"));
            newCircularDeps.forEach(function (c) { return console_1.error("     \u2022 " + convertReferenceChainToString(c)); });
            console_1.error();
        }
        if (fixedCircularDeps.length !== 0) {
            console_1.error(console_1.yellow("   Fixed circular dependencies that need to be removed from the golden:"));
            fixedCircularDeps.forEach(function (c) { return console_1.error("     \u2022 " + convertReferenceChainToString(c)); });
            console_1.error();
            if (approveCommand) {
                console_1.info(console_1.yellow("   Please approve the new golden with: " + approveCommand));
            }
            else {
                console_1.info(console_1.yellow("   Please update the golden. The following command can be " +
                    ("run: yarn ts-circular-deps approve " + getRelativePath(process.cwd(), goldenFile) + ".")));
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
    if (require.main === module) {
        tsCircularDependenciesBuilder(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJEO0lBQzNELDZCQUFzQztJQUN0Qyw2QkFBbUQ7SUFFbkQsNkJBQStCO0lBRS9CLG9FQUFpRTtJQUVqRSx5RkFBb0Q7SUFDcEQscUZBQStFO0lBQy9FLCtGQUF3RDtJQUN4RCxxRkFBd0U7SUFHeEUsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7UUFDbEUsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FDSCxRQUFRLEVBQ1IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGlDQUFpQyxFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFDLENBQUM7YUFDMUUsT0FBTyxDQUNKLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxFQUFFLEVBQ2hFLFVBQUMsSUFBcUI7WUFDYixJQUFRLFNBQVMsR0FBYyxJQUFJLE9BQWxCLEVBQUUsUUFBUSxHQUFJLElBQUksU0FBUixDQUFTO1lBQzNDLElBQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFD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IS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7c3luYyBhcyBnbG9iU3luY30gZnJvbSAnZ2xvYic7XG5pbXBvcnQge2lzQWJzb2x1dGUsIHJlbGF0aXZlLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dyZWVuLCBpbmZvLCBlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0FuYWx5emVyLCBSZWZlcmVuY2VDaGFpbn0gZnJvbSAnLi9hbmFseXplcic7XG5pbXBvcnQge2NvbXBhcmVHb2xkZW5zLCBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbiwgR29sZGVufSBmcm9tICcuL2dvbGRlbic7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtsb2FkVGVzdENvbmZpZywgQ2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oXG4gICAgICAgICAgJ2NvbmZpZycsXG4gICAgICAgICAge3R5cGU6ICdzdHJpbmcnLCBkZW1hbmRPcHRpb246IHRydWUsIGRlc2NyaXB0aW9uOiAnUGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLid9KVxuICAgICAgLm9wdGlvbignd2FybmluZ3MnLCB7dHlwZTogJ2Jvb2xlYW4nLCBkZXNjcmlwdGlvbjogJ1ByaW50cyBhbGwgd2FybmluZ3MuJ30pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnY2hlY2snLCAnQ2hlY2tzIGlmIHRoZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgaGF2ZSBjaGFuZ2VkLicsIHt9LFxuICAgICAgICAgIChhcmd2OiB5YXJncy5Bcmd1bWVudHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID0gYXJndjtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChtYWluKGZhbHNlLCBjb25maWcsIHdhcm5pbmdzKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdhcHByb3ZlJywgJ0FwcHJvdmVzIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nLCB7fSwgKGFyZ3Y6IHlhcmdzLkFyZ3VtZW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4odHJ1ZSwgY29uZmlnLCB3YXJuaW5ncykpO1xuICAgICAgICAgIH0pO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhlIHRzLWNpcmN1bGFyLWRlcGVuZGVuY2llcyB0b29sLlxuICogQHBhcmFtIGFwcHJvdmUgV2hldGhlciB0aGUgZGV0ZWN0ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBhcHByb3ZlZC5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuXG4gKiBAcGFyYW0gcHJpbnRXYXJuaW5ncyBXaGV0aGVyIHdhcm5pbmdzIHNob3VsZCBiZSBwcmludGVkIG91dC5cbiAqIEByZXR1cm5zIFN0YXR1cyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgICBhcHByb3ZlOiBib29sZWFuLCBjb25maWc6IENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZywgcHJpbnRXYXJuaW5nczogYm9vbGVhbik6IG51bWJlciB7XG4gIGNvbnN0IHtiYXNlRGlyLCBnb2xkZW5GaWxlLCBnbG9iLCByZXNvbHZlTW9kdWxlLCBhcHByb3ZlQ29tbWFuZH0gPSBjb25maWc7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IEFuYWx5emVyKHJlc29sdmVNb2R1bGUpO1xuICBjb25zdCBjeWNsZXM6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgY29uc3QgY2hlY2tlZE5vZGVzID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBnbG9iU3luYyhnbG9iLCB7YWJzb2x1dGU6IHRydWV9KS5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gYW5hbHl6ZXIuZ2V0U291cmNlRmlsZShmaWxlUGF0aCk7XG4gICAgY3ljbGVzLnB1c2goLi4uYW5hbHl6ZXIuZmluZEN5Y2xlcyhzb3VyY2VGaWxlLCBjaGVja2VkTm9kZXMpKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0dWFsID0gY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4oY3ljbGVzLCBiYXNlRGlyKTtcblxuICBpbmZvKGdyZWVuKGAgICBDdXJyZW50IG51bWJlciBvZiBjeWNsZXM6ICR7eWVsbG93KGN5Y2xlcy5sZW5ndGgudG9TdHJpbmcoKSl9YCkpO1xuXG4gIGlmIChhcHByb3ZlKSB7XG4gICAgd3JpdGVGaWxlU3luYyhnb2xkZW5GaWxlLCBKU09OLnN0cmluZ2lmeShhY3R1YWwsIG51bGwsIDIpKTtcbiAgICBpbmZvKGdyZWVuKCfinIUgIFVwZGF0ZWQgZ29sZGVuIGZpbGUuJykpO1xuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKCFleGlzdHNTeW5jKGdvbGRlbkZpbGUpKSB7XG4gICAgZXJyb3IocmVkKGDinYwgIENvdWxkIG5vdCBmaW5kIGdvbGRlbiBmaWxlOiAke2dvbGRlbkZpbGV9YCkpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3Qgd2FybmluZ3NDb3VudCA9IGFuYWx5emVyLnVucmVzb2x2ZWRGaWxlcy5zaXplICsgYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMuc2l6ZTtcblxuICAvLyBCeSBkZWZhdWx0LCB3YXJuaW5ncyBmb3IgdW5yZXNvbHZlZCBmaWxlcyBvciBtb2R1bGVzIGFyZSBub3QgcHJpbnRlZC4gVGhpcyBpcyBiZWNhdXNlXG4gIC8vIGl0J3MgY29tbW9uIHRoYXQgdGhpcmQtcGFydHkgbW9kdWxlcyBhcmUgbm90IHJlc29sdmVkL3Zpc2l0ZWQuIEFsc28gZ2VuZXJhdGVkIGZpbGVzXG4gIC8vIGZyb20gdGhlIFZpZXcgRW5naW5lIGNvbXBpbGVyIChpLmUuIGZhY3Rvcmllcywgc3VtbWFyaWVzKSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gIGlmIChwcmludFdhcm5pbmdzICYmIHdhcm5pbmdzQ291bnQgIT09IDApIHtcbiAgICBpbmZvKHllbGxvdygn4pqgICBUaGUgZm9sbG93aW5nIGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkOicpKTtcbiAgICBBcnJheS5mcm9tKGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzKS5zb3J0KCkuZm9yRWFjaChzcGVjaWZpZXIgPT4gaW5mbyhgICDigKIgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIGFuYWx5emVyLnVucmVzb2x2ZWRGaWxlcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBpbmZvKGAgIOKAoiAke2dldFJlbGF0aXZlUGF0aChiYXNlRGlyLCBrZXkpfWApO1xuICAgICAgdmFsdWUuc29ydCgpLmZvckVhY2goc3BlY2lmaWVyID0+IGluZm8oYCAgICAgICR7c3BlY2lmaWVyfWApKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKHllbGxvdyhg4pqgICAke3dhcm5pbmdzQ291bnR9IGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgUGxlYXNlIHJlcnVuIHdpdGggXCItLXdhcm5pbmdzXCIgdG8gaW5zcGVjdCB1bnJlc29sdmVkIGltcG9ydHMuYCkpO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWQ6IEdvbGRlbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGdvbGRlbkZpbGUsICd1dGY4JykpO1xuICBjb25zdCB7Zml4ZWRDaXJjdWxhckRlcHMsIG5ld0NpcmN1bGFyRGVwc30gPSBjb21wYXJlR29sZGVucyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgY29uc3QgaXNNYXRjaGluZyA9IGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMCAmJiBuZXdDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwO1xuXG4gIGlmIChpc01hdGNoaW5nKSB7XG4gICAgaW5mbyhncmVlbign4pyFICBHb2xkZW4gbWF0Y2hlcyBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBlcnJvcihyZWQoJ+KdjCAgR29sZGVuIGRvZXMgbm90IG1hdGNoIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgaWYgKG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcih5ZWxsb3coYCAgIE5ldyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgd2hpY2ggYXJlIG5vdCBhbGxvd2VkOmApKTtcbiAgICBuZXdDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGVycm9yKGAgICAgIOKAoiAke2NvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGMpfWApKTtcbiAgICBlcnJvcigpO1xuICB9XG4gIGlmIChmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcih5ZWxsb3coYCAgIEZpeGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBnb2xkZW46YCkpO1xuICAgIGZpeGVkQ2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBlcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgZXJyb3IoKTtcbiAgICBpZiAoYXBwcm92ZUNvbW1hbmQpIHtcbiAgICAgIGluZm8oeWVsbG93KGAgICBQbGVhc2UgYXBwcm92ZSB0aGUgbmV3IGdvbGRlbiB3aXRoOiAke2FwcHJvdmVDb21tYW5kfWApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgYCAgIFBsZWFzZSB1cGRhdGUgdGhlIGdvbGRlbi4gVGhlIGZvbGxvd2luZyBjb21tYW5kIGNhbiBiZSBgICtcbiAgICAgICAgICBgcnVuOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHMgYXBwcm92ZSAke2dldFJlbGF0aXZlUGF0aChwcm9jZXNzLmN3ZCgpLCBnb2xkZW5GaWxlKX0uYCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMTtcbn1cblxuLyoqIEdldHMgdGhlIHNwZWNpZmllZCBwYXRoIHJlbGF0aXZlIHRvIHRoZSBiYXNlIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChiYXNlRGlyOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICByZXR1cm4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBwYXRoKSk7XG59XG5cbi8qKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gcmVmZXJlbmNlIGNoYWluIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uICovXG5mdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjaGFpbjogUmVmZXJlbmNlQ2hhaW48c3RyaW5nPikge1xuICByZXR1cm4gY2hhaW4uam9pbignIOKGkiAnKTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19