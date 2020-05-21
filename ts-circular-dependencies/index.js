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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQTJEO0lBQzNELDZCQUFzQztJQUN0Qyw2QkFBbUQ7SUFFbkQsNkJBQStCO0lBRS9CLG9FQUFpRTtJQUVqRSx5RkFBb0Q7SUFDcEQscUZBQStFO0lBQy9FLCtGQUF3RDtJQUN4RCxxRkFBd0U7SUFHeEUsU0FBZ0IsNkJBQTZCLENBQUMsVUFBc0I7UUFDbEUsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FDSCxRQUFRLEVBQ1IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGlDQUFpQyxFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFDLENBQUM7YUFDMUUsT0FBTyxDQUNKLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxFQUFFLEVBQ2hFLFVBQUMsSUFBcUI7WUFDYixJQUFRLFNBQVMsR0FBYyxJQUFJLE9BQWxCLEVBQUUsUUFBUSxHQUFJLElBQUksU0FBUixDQUFTO1lBQzNDLElBQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFD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IS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtpc0Fic29sdXRlLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgZXJyb3IsIHJlZCwgeWVsbG93fSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtBbmFseXplciwgUmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtjb21wYXJlR29sZGVucywgY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4sIEdvbGRlbn0gZnJvbSAnLi9nb2xkZW4nO1xuaW1wb3J0IHtjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNofSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7bG9hZFRlc3RDb25maWcsIENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAub3B0aW9uKFxuICAgICAgICAgICdjb25maWcnLFxuICAgICAgICAgIHt0eXBlOiAnc3RyaW5nJywgZGVtYW5kT3B0aW9uOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS4nfSlcbiAgICAgIC5vcHRpb24oJ3dhcm5pbmdzJywge3R5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdQcmludHMgYWxsIHdhcm5pbmdzLid9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2NoZWNrJywgJ0NoZWNrcyBpZiB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGhhdmUgY2hhbmdlZC4nLCB7fSxcbiAgICAgICAgICAoYXJndjogeWFyZ3MuQXJndW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQobWFpbihmYWxzZSwgY29uZmlnLCB3YXJuaW5ncykpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYXBwcm92ZScsICdBcHByb3ZlcyB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJywge30sIChhcmd2OiB5YXJncy5Bcmd1bWVudHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID0gYXJndjtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChtYWluKHRydWUsIGNvbmZpZywgd2FybmluZ3MpKTtcbiAgICAgICAgICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSB0cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMgdG9vbC5cbiAqIEBwYXJhbSBhcHByb3ZlIFdoZXRoZXIgdGhlIGRldGVjdGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBzaG91bGQgYmUgYXBwcm92ZWQuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0ZXN0LlxuICogQHBhcmFtIHByaW50V2FybmluZ3MgV2hldGhlciB3YXJuaW5ncyBzaG91bGQgYmUgcHJpbnRlZCBvdXQuXG4gKiBAcmV0dXJucyBTdGF0dXMgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW4oXG4gICAgYXBwcm92ZTogYm9vbGVhbiwgY29uZmlnOiBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcsIHByaW50V2FybmluZ3M6IGJvb2xlYW4pOiBudW1iZXIge1xuICBjb25zdCB7YmFzZURpciwgZ29sZGVuRmlsZSwgZ2xvYiwgcmVzb2x2ZU1vZHVsZSwgYXBwcm92ZUNvbW1hbmR9ID0gY29uZmlnO1xuICBjb25zdCBhbmFseXplciA9IG5ldyBBbmFseXplcihyZXNvbHZlTW9kdWxlKTtcbiAgY29uc3QgY3ljbGVzOiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gIGNvbnN0IGNoZWNrZWROb2RlcyA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgZ2xvYlN5bmMoZ2xvYiwge2Fic29sdXRlOiB0cnVlfSkuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGFuYWx5emVyLmdldFNvdXJjZUZpbGUoZmlsZVBhdGgpO1xuICAgIGN5Y2xlcy5wdXNoKC4uLmFuYWx5emVyLmZpbmRDeWNsZXMoc291cmNlRmlsZSwgY2hlY2tlZE5vZGVzKSk7XG4gIH0pO1xuXG4gIGNvbnN0IGFjdHVhbCA9IGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuKGN5Y2xlcywgYmFzZURpcik7XG5cbiAgaW5mbyhncmVlbihgICAgQ3VycmVudCBudW1iZXIgb2YgY3ljbGVzOiAke3llbGxvdyhjeWNsZXMubGVuZ3RoLnRvU3RyaW5nKCkpfWApKTtcblxuICBpZiAoYXBwcm92ZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZ29sZGVuRmlsZSwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsLCBudWxsLCAyKSk7XG4gICAgaW5mbyhncmVlbign4pyFICBVcGRhdGVkIGdvbGRlbiBmaWxlLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmICghZXhpc3RzU3luYyhnb2xkZW5GaWxlKSkge1xuICAgIGVycm9yKHJlZChg4p2MICBDb3VsZCBub3QgZmluZCBnb2xkZW4gZmlsZTogJHtnb2xkZW5GaWxlfWApKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IHdhcm5pbmdzQ291bnQgPSBhbmFseXplci51bnJlc29sdmVkRmlsZXMuc2l6ZSArIGFuYWx5emVyLnVucmVzb2x2ZWRNb2R1bGVzLnNpemU7XG5cbiAgLy8gQnkgZGVmYXVsdCwgd2FybmluZ3MgZm9yIHVucmVzb2x2ZWQgZmlsZXMgb3IgbW9kdWxlcyBhcmUgbm90IHByaW50ZWQuIFRoaXMgaXMgYmVjYXVzZVxuICAvLyBpdCdzIGNvbW1vbiB0aGF0IHRoaXJkLXBhcnR5IG1vZHVsZXMgYXJlIG5vdCByZXNvbHZlZC92aXNpdGVkLiBBbHNvIGdlbmVyYXRlZCBmaWxlc1xuICAvLyBmcm9tIHRoZSBWaWV3IEVuZ2luZSBjb21waWxlciAoaS5lLiBmYWN0b3JpZXMsIHN1bW1hcmllcykgY2Fubm90IGJlIHJlc29sdmVkLlxuICBpZiAocHJpbnRXYXJuaW5ncyAmJiB3YXJuaW5nc0NvdW50ICE9PSAwKSB7XG4gICAgaW5mbyh5ZWxsb3coJ+KaoCAgVGhlIGZvbGxvd2luZyBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZDonKSk7XG4gICAgQXJyYXkuZnJvbShhbmFseXplci51bnJlc29sdmVkTW9kdWxlcykuc29ydCgpLmZvckVhY2goc3BlY2lmaWVyID0+IGluZm8oYCAg4oCiICR7c3BlY2lmaWVyfWApKTtcbiAgICBhbmFseXplci51bnJlc29sdmVkRmlsZXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgaW5mbyhgICDigKIgJHtnZXRSZWxhdGl2ZVBhdGgoYmFzZURpciwga2V5KX1gKTtcbiAgICAgIHZhbHVlLnNvcnQoKS5mb3JFYWNoKHNwZWNpZmllciA9PiBpbmZvKGAgICAgICAke3NwZWNpZmllcn1gKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyh5ZWxsb3coYOKaoCAgJHt3YXJuaW5nc0NvdW50fSBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5gKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgIFBsZWFzZSByZXJ1biB3aXRoIFwiLS13YXJuaW5nc1wiIHRvIGluc3BlY3QgdW5yZXNvbHZlZCBpbXBvcnRzLmApKTtcbiAgfVxuXG4gIGNvbnN0IGV4cGVjdGVkOiBHb2xkZW4gPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhnb2xkZW5GaWxlLCAndXRmOCcpKTtcbiAgY29uc3Qge2ZpeGVkQ2lyY3VsYXJEZXBzLCBuZXdDaXJjdWxhckRlcHN9ID0gY29tcGFyZUdvbGRlbnMoYWN0dWFsLCBleHBlY3RlZCk7XG4gIGNvbnN0IGlzTWF0Y2hpbmcgPSBmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggPT09IDAgJiYgbmV3Q2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMDtcblxuICBpZiAoaXNNYXRjaGluZykge1xuICAgIGluZm8oZ3JlZW4oJ+KchSAgR29sZGVuIG1hdGNoZXMgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZXJyb3IocmVkKCfinYwgIEdvbGRlbiBkb2VzIG5vdCBtYXRjaCBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gIGlmIChuZXdDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoeWVsbG93KGAgICBOZXcgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHdoaWNoIGFyZSBub3QgYWxsb3dlZDpgKSk7XG4gICAgbmV3Q2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBlcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgZXJyb3IoKTtcbiAgfVxuICBpZiAoZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoeWVsbG93KGAgICBGaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ29sZGVuOmApKTtcbiAgICBmaXhlZENpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGVycm9yKCk7XG4gICAgaWYgKGFwcHJvdmVDb21tYW5kKSB7XG4gICAgICBpbmZvKHllbGxvdyhgICAgUGxlYXNlIGFwcHJvdmUgdGhlIG5ldyBnb2xkZW4gd2l0aDogJHthcHByb3ZlQ29tbWFuZH1gKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZm8oeWVsbG93KFxuICAgICAgICAgIGAgICBQbGVhc2UgdXBkYXRlIHRoZSBnb2xkZW4uIFRoZSBmb2xsb3dpbmcgY29tbWFuZCBjYW4gYmUgYCArXG4gICAgICAgICAgYHJ1bjogeWFybiB0cy1jaXJjdWxhci1kZXBzIGFwcHJvdmUgJHtnZXRSZWxhdGl2ZVBhdGgocHJvY2Vzcy5jd2QoKSwgZ29sZGVuRmlsZSl9LmApKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59XG5cbi8qKiBHZXRzIHRoZSBzcGVjaWZpZWQgcGF0aCByZWxhdGl2ZSB0byB0aGUgYmFzZSBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoYmFzZURpcjogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgcGF0aCkpO1xufVxuXG4vKiogQ29udmVydHMgdGhlIGdpdmVuIHJlZmVyZW5jZSBjaGFpbiB0byBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiAqL1xuZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoY2hhaW46IFJlZmVyZW5jZUNoYWluPHN0cmluZz4pIHtcbiAgcmV0dXJuIGNoYWluLmpvaW4oJyDihpIgJyk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==