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
        define("@angular/dev-infra-private/ts-circular-dependencies", ["require", "exports", "tslib", "fs", "glob", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/ts-circular-dependencies/analyzer", "@angular/dev-infra-private/ts-circular-dependencies/config", "@angular/dev-infra-private/ts-circular-dependencies/file_system", "@angular/dev-infra-private/ts-circular-dependencies/golden"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = exports.tsCircularDependenciesBuilder = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var glob_1 = require("glob");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var analyzer_1 = require("@angular/dev-infra-private/ts-circular-dependencies/analyzer");
    var config_1 = require("@angular/dev-infra-private/ts-circular-dependencies/config");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    var golden_1 = require("@angular/dev-infra-private/ts-circular-dependencies/golden");
    function tsCircularDependenciesBuilder(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .option('config', { type: 'string', demandOption: true, description: 'Path to the configuration file.' })
            .option('warnings', { type: 'boolean', description: 'Prints all warnings.' })
            .command('check', 'Checks if the circular dependencies have changed.', function (args) { return args; }, function (argv) {
            var configArg = argv.config, warnings = argv.warnings;
            var configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
            var config = config_1.loadTestConfig(configPath);
            process.exit(main(false, config, !!warnings));
        })
            .command('approve', 'Approves the current circular dependencies.', function (args) { return args; }, function (argv) {
            var configArg = argv.config, warnings = argv.warnings;
            var configPath = path_1.isAbsolute(configArg) ? configArg : path_1.resolve(configArg);
            var config = config_1.loadTestConfig(configPath);
            process.exit(main(true, config, !!warnings));
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
        glob_1.sync(glob, { absolute: true, ignore: ['**/node_modules/**'] }).forEach(function (filePath) {
            var sourceFile = analyzer.getSourceFile(filePath);
            cycles.push.apply(cycles, tslib_1.__spreadArray([], tslib_1.__read(analyzer.findCycles(sourceFile, checkedNodes))));
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
            console_1.info(console_1.yellow("\n   Total: " + newCircularDeps.length + " new cycle(s), " + fixedCircularDeps.length + " fixed cycle(s). \n"));
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkQ7SUFDM0QsNkJBQXNDO0lBQ3RDLDZCQUFtRDtJQUluRCxvRUFBaUU7SUFFakUseUZBQW9EO0lBQ3BELHFGQUF3RTtJQUN4RSwrRkFBd0Q7SUFDeEQscUZBQStFO0lBRy9FLFNBQWdCLDZCQUE2QixDQUFDLFVBQXNCO1FBQ2xFLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixNQUFNLENBQ0gsUUFBUSxFQUNSLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxpQ0FBaUMsRUFBQyxDQUFDO2FBQ3hGLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBQyxDQUFDO2FBQzFFLE9BQU8sQ0FDSixPQUFPLEVBQUUsbURBQW1ELEVBQUUsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEVBQUosQ0FBSSxFQUMxRSxVQUFBLElBQUk7WUFDSyxJQUFRLFNBQVMsR0FBYyxJQUFJLE9BQWxCLEVBQUUsUUFBUSxHQUFJLElBQUksU0FBUixDQUFTO1lBQzNDLElBQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFD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Q2xFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3N5bmMgYXMgZ2xvYlN5bmN9IGZyb20gJ2dsb2InO1xuaW1wb3J0IHtpc0Fic29sdXRlLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtBbmFseXplciwgUmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcsIGxvYWRUZXN0Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtjb21wYXJlR29sZGVucywgY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4sIEdvbGRlbn0gZnJvbSAnLi9nb2xkZW4nO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAub3B0aW9uKFxuICAgICAgICAgICdjb25maWcnLFxuICAgICAgICAgIHt0eXBlOiAnc3RyaW5nJywgZGVtYW5kT3B0aW9uOiB0cnVlLCBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS4nfSlcbiAgICAgIC5vcHRpb24oJ3dhcm5pbmdzJywge3R5cGU6ICdib29sZWFuJywgZGVzY3JpcHRpb246ICdQcmludHMgYWxsIHdhcm5pbmdzLid9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2NoZWNrJywgJ0NoZWNrcyBpZiB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGhhdmUgY2hhbmdlZC4nLCBhcmdzID0+IGFyZ3MsXG4gICAgICAgICAgYXJndiA9PiB7XG4gICAgICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgICAgICBjb25zdCBjb25maWdQYXRoID0gaXNBYnNvbHV0ZShjb25maWdBcmcpID8gY29uZmlnQXJnIDogcmVzb2x2ZShjb25maWdBcmcpO1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gbG9hZFRlc3RDb25maWcoY29uZmlnUGF0aCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQobWFpbihmYWxzZSwgY29uZmlnLCAhIXdhcm5pbmdzKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKCdhcHByb3ZlJywgJ0FwcHJvdmVzIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nLCBhcmdzID0+IGFyZ3MsIGFyZ3YgPT4ge1xuICAgICAgICBjb25zdCB7Y29uZmlnOiBjb25maWdBcmcsIHdhcm5pbmdzfSA9IGFyZ3Y7XG4gICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICBwcm9jZXNzLmV4aXQobWFpbih0cnVlLCBjb25maWcsICEhd2FybmluZ3MpKTtcbiAgICAgIH0pO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhlIHRzLWNpcmN1bGFyLWRlcGVuZGVuY2llcyB0b29sLlxuICogQHBhcmFtIGFwcHJvdmUgV2hldGhlciB0aGUgZGV0ZWN0ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBhcHByb3ZlZC5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuXG4gKiBAcGFyYW0gcHJpbnRXYXJuaW5ncyBXaGV0aGVyIHdhcm5pbmdzIHNob3VsZCBiZSBwcmludGVkIG91dC5cbiAqIEByZXR1cm5zIFN0YXR1cyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgICBhcHByb3ZlOiBib29sZWFuLCBjb25maWc6IENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZywgcHJpbnRXYXJuaW5nczogYm9vbGVhbik6IG51bWJlciB7XG4gIGNvbnN0IHtiYXNlRGlyLCBnb2xkZW5GaWxlLCBnbG9iLCByZXNvbHZlTW9kdWxlLCBhcHByb3ZlQ29tbWFuZH0gPSBjb25maWc7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IEFuYWx5emVyKHJlc29sdmVNb2R1bGUpO1xuICBjb25zdCBjeWNsZXM6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgY29uc3QgY2hlY2tlZE5vZGVzID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBnbG9iU3luYyhnbG9iLCB7YWJzb2x1dGU6IHRydWUsIGlnbm9yZTogWycqKi9ub2RlX21vZHVsZXMvKionXX0pLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBhbmFseXplci5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICBjeWNsZXMucHVzaCguLi5hbmFseXplci5maW5kQ3ljbGVzKHNvdXJjZUZpbGUsIGNoZWNrZWROb2RlcykpO1xuICB9KTtcblxuICBjb25zdCBhY3R1YWwgPSBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihjeWNsZXMsIGJhc2VEaXIpO1xuXG4gIGluZm8oZ3JlZW4oYCAgIEN1cnJlbnQgbnVtYmVyIG9mIGN5Y2xlczogJHt5ZWxsb3coY3ljbGVzLmxlbmd0aC50b1N0cmluZygpKX1gKSk7XG5cbiAgaWYgKGFwcHJvdmUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGdvbGRlbkZpbGUsIEpTT04uc3RyaW5naWZ5KGFjdHVhbCwgbnVsbCwgMikpO1xuICAgIGluZm8oZ3JlZW4oJ+KchSAgVXBkYXRlZCBnb2xkZW4gZmlsZS4nKSk7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIWV4aXN0c1N5bmMoZ29sZGVuRmlsZSkpIHtcbiAgICBlcnJvcihyZWQoYOKdjCAgQ291bGQgbm90IGZpbmQgZ29sZGVuIGZpbGU6ICR7Z29sZGVuRmlsZX1gKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nc0NvdW50ID0gYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLnNpemUgKyBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5zaXplO1xuXG4gIC8vIEJ5IGRlZmF1bHQsIHdhcm5pbmdzIGZvciB1bnJlc29sdmVkIGZpbGVzIG9yIG1vZHVsZXMgYXJlIG5vdCBwcmludGVkLiBUaGlzIGlzIGJlY2F1c2VcbiAgLy8gaXQncyBjb21tb24gdGhhdCB0aGlyZC1wYXJ0eSBtb2R1bGVzIGFyZSBub3QgcmVzb2x2ZWQvdmlzaXRlZC4gQWxzbyBnZW5lcmF0ZWQgZmlsZXNcbiAgLy8gZnJvbSB0aGUgVmlldyBFbmdpbmUgY29tcGlsZXIgKGkuZS4gZmFjdG9yaWVzLCBzdW1tYXJpZXMpIGNhbm5vdCBiZSByZXNvbHZlZC5cbiAgaWYgKHByaW50V2FybmluZ3MgJiYgd2FybmluZ3NDb3VudCAhPT0gMCkge1xuICAgIGluZm8oeWVsbG93KCfimqAgIFRoZSBmb2xsb3dpbmcgaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQ6JykpO1xuICAgIEFycmF5LmZyb20oYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMpLnNvcnQoKS5mb3JFYWNoKHNwZWNpZmllciA9PiBpbmZvKGAgIOKAoiAke3NwZWNpZmllcn1gKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7Z2V0UmVsYXRpdmVQYXRoKGJhc2VEaXIsIGtleSl9YCk7XG4gICAgICB2YWx1ZS5zb3J0KCkuZm9yRWFjaChzcGVjaWZpZXIgPT4gaW5mbyhgICAgICAgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGluZm8oeWVsbG93KGDimqAgICR7d2FybmluZ3NDb3VudH0gaW1wb3J0cyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQuYCkpO1xuICAgIGluZm8oeWVsbG93KGAgICBQbGVhc2UgcmVydW4gd2l0aCBcIi0td2FybmluZ3NcIiB0byBpbnNwZWN0IHVucmVzb2x2ZWQgaW1wb3J0cy5gKSk7XG4gIH1cblxuICBjb25zdCBleHBlY3RlZCA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGdvbGRlbkZpbGUsICd1dGY4JykpIGFzIEdvbGRlbjtcbiAgY29uc3Qge2ZpeGVkQ2lyY3VsYXJEZXBzLCBuZXdDaXJjdWxhckRlcHN9ID0gY29tcGFyZUdvbGRlbnMoYWN0dWFsLCBleHBlY3RlZCk7XG4gIGNvbnN0IGlzTWF0Y2hpbmcgPSBmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggPT09IDAgJiYgbmV3Q2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMDtcblxuICBpZiAoaXNNYXRjaGluZykge1xuICAgIGluZm8oZ3JlZW4oJ+KchSAgR29sZGVuIG1hdGNoZXMgY3VycmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZXJyb3IocmVkKCfinYwgIEdvbGRlbiBkb2VzIG5vdCBtYXRjaCBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gIGlmIChuZXdDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoeWVsbG93KGAgICBOZXcgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHdoaWNoIGFyZSBub3QgYWxsb3dlZDpgKSk7XG4gICAgbmV3Q2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBlcnJvcihgICAgICDigKIgJHtjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjKX1gKSk7XG4gICAgZXJyb3IoKTtcbiAgfVxuICBpZiAoZml4ZWRDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoeWVsbG93KGAgICBGaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ29sZGVuOmApKTtcbiAgICBmaXhlZENpcmN1bGFyRGVwcy5mb3JFYWNoKGMgPT4gZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICAgIGluZm8oeWVsbG93KGBcXG4gICBUb3RhbDogJHtuZXdDaXJjdWxhckRlcHMubGVuZ3RofSBuZXcgY3ljbGUocyksICR7XG4gICAgICAgIGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aH0gZml4ZWQgY3ljbGUocykuIFxcbmApKTtcbiAgICBpZiAoYXBwcm92ZUNvbW1hbmQpIHtcbiAgICAgIGluZm8oeWVsbG93KGAgICBQbGVhc2UgYXBwcm92ZSB0aGUgbmV3IGdvbGRlbiB3aXRoOiAke2FwcHJvdmVDb21tYW5kfWApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgYCAgIFBsZWFzZSB1cGRhdGUgdGhlIGdvbGRlbi4gVGhlIGZvbGxvd2luZyBjb21tYW5kIGNhbiBiZSBgICtcbiAgICAgICAgICBgcnVuOiB5YXJuIHRzLWNpcmN1bGFyLWRlcHMgYXBwcm92ZSAke2dldFJlbGF0aXZlUGF0aChwcm9jZXNzLmN3ZCgpLCBnb2xkZW5GaWxlKX0uYCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMTtcbn1cblxuLyoqIEdldHMgdGhlIHNwZWNpZmllZCBwYXRoIHJlbGF0aXZlIHRvIHRoZSBiYXNlIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChiYXNlRGlyOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuICByZXR1cm4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBwYXRoKSk7XG59XG5cbi8qKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gcmVmZXJlbmNlIGNoYWluIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24uICovXG5mdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub1N0cmluZyhjaGFpbjogUmVmZXJlbmNlQ2hhaW48c3RyaW5nPikge1xuICByZXR1cm4gY2hhaW4uam9pbignIOKGkiAnKTtcbn1cbiJdfQ==