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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkQ7SUFDM0QsNkJBQXNDO0lBQ3RDLDZCQUFtRDtJQUVuRCw2QkFBK0I7SUFFL0Isb0VBQWlFO0lBRWpFLHlGQUFvRDtJQUNwRCxxRkFBK0U7SUFDL0UsK0ZBQXdEO0lBQ3hELHFGQUF3RTtJQUd4RSxTQUFnQiw2QkFBNkIsQ0FBQyxVQUFzQjtRQUNsRSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFO2FBQ2YsTUFBTSxDQUNILFFBQVEsRUFDUixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsaUNBQWlDLEVBQUMsQ0FBQzthQUN4RixNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUMsQ0FBQzthQUMxRSxPQUFPLENBQ0osT0FBTyxFQUFFLG1EQUFtRCxFQUFFLEVBQUUsRUFDaEUsVUFBQyxJQUFxQjtZQUNiLElBQUEsdUJBQWlCLEVBQUUsd0JBQVEsQ0FBUztZQUMzQyxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFNLE1BQU0sR0FBRyx1QkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUM7YUFDTCxPQUFPLENB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LGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBVSw2QkFBNkIsQ0FBQyxDQUFDLENBQUcsQ0FBQyxFQUFuRCxDQUFtRCxDQUFDLENBQUM7WUFDcEYsZUFBSyxFQUFFLENBQUM7WUFDUixJQUFJLGNBQWMsRUFBRTtnQkFDbEIsY0FBSSxDQUFDLGdCQUFNLENBQUMsNENBQTBDLGNBQWdCLENBQUMsQ0FBQyxDQUFDO2FBQzFFO2lCQUFNO2dCQUNMLGNBQUksQ0FBQyxnQkFBTSxDQUNQLDREQUE0RDtxQkFDNUQsd0NBQXNDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsVUFBVSxDQUFDLE1BQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQzthQUMzRjtTQUNGO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBdEVELG9CQXNFQztJQUVELDhEQUE4RDtJQUM5RCxTQUFTLGVBQWUsQ0FBQyxPQUFlLEVBQUUsSUFBWTtRQUNwRCxPQUFPLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFNBQVMsNkJBQTZCLENBQUMsS0FBNkI7UUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzlDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtzeW5jIGFzIGdsb2JTeW5jfSBmcm9tICdnbG9iJztcbmltcG9ydCB7aXNBYnNvbHV0ZSwgcmVsYXRpdmUsIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z3JlZW4sIGluZm8sIGVycm9yLCByZWQsIHllbGxvd30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7QW5hbHl6ZXIsIFJlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29tcGFyZUdvbGRlbnMsIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuLCBHb2xkZW59IGZyb20gJy4vZ29sZGVuJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2xvYWRUZXN0Q29uZmlnLCBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWd9IGZyb20gJy4vY29uZmlnJztcblxuXG5leHBvcnQgZnVuY3Rpb24gdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLm9wdGlvbihcbiAgICAgICAgICAnY29uZmlnJyxcbiAgICAgICAgICB7dHlwZTogJ3N0cmluZycsIGRlbWFuZE9wdGlvbjogdHJ1ZSwgZGVzY3JpcHRpb246ICdQYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuJ30pXG4gICAgICAub3B0aW9uKCd3YXJuaW5ncycsIHt0eXBlOiAnYm9vbGVhbicsIGRlc2NyaXB0aW9uOiAnUHJpbnRzIGFsbCB3YXJuaW5ncy4nfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGVjaycsICdDaGVja3MgaWYgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBoYXZlIGNoYW5nZWQuJywge30sXG4gICAgICAgICAgKGFyZ3Y6IHlhcmdzLkFyZ3VtZW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4oZmFsc2UsIGNvbmZpZywgd2FybmluZ3MpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FwcHJvdmUnLCAnQXBwcm92ZXMgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicsIHt9LCAoYXJndjogeWFyZ3MuQXJndW1lbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQobWFpbih0cnVlLCBjb25maWcsIHdhcm5pbmdzKSk7XG4gICAgICAgICAgfSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzIHRvb2wuXG4gKiBAcGFyYW0gYXBwcm92ZSBXaGV0aGVyIHRoZSBkZXRlY3RlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgc2hvdWxkIGJlIGFwcHJvdmVkLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGVzdC5cbiAqIEBwYXJhbSBwcmludFdhcm5pbmdzIFdoZXRoZXIgd2FybmluZ3Mgc2hvdWxkIGJlIHByaW50ZWQgb3V0LlxuICogQHJldHVybnMgU3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWluKFxuICAgIGFwcHJvdmU6IGJvb2xlYW4sIGNvbmZpZzogQ2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnLCBwcmludFdhcm5pbmdzOiBib29sZWFuKTogbnVtYmVyIHtcbiAgY29uc3Qge2Jhc2VEaXIsIGdvbGRlbkZpbGUsIGdsb2IsIHJlc29sdmVNb2R1bGUsIGFwcHJvdmVDb21tYW5kfSA9IGNvbmZpZztcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQW5hbHl6ZXIocmVzb2x2ZU1vZHVsZSk7XG4gIGNvbnN0IGN5Y2xlczogUmVmZXJlbmNlQ2hhaW5bXSA9IFtdO1xuICBjb25zdCBjaGVja2VkTm9kZXMgPSBuZXcgV2Vha1NldDx0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIGdsb2JTeW5jKGdsb2IsIHthYnNvbHV0ZTogdHJ1ZX0pLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBhbmFseXplci5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICBjeWNsZXMucHVzaCguLi5hbmFseXplci5maW5kQ3ljbGVzKHNvdXJjZUZpbGUsIGNoZWNrZWROb2RlcykpO1xuICB9KTtcblxuICBjb25zdCBhY3R1YWwgPSBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihjeWNsZXMsIGJhc2VEaXIpO1xuXG4gIGluZm8oZ3JlZW4oYCAgIEN1cnJlbnQgbnVtYmVyIG9mIGN5Y2xlczogJHt5ZWxsb3coY3ljbGVzLmxlbmd0aC50b1N0cmluZygpKX1gKSk7XG5cbiAgaWYgKGFwcHJvdmUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGdvbGRlbkZpbGUsIEpTT04uc3RyaW5naWZ5KGFjdHVhbCwgbnVsbCwgMikpO1xuICAgIGluZm8oZ3JlZW4oJ+KchSAgVXBkYXRlZCBnb2xkZW4gZmlsZS4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIWV4aXN0c1N5bmMoZ29sZGVuRmlsZSkpIHtcbiAgICBlcnJvcihyZWQoYOKdjCAgQ291bGQgbm90IGZpbmQgZ29sZGVuIGZpbGU6ICR7Z29sZGVuRmlsZX1gKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nc0NvdW50ID0gYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLnNpemUgKyBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5zaXplO1xuXG4gIC8vIEJ5IGRlZmF1bHQsIHdhcm5pbmdzIGZvciB1bnJlc29sdmVkIGZpbGVzIG9yIG1vZHVsZXMgYXJlIG5vdCBwcmludGVkLiBUaGlzIGlzIGJlY2F1c2VcbiAgLy8gaXQncyBjb21tb24gdGhhdCB0aGlyZC1wYXJ0eSBtb2R1bGVzIGFyZSBub3QgcmVzb2x2ZWQvdmlzaXRlZC4gQWxzbyBnZW5lcmF0ZWQgZmlsZXNcbiAgLy8gZnJvbSB0aGUgVmlldyBFbmdpbmUgY29tcGlsZXIgKGkuZS4gZmFjdG9yaWVzLCBzdW1tYXJpZXMpIGNhbm5vdCBiZSByZXNvbHZlZC5cbiAgaWYgKHByaW50V2FybmluZ3MgJiYgd2FybmluZ3NDb3VudCAhPT0gMCkge1xuICAgIGluZm8oeWVsbG93KCfimqAgIFRoZSBmb2xsb3dpbmcgaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQ6JykpO1xuICAgIEFycmF5LmZyb20oYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMpLnNvcnQoKS5mb3JFYWNoKHNwZWNpZmllciA9PiBpbmZvKGAgIOKAoiAke3NwZWNpZmllcn1gKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7Z2V0UmVsYXRpdmVQYXRoKGJhc2VEaXIsIGtleSl9YCk7XG4gICAgICB2YWx1ZS5zb3J0KCkuZm9yRWFjaChzcGVjaWZpZXIgPT4gaW5mbyhgICAgICAgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGluZm8oeWVsbG93KGDimqAgICR7d2FybmluZ3NDb3VudH0gaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQuYCkpO1xuICAgIGluZm8oeWVsbG93KGAgICBQbGVhc2UgcmVydW4gd2l0aCBcIi0td2FybmluZ3NcIiB0byBpbnNwZWN0IHVucmVzb2x2ZWQgaW1wb3J0cy5gKSk7XG4gIH1cblxuICBjb25zdCBleHBlY3RlZDogR29sZGVuID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoZ29sZGVuRmlsZSwgJ3V0ZjgnKSk7XG4gIGNvbnN0IHtmaXhlZENpcmN1bGFyRGVwcywgbmV3Q2lyY3VsYXJEZXBzfSA9IGNvbXBhcmVHb2xkZW5zKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICBjb25zdCBpc01hdGNoaW5nID0gZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwICYmIG5ld0NpcmN1bGFyRGVwcy5sZW5ndGggPT09IDA7XG5cbiAgaWYgKGlzTWF0Y2hpbmcpIHtcbiAgICBpbmZvKGdyZWVuKCfinIUgIEdvbGRlbiBtYXRjaGVzIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGVycm9yKHJlZCgn4p2MICBHb2xkZW4gZG9lcyBub3QgbWF0Y2ggY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICBpZiAobmV3Q2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHllbGxvdyhgICAgTmV3IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB3aGljaCBhcmUgbm90IGFsbG93ZWQ6YCkpO1xuICAgIG5ld0NpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGVycm9yKCk7XG4gIH1cbiAgaWYgKGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHllbGxvdyhgICAgRml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIGdvbGRlbjpgKSk7XG4gICAgZml4ZWRDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGVycm9yKGAgICAgIOKAoiAke2NvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGMpfWApKTtcbiAgICBlcnJvcigpO1xuICAgIGlmIChhcHByb3ZlQ29tbWFuZCkge1xuICAgICAgaW5mbyh5ZWxsb3coYCAgIFBsZWFzZSBhcHByb3ZlIHRoZSBuZXcgZ29sZGVuIHdpdGg6ICR7YXBwcm92ZUNvbW1hbmR9YCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgICBgICAgUGxlYXNlIHVwZGF0ZSB0aGUgZ29sZGVuLiBUaGUgZm9sbG93aW5nIGNvbW1hbmQgY2FuIGJlIGAgK1xuICAgICAgICAgIGBydW46IHlhcm4gdHMtY2lyY3VsYXItZGVwcyBhcHByb3ZlICR7Z2V0UmVsYXRpdmVQYXRoKHByb2Nlc3MuY3dkKCksIGdvbGRlbkZpbGUpfS5gKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiAxO1xufVxuXG4vKiogR2V0cyB0aGUgc3BlY2lmaWVkIHBhdGggcmVsYXRpdmUgdG8gdGhlIGJhc2UgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGJhc2VEaXI6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIHBhdGgpKTtcbn1cblxuLyoqIENvbnZlcnRzIHRoZSBnaXZlbiByZWZlcmVuY2UgY2hhaW4gdG8gaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbi4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGNoYWluOiBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+KSB7XG4gIHJldHVybiBjaGFpbi5qb2luKCcg4oaSICcpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=