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
        define("@angular/dev-infra-private/ts-circular-dependencies", ["require", "exports", "tslib", "fs", "glob", "path", "yargs", "chalk", "@angular/dev-infra-private/ts-circular-dependencies/analyzer", "@angular/dev-infra-private/ts-circular-dependencies/golden", "@angular/dev-infra-private/ts-circular-dependencies/file_system", "@angular/dev-infra-private/ts-circular-dependencies/config"], factory);
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
    var chalk_1 = require("chalk");
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
        var warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;
        // By default, warnings for unresolved files or modules are not printed. This is because
        // it's common that third-party modules are not resolved/visited. Also generated files
        // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
        if (printWarnings && warningsCount !== 0) {
            console.info(chalk_1.default.yellow('⚠  The following imports could not be resolved:'));
            Array.from(analyzer.unresolvedModules)
                .sort()
                .forEach(function (specifier) { return console.info("  \u2022 " + specifier); });
            analyzer.unresolvedFiles.forEach(function (value, key) {
                console.info("  \u2022 " + getRelativePath(baseDir, key));
                value.sort().forEach(function (specifier) { return console.info("      " + specifier); });
            });
        }
        else {
            console.info(chalk_1.default.yellow("\u26A0  " + warningsCount + " imports could not be resolved."));
            console.info(chalk_1.default.yellow("   Please rerun with \"--warnings\" to inspect unresolved imports."));
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
            console.error();
        }
        if (fixedCircularDeps.length !== 0) {
            console.error(chalk_1.default.yellow("   Fixed circular dependencies that need to be removed from the golden:"));
            fixedCircularDeps.forEach(function (c) { return console.error("     \u2022 " + convertReferenceChainToString(c)); });
            console.error();
            if (approveCommand) {
                console.info(chalk_1.default.yellow("   Please approve the new golden with: " + approveCommand));
            }
            else {
                console.info(chalk_1.default.yellow("   Please update the golden. The following command can be " +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJEO0lBQzNELDZCQUFzQztJQUN0Qyw2QkFBbUQ7SUFFbkQsNkJBQStCO0lBQy9CLCtCQUEwQjtJQUUxQix5RkFBb0Q7SUFDcEQscUZBQStFO0lBQy9FLCtGQUF3RDtJQUN4RCxxRkFBd0U7SUFHeEUsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7UUFDbEUsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FDSCxRQUFRLEVBQ1IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGlDQUFpQyxFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFDLENBQUM7YUFDMUUsT0FBTyxDQUNKLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxFQUFFLEVBQ2hFLFVBQUMsSUFBcUI7WUFDYixJQUFRLFNBQVMsR0FBYyxJQUFJLE9BQWxCLEVBQUUsUUFBUSxHQUFJLElBQUksU0FBUixDQUFTO1lBQzNDLElBQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFD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LFNBQVMsZUFBZSxDQUFDLE9BQWUsRUFBRSxJQUFZO1FBQ3BELE9BQU8sdUNBQXlCLENBQUMsZUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCx1RUFBdUU7SUFDdkUsU0FBUyw2QkFBNkIsQ0FBQyxLQUE2QjtRQUNsRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7c3luYyBhcyBnbG9iU3luY30gZnJvbSAnZ2xvYic7XG5pbXBvcnQge2lzQWJzb2x1dGUsIHJlbGF0aXZlLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcblxuaW1wb3J0IHtBbmFseXplciwgUmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtjb21wYXJlR29sZGVucywgY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4sIEdvbGRlbn0gZnJvbSAnLi9nb2xkZW4nO1xuaW1wb3J0IHtjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNofSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7bG9hZFRlc3RDb25maWcsIENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAub3B0aW9uKFxuICAgICAgICAgICdjb25maWcnLFxuICAgICAgICAgIHt0eXBlOiAnc3RyaW5nJywgZGVtYW5kT3B0aW9uOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS4nfSlcbiAgICAgIC5vcHRpb24oJ3dhcm5pbmdzJywge3R5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdQcmludHMgYWxsIHdhcm5pbmdzLid9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2NoZWNrJywgJ0NoZWNrcyBpZiB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGhhdmUgY2hhbmdlZC4nLCB7fSxcbiAgICAgICAgICAoYXJndjogeWFyZ3MuQXJndW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQobWFpbihmYWxzZSwgY29uZmlnLCB3YXJuaW5ncykpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYXBwcm92ZScsICdBcHByb3ZlcyB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJywge30sIChhcmd2OiB5YXJncy5Bcmd1bWVudHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID0gYXJndjtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChtYWluKHRydWUsIGNvbmZpZywgd2FybmluZ3MpKTtcbiAgICAgICAgICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSB0cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMgdG9vbC5cbiAqIEBwYXJhbSBhcHByb3ZlIFdoZXRoZXIgdGhlIGRldGVjdGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBzaG91bGQgYmUgYXBwcm92ZWQuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0ZXN0LlxuICogQHBhcmFtIHByaW50V2FybmluZ3MgV2hldGhlciB3YXJuaW5ncyBzaG91bGQgYmUgcHJpbnRlZCBvdXQuXG4gKiBAcmV0dXJucyBTdGF0dXMgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW4oXG4gICAgYXBwcm92ZTogYm9vbGVhbiwgY29uZmlnOiBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcsIHByaW50V2FybmluZ3M6IGJvb2xlYW4pOiBudW1iZXIge1xuICBjb25zdCB7YmFzZURpciwgZ29sZGVuRmlsZSwgZ2xvYiwgcmVzb2x2ZU1vZHVsZSwgYXBwcm92ZUNvbW1hbmR9ID0gY29uZmlnO1xuICBjb25zdCBhbmFseXplciA9IG5ldyBBbmFseXplcihyZXNvbHZlTW9kdWxlKTtcbiAgY29uc3QgY3ljbGVzOiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gIGNvbnN0IGNoZWNrZWROb2RlcyA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgZ2xvYlN5bmMoZ2xvYiwge2Fic29sdXRlOiB0cnVlfSkuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGFuYWx5emVyLmdldFNvdXJjZUZpbGUoZmlsZVBhdGgpO1xuICAgIGN5Y2xlcy5wdXNoKC4uLmFuYWx5emVyLmZpbmRDeWNsZXMoc291cmNlRmlsZSwgY2hlY2tlZE5vZGVzKSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdHVhbCA9IGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuKGN5Y2xlcywgYmFzZURpcik7XG5cbiAgY29uc29sZS5pbmZvKFxuICAgICAgY2hhbGsuZ3JlZW4oYCAgIEN1cnJlbnQgbnVtYmVyIG9mIGN5Y2xlczogJHtjaGFsay55ZWxsb3coY3ljbGVzLmxlbmd0aC50b1N0cmluZygpKX1gKSk7XG5cbiAgaWYgKGFwcHJvdmUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGdvbGRlbkZpbGUsIEpTT04uc3RyaW5naWZ5KGFjdHVhbCwgbnVsbCwgMikpO1xuICAgIGNvbnNvbGUuaW5mbyhjaGFsay5ncmVlbign4pyFICBVcGRhdGVkIGdvbGRlbiBmaWxlLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmICghZXhpc3RzU3luYyhnb2xkZW5GaWxlKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGDinYwgIENvdWxkIG5vdCBmaW5kIGdvbGRlbiBmaWxlOiAke2dvbGRlbkZpbGV9YCkpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3Qgd2FybmluZ3NDb3VudCA9IGFuYWx5emVyLnVucmVzb2x2ZWRGaWxlcy5zaXplICsgYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMuc2l6ZTtcblxuICAvLyBCeSBkZWZhdWx0LCB3YXJuaW5ncyBmb3IgdW5yZXNvbHZlZCBmaWxlcyBvciBtb2R1bGVzIGFyZSBub3QgcHJpbnRlZC4gVGhpcyBpcyBiZWNhdXNlXG4gIC8vIGl0J3MgY29tbW9uIHRoYXQgdGhpcmQtcGFydHkgbW9kdWxlcyBhcmUgbm90IHJlc29sdmVkL3Zpc2l0ZWQuIEFsc28gZ2VuZXJhdGVkIGZpbGVzXG4gIC8vIGZyb20gdGhlIFZpZXcgRW5naW5lIGNvbXBpbGVyIChpLmUuIGZhY3Rvcmllcywgc3VtbWFyaWVzKSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gIGlmIChwcmludFdhcm5pbmdzICYmIHdhcm5pbmdzQ291bnQgIT09IDApIHtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KCfimqAgIFRoZSBmb2xsb3dpbmcgaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQ6JykpO1xuICAgIEFycmF5LmZyb20oYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMpXG4gICAgICAgIC5zb3J0KClcbiAgICAgICAgLmZvckVhY2goc3BlY2lmaWVyID0+IGNvbnNvbGUuaW5mbyhgICDigKIgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIGFuYWx5emVyLnVucmVzb2x2ZWRGaWxlcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBjb25zb2xlLmluZm8oYCAg4oCiICR7Z2V0UmVsYXRpdmVQYXRoKGJhc2VEaXIsIGtleSl9YCk7XG4gICAgICB2YWx1ZS5zb3J0KCkuZm9yRWFjaChzcGVjaWZpZXIgPT4gY29uc29sZS5pbmZvKGAgICAgICAke3NwZWNpZmllcn1gKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhg4pqgICAke3dhcm5pbmdzQ291bnR9IGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkLmApKTtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KGAgICBQbGVhc2UgcmVydW4gd2l0aCBcIi0td2FybmluZ3NcIiB0byBpbnNwZWN0IHVucmVzb2x2ZWQgaW1wb3J0cy5gKSk7XG4gIH1cblxuICBjb25zdCBleHBlY3RlZDogR29sZGVuID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoZ29sZGVuRmlsZSwgJ3V0ZjgnKSk7XG4gIGNvbnN0IHtmaXhlZENpcmN1bGFyRGVwcywgbmV3Q2lyY3VsYXJEZXBzfSA9IGNvbXBhcmVHb2xkZW5zKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICBjb25zdCBpc01hdGNoaW5nID0gZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwICYmIG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggPT09IDA7XG5cbiAgaWYgKGlzTWF0Y2hpbmcpIHtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oJ+KchSAgR29sZGVuIG1hdGNoZXMgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ+KdjCAgR29sZGVuIGRvZXMgbm90IG1hdGNoIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgaWYgKG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnllbGxvdyhgICAgTmV3IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB3aGljaCBhcmUgbm90IGFsbG93ZWQ6YCkpO1xuICAgIG5ld0NpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gY29uc29sZS5lcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgY29uc29sZS5lcnJvcigpO1xuICB9XG4gIGlmIChmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay55ZWxsb3coYCAgIEZpeGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBnb2xkZW46YCkpO1xuICAgIGZpeGVkQ2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBjb25zb2xlLmVycm9yKGAgICAgIOKAoiAke2NvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGMpfWApKTtcbiAgICBjb25zb2xlLmVycm9yKCk7XG4gICAgaWYgKGFwcHJvdmVDb21tYW5kKSB7XG4gICAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KGAgICBQbGVhc2UgYXBwcm92ZSB0aGUgbmV3IGdvbGRlbiB3aXRoOiAke2FwcHJvdmVDb21tYW5kfWApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhcbiAgICAgICAgICBgICAgUGxlYXNlIHVwZGF0ZSB0aGUgZ29sZGVuLiBUaGUgZm9sbG93aW5nIGNvbW1hbmQgY2FuIGJlIGAgK1xuICAgICAgICAgIGBydW46IHlhcm4gdHMtY2lyY3VsYXItZGVwcyBhcHByb3ZlICR7Z2V0UmVsYXRpdmVQYXRoKHByb2Nlc3MuY3dkKCksIGdvbGRlbkZpbGUpfS5gKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiAxO1xufVxuXG4vKiogR2V0cyB0aGUgc3BlY2lmaWVkIHBhdGggcmVsYXRpdmUgdG8gdGhlIGJhc2UgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGJhc2VEaXI6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIHBhdGgpKTtcbn1cblxuLyoqIENvbnZlcnRzIHRoZSBnaXZlbiByZWZlcmVuY2UgY2hhaW4gdG8gaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbi4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGNoYWluOiBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+KSB7XG4gIHJldHVybiBjaGFpbi5qb2luKCcg4oaSICcpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=