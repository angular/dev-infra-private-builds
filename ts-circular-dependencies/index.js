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
    if (require.main === module) {
        var _a = yargs.help()
            .strict()
            .command('check', 'Checks if the circular dependencies have changed.')
            .command('approve', 'Approves the current circular dependencies.')
            .demandCommand()
            .option('config', { type: 'string', demandOption: true, description: 'Path to the configuration file.' })
            .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
            .argv, command = _a._, configArg = _a.config, warnings = _a.warnings;
        var configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
        var config_2 = config_1.loadTestConfig(configPath);
        var isApprove = command.includes('approve');
        process.exit(main(isApprove, config_2, warnings));
    }
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
            analyzer.unresolvedModules.forEach(function (specifier) { return console.info("  \u2022 " + specifier); });
            analyzer.unresolvedFiles.forEach(function (value, key) {
                console.info("  \u2022 " + getRelativePath(baseDir, key));
                value.forEach(function (specifier) { return console.info("      " + specifier); });
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
        }
        if (fixedCircularDeps.length !== 0) {
            console.error(chalk_1.default.yellow("   Fixed circular dependencies that need to be removed from the golden:"));
            fixedCircularDeps.forEach(function (c) { return console.error("     \u2022 " + convertReferenceChainToString(c)); });
            console.info();
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkQ7SUFDM0QsNkJBQXNDO0lBQ3RDLDZCQUFtRDtJQUVuRCw2QkFBK0I7SUFDL0IsK0JBQTBCO0lBRTFCLHlGQUFvRDtJQUNwRCxxRkFBK0U7SUFDL0UsK0ZBQXdEO0lBQ3hELHFGQUF3RTtJQUV4RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQ3JCLElBQUE7Ozs7Ozs7aUJBVU8sRUFWTixjQUFVLEVBQUUscUJBQWlCLEVBQUUsc0JBVXpCLENBQUM7UUFDZCxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSxJQUFNLFFBQU0sR0FBRyx1QkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ2pEO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsSUFBSSxDQUNoQixPQUFnQixFQUFFLE1BQXNDLEVBQUUsYUFBc0I7UUFDM0UsSUFBQSx3QkFBTyxFQUFFLDhCQUFVLEVBQUUsa0JBQUksRUFBRSxvQ0FBYSxFQUFFLHNDQUFjLENBQVc7UUFDMUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdDLElBQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7UUFDcEMsSUFB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O1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBdkVELG9CQXVFQztJQUVELDhEQUE4RDtJQUM5RCxTQUFTLGVBQWUsQ0FBQyxPQUFlLEVBQUUsSUFBWTtRQUNwRCxPQUFPLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFNBQVMsNkJBQTZCLENBQUMsS0FBNkI7UUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtpc0Fic29sdXRlLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2xvYWRUZXN0Q29uZmlnLCBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWd9IGZyb20gJy4vY29uZmlnJztcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGNvbnN0IHtfOiBjb21tYW5kLCBjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID1cbiAgICAgIHlhcmdzLmhlbHAoKVxuICAgICAgICAgIC5zdHJpY3QoKVxuICAgICAgICAgIC5jb21tYW5kKCdjaGVjaycsICdDaGVja3MgaWYgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuJylcbiAgICAgICAgICAuY29tbWFuZCgnYXBwcm92ZScsICdBcHByb3ZlcyB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJylcbiAgICAgICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAgICAgLm9wdGlvbihcbiAgICAgICAgICAgICAgJ2NvbmZpZycsXG4gICAgICAgICAgICAgIHt0eXBlOiAnc3RyaW5nJywgZGVtYW5kT3B0aW9uOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS4nfSlcbiAgICAgICAgICAub3B0aW9uKCd3YXJuaW5ncycsIHt0eXBlOiAnYm9vbGVhbicsIGRlc2NyaXB0aW9uOiAnUHJpbnRzIGFsbCB3YXJuaW5ncy4nfSlcbiAgICAgICAgICAuYXJndjtcbiAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gIGNvbnN0IGlzQXBwcm92ZSA9IGNvbW1hbmQuaW5jbHVkZXMoJ2FwcHJvdmUnKTtcbiAgcHJvY2Vzcy5leGl0KG1haW4oaXNBcHByb3ZlLCBjb25maWcsIHdhcm5pbmdzKSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzIHRvb2wuXG4gKiBAcGFyYW0gYXBwcm92ZSBXaGV0aGVyIHRoZSBkZXRlY3RlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGFwcHJvdmVkLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGVzdC5cbiAqIEBwYXJhbSBwcmludFdhcm5pbmdzIFdoZXRoZXIgd2FybmluZ3Mgc2hvdWxkIGJlIHByaW50ZWQgb3V0LlxuICogQHJldHVybnMgU3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKFxuICAgIGFwcHJvdmU6IGJvb2xlYW4sIGNvbmZpZzogQ2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnLCBwcmludFdhcm5pbmdzOiBib29sZWFuKTogbnVtYmVyIHtcbiAgY29uc3Qge2Jhc2VEaXIsIGdvbGRlbkZpbGUsIGdsb2IsIHJlc29sdmVNb2R1bGUsIGFwcHJvdmVDb21tYW5kfSA9IGNvbmZpZztcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQW5hbHl6ZXIocmVzb2x2ZU1vZHVsZSk7XG4gIGNvbnN0IGN5Y2xlczogUmVmZXJlbmNlQ2hhaW5bXSA9IFtdO1xuICBjb25zdCBjaGVja2VkTm9kZXMgPSBuZXcgV2Vha1NldDx0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIGdsb2JTeW5jKGdsb2IsIHthYnNvbHV0ZTogdHJ1ZX0pLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBhbmFseXplci5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICBjeWNsZXMucHVzaCguLi5hbmFseXplci5maW5kQ3ljbGVzKHNvdXJjZUZpbGUsIGNoZWNrZWROb2RlcykpO1xuICB9KTtcblxuICBjb25zdCBhY3R1YWwgPSBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihjeWNsZXMsIGJhc2VEaXIpO1xuXG4gIGNvbnNvbGUuaW5mbyhcbiAgICAgIGNoYWxrLmdyZWVuKGAgICBDdXJyZW50IG51bWJlciBvZiBjeWNsZXM6ICR7Y2hhbGsueWVsbG93KGN5Y2xlcy5sZW5ndGgudG9TdHJpbmcoKSl9YCkpO1xuXG4gIGlmIChhcHByb3ZlKSB7XG4gICAgd3JpdGVGaWxlU3luYyhnb2xkZW5GaWxlLCBKU09OLnN0cmluZ2lmeShhY3R1YWwsIG51bGwsIDIpKTtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oJ+KchSAgVXBkYXRlZCBnb2xkZW4gZmlsZS4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIWV4aXN0c1N5bmMoZ29sZGVuRmlsZSkpIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChg4p2MICBDb3VsZCBub3QgZmluZCBnb2xkZW4gZmlsZTogJHtnb2xkZW5GaWxlfWApKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IHdhcm5pbmdzQ291bnQgPSBhbmFseXplci51bnJlc29sdmVkRmlsZXMuc2l6ZSArIGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzLnNpemU7XG5cbiAgLy8gQnkgZGVmYXVsdCwgd2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgZmlsZXMgb3IgbW9kdWxlcyBhcmUgbm90IHByaW50ZWQuIFRoaXMgaXMgYmVjYXVzZVxuICAvLyBpdCdzIGNvbW1vbiB0aGF0IHRoaXJkLXBhcnR5IG1vZHVsZXMgYXJlIG5vdCByZXNvbHZlZC92aXNpdGVkLiBBbHNvIGdlbmVyYXRlZCBmaWxlc1xuICAvLyBmcm9tIHRoZSBWaWV3IEVuZ2luZSBjb21waWxlciAoaS5lLiBmYWN0b3JpZXMsIHN1bW1hcmllcykgY2Fubm90IGJlIHJlc29sdmVkLlxuICBpZiAocHJpbnRXYXJuaW5ncyAmJiB3YXJuaW5nc0NvdW50ICE9PSAwKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdygn4pqgICBUaGUgZm9sbG93aW5nIGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkOicpKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5mb3JFYWNoKHNwZWNpZmllciA9PiBjb25zb2xlLmluZm8oYCAg4oCiICR7c3BlY2lmaWVyfWApKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkRmlsZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY29uc29sZS5pbmZvKGAgIOKAoiAke2dldFJlbGF0aXZlUGF0aChiYXNlRGlyLCBrZXkpfWApO1xuICAgICAgdmFsdWUuZm9yRWFjaChzcGVjaWZpZXIgPT4gY29uc29sZS5pbmZvKGAgICAgICAke3NwZWNpZmllcn1gKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhg4pqgICAke3dhcm5pbmdzQ291bnR9IGltcG9ydHMgY291bGQgbm90IGJlIHJlc29sdmVkLmApKTtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KGAgICBQbGVhc2UgcmVydW4gd2l0aCBcIi0td2FybmluZ3NcIiB0byBpbnNwZWN0IHVucmVzb2x2ZWQgaW1wb3J0cy5gKSk7XG4gIH1cblxuICBjb25zdCBleHBlY3RlZDogR29sZGVuID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoZ29sZGVuRmlsZSwgJ3V0ZjgnKSk7XG4gIGNvbnN0IHtmaXhlZENpcmN1bGFyRGVwcywgbmV3Q2lyY3VsYXJEZXBzfSA9IGNvbXBhcmVHb2xkZW5zKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICBjb25zdCBpc01hdGNoaW5nID0gZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwICYmIG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggPT09IDA7XG5cbiAgaWYgKGlzTWF0Y2hpbmcpIHtcbiAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oJ+KchSAgR29sZGVuIG1hdGNoZXMgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ+KdjCAgR29sZGVuIGRvZXMgbm90IG1hdGNoIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgaWYgKG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnllbGxvdyhgICAgTmV3IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB3aGljaCBhcmUgbm90IGFsbG93ZWQ6YCkpO1xuICAgIG5ld0NpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gY29uc29sZS5lcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gIH1cbiAgaWYgKGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGNoYWxrLnllbGxvdyhgICAgRml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIGdvbGRlbjpgKSk7XG4gICAgZml4ZWRDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGNvbnNvbGUuZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGNvbnNvbGUuaW5mbygpO1xuICAgIGlmIChhcHByb3ZlQ29tbWFuZCkge1xuICAgICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhgICAgUGxlYXNlIGFwcHJvdmUgdGhlIG5ldyBnb2xkZW4gd2l0aDogJHthcHByb3ZlQ29tbWFuZH1gKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coXG4gICAgICAgICAgYCAgIFBsZWFzZSB1cGRhdGUgdGhlIGdvbGRlbi4gVGhlIGZvbGxvd2luZyBjb21tYW5kIGNhbiBiZSBgICtcbiAgICAgICAgICBgcnVuOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHMgYXBwcm92ZSAke2dldFJlbGF0aXZlUGF0aChwcm9jZXNzLmN3ZCgpLCBnb2xkZW5GaWxlKX0uYCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMTtcbn1cblxuLyoqIEdldHMgdGhlIHNwZWNpZmllZCBwYXRoIHJlbGF0aXZlIHRvIHRoZSBiYXNlIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChiYXNlRGlyOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICByZXR1cm4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBwYXRoKSk7XG59XG5cbi8qKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gcmVmZXJlbmNlIGNoYWluIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uICovXG5mdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjaGFpbjogUmVmZXJlbmNlQ2hhaW48c3RyaW5nPikge1xuICByZXR1cm4gY2hhaW4uam9pbignIOKGkiAnKTtcbn1cbiJdfQ==