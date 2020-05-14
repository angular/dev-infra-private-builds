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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJEO0lBQzNELDZCQUFzQztJQUN0Qyw2QkFBbUQ7SUFFbkQsNkJBQStCO0lBQy9CLCtCQUEwQjtJQUUxQix5RkFBb0Q7SUFDcEQscUZBQStFO0lBQy9FLCtGQUF3RDtJQUN4RCxxRkFBd0U7SUFHeEUsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7UUFDbEUsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FDSCxRQUFRLEVBQ1IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGlDQUFpQyxFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFDLENBQUM7YUFDMUUsT0FBTyxDQUNKLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxFQUFFLEVBQ2hFLFVBQUMsSUFBcUI7WUFDYixJQUFRLFNBQVMsR0FBYyxJQUFJLE9BQWxCLEVBQUUsUUFBUSxHQUFJLElBQUksU0FBUixDQUFTO1lBQzNDLElBQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFD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LFNBQVMsZUFBZSxDQUFDLE9BQWUsRUFBRSxJQUFZO1FBQ3BELE9BQU8sdUNBQXlCLENBQUMsZUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCx1RUFBdUU7SUFDdkUsU0FBUyw2QkFBNkIsQ0FBQyxLQUE2QjtRQUNsRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtpc0Fic29sdXRlLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2xvYWRUZXN0Q29uZmlnLCBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWd9IGZyb20gJy4vY29uZmlnJztcblxuXG5leHBvcnQgZnVuY3Rpb24gdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLm9wdGlvbihcbiAgICAgICAgICAnY29uZmlnJyxcbiAgICAgICAgICB7dHlwZTogJ3N0cmluZycsIGRlbWFuZE9wdGlvbjogdHJ1ZSwgZGVzY3JpcHRpb246ICdQYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuJ30pXG4gICAgICAub3B0aW9uKCd3YXJuaW5ncycsIHt0eXBlOiAnYm9vbGVhbicsIGRlc2NyaXB0aW9uOiAnUHJpbnRzIGFsbCB3YXJuaW5ncy4nfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGVjaycsICdDaGVja3MgaWYgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuJywge30sXG4gICAgICAgICAgKGFyZ3Y6IHlhcmdzLkFyZ3VtZW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4oZmFsc2UsIGNvbmZpZywgd2FybmluZ3MpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FwcHJvdmUnLCAnQXBwcm92ZXMgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicsIHt9LCAoYXJndjogeWFyZ3MuQXJndW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQobWFpbih0cnVlLCBjb25maWcsIHdhcm5pbmdzKSk7XG4gICAgICAgICAgfSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzIHRvb2wuXG4gKiBAcGFyYW0gYXBwcm92ZSBXaGV0aGVyIHRoZSBkZXRlY3RlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGFwcHJvdmVkLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGVzdC5cbiAqIEBwYXJhbSBwcmludFdhcm5pbmdzIFdoZXRoZXIgd2FybmluZ3Mgc2hvdWxkIGJlIHByaW50ZWQgb3V0LlxuICogQHJldHVybnMgU3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKFxuICAgIGFwcHJvdmU6IGJvb2xlYW4sIGNvbmZpZzogQ2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnLCBwcmludFdhcm5pbmdzOiBib29sZWFuKTogbnVtYmVyIHtcbiAgY29uc3Qge2Jhc2VEaXIsIGdvbGRlbkZpbGUsIGdsb2IsIHJlc29sdmVNb2R1bGUsIGFwcHJvdmVDb21tYW5kfSA9IGNvbmZpZztcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQW5hbHl6ZXIocmVzb2x2ZU1vZHVsZSk7XG4gIGNvbnN0IGN5Y2xlczogUmVmZXJlbmNlQ2hhaW5bXSA9IFtdO1xuICBjb25zdCBjaGVja2VkTm9kZXMgPSBuZXcgV2Vha1NldDx0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIGdsb2JTeW5jKGdsb2IsIHthYnNvbHV0ZTogdHJ1ZX0pLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBhbmFseXplci5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICBjeWNsZXMucHVzaCguLi5hbmFseXplci5maW5kQ3ljbGVzKHNvdXJjZUZpbGUsIGNoZWNrZWROb2RlcykpO1xuICB9KTtcblxuICBjb25zdCBhY3R1YWwgPSBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihjeWNsZXMsIGJhc2VEaXIpO1xuXG4gIGNvbnNvbGUuaW5mbyhcbiAgICAgIGNoYWxrLmdyZWVuKGAgICBDdXJyZW50IG51bWJlciBvZiBjeWNsZXM6ICR7Y2hhbGsueWVsbG93KGN5Y2xlcy5sZW5ndGgudG9TdHJpbmcoKSl9YCkpO1xuXG4gIGlmIChhcHByb3ZlKSB7XG4gICAgd3JpdGVGaWxlU3luYyhnb2xkZW5GaWxlLCBKU09OLnN0cmluZ2lmeShhY3R1YWwsIG51bGwsIDIpKTtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oJ+KchSAgVXBkYXRlZCBnb2xkZW4gZmlsZS4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIWV4aXN0c1N5bmMoZ29sZGVuRmlsZSkpIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChg4p2MICBDb3VsZCBub3QgZmluZCBnb2xkZW4gZmlsZTogJHtnb2xkZW5GaWxlfWApKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IHdhcm5pbmdzQ291bnQgPSBhbmFseXplci51bnJlc29sdmVkRmlsZXMuc2l6ZSArIGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzLnNpemU7XG5cbiAgLy8gQnkgZGVmYXVsdCwgd2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgZmlsZXMgb3IgbW9kdWxlcyBhcmUgbm90IHByaW50ZWQuIFRoaXMgaXMgYmVjYXVzZVxuICAvLyBpdCdzIGNvbW1vbiB0aGF0IHRoaXJkLXBhcnR5IG1vZHVsZXMgYXJlIG5vdCByZXNvbHZlZC92aXNpdGVkLiBBbHNvIGdlbmVyYXRlZCBmaWxlc1xuICAvLyBmcm9tIHRoZSBWaWV3IEVuZ2luZSBjb21waWxlciAoaS5lLiBmYWN0b3JpZXMsIHN1bW1hcmllcykgY2Fubm90IGJlIHJlc29sdmVkLlxuICBpZiAocHJpbnRXYXJuaW5ncyAmJiB3YXJuaW5nc0NvdW50ICE9PSAwKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdygn4pqgICBUaGUgZm9sbG93aW5nIGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkOicpKTtcbiAgICBBcnJheS5mcm9tKGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzKVxuICAgICAgICAuc29ydCgpXG4gICAgICAgIC5mb3JFYWNoKHNwZWNpZmllciA9PiBjb25zb2xlLmluZm8oYCAg4oCiICR7c3BlY2lmaWVyfWApKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkRmlsZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY29uc29sZS5pbmZvKGAgIOKAoiAke2dldFJlbGF0aXZlUGF0aChiYXNlRGlyLCBrZXkpfWApO1xuICAgICAgdmFsdWUuc29ydCgpLmZvckVhY2goc3BlY2lmaWVyID0+IGNvbnNvbGUuaW5mbyhgICAgICAgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coYOKaoCAgJHt3YXJuaW5nc0NvdW50fSBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5gKSk7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhgICAgUGxlYXNlIHJlcnVuIHdpdGggXCItLXdhcm5pbmdzXCIgdG8gaW5zcGVjdCB1bnJlc29sdmVkIGltcG9ydHMuYCkpO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWQ6IEdvbGRlbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGdvbGRlbkZpbGUsICd1dGY4JykpO1xuICBjb25zdCB7Zml4ZWRDaXJjdWxhckRlcHMsIG5ld0NpcmN1bGFyRGVwc30gPSBjb21wYXJlR29sZGVucyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgY29uc3QgaXNNYXRjaGluZyA9IGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMCAmJiBuZXdDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwO1xuXG4gIGlmIChpc01hdGNoaW5nKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKCfinIUgIEdvbGRlbiBtYXRjaGVzIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCfinYwgIEdvbGRlbiBkb2VzIG5vdCBtYXRjaCBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gIGlmIChuZXdDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYCAgIE5ldyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgd2hpY2ggYXJlIG5vdCBhbGxvd2VkOmApKTtcbiAgICBuZXdDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGNvbnNvbGUuZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGNvbnNvbGUuZXJyb3IoKTtcbiAgfVxuICBpZiAoZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgY2hhbGsueWVsbG93KGAgICBGaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ29sZGVuOmApKTtcbiAgICBmaXhlZENpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gY29uc29sZS5lcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgY29uc29sZS5lcnJvcigpO1xuICAgIGlmIChhcHByb3ZlQ29tbWFuZCkge1xuICAgICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhgICAgUGxlYXNlIGFwcHJvdmUgdGhlIG5ldyBnb2xkZW4gd2l0aDogJHthcHByb3ZlQ29tbWFuZH1gKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coXG4gICAgICAgICAgYCAgIFBsZWFzZSB1cGRhdGUgdGhlIGdvbGRlbi4gVGhlIGZvbGxvd2luZyBjb21tYW5kIGNhbiBiZSBgICtcbiAgICAgICAgICBgcnVuOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHMgYXBwcm92ZSAke2dldFJlbGF0aXZlUGF0aChwcm9jZXNzLmN3ZCgpLCBnb2xkZW5GaWxlKX0uYCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMTtcbn1cblxuLyoqIEdldHMgdGhlIHNwZWNpZmllZCBwYXRoIHJlbGF0aXZlIHRvIHRoZSBiYXNlIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChiYXNlRGlyOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICByZXR1cm4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBwYXRoKSk7XG59XG5cbi8qKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gcmVmZXJlbmNlIGNoYWluIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uICovXG5mdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjaGFpbjogUmVmZXJlbmNlQ2hhaW48c3RyaW5nPikge1xuICByZXR1cm4gY2hhaW4uam9pbignIOKGkiAnKTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19