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
    if (require.main === module) {
        tsCircularDependenciesBuilder(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkQ7SUFDM0QsNkJBQXNDO0lBQ3RDLDZCQUFtRDtJQUVuRCw2QkFBK0I7SUFDL0IsK0JBQTBCO0lBRTFCLHlGQUFvRDtJQUNwRCxxRkFBK0U7SUFDL0UsK0ZBQXdEO0lBQ3hELHFGQUF3RTtJQUd4RSxTQUFnQiw2QkFBNkIsQ0FBQyxVQUFzQjtRQUNsRSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFO2FBQ2YsTUFBTSxDQUNILFFBQVEsRUFDUixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsaUNBQWlDLEVBQUMsQ0FBQzthQUN4RixNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUMsQ0FBQzthQUMxRSxPQUFPLENBQ0osT0FBTyxFQUFFLG1EQUFtRCxFQUFFLEVBQUUsRUFDaEUsVUFBQyxJQUFxQjtZQUNiLElBQUEsdUJBQWlCLEVBQUUsd0JBQVEsQ0FBUztZQUMzQyxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFNLE1BQU0sR0FBRyx1QkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osU0FBUyxFQUFFLDZDQUE2QyxFQUFFLEVBQUUsRUFBRSxVQUFDLElBQXFCO1lBQzNFLElBQUEsdUJBQWlCLEVBQUUsd0JBQVEsQ0FBUztZQUMzQyxJQUFNLFVBQVUsR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFNLE1BQU0sR0FBRyx1QkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUF2QkQsc0VBdUJDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsSUFBSSxDQUNoQixPQUFnQixFQUFFLE1BQXNDLEVBQUUsYUFBc0I7UUFDM0UsSUFBQSx3QkFBTyxFQUFFLDhCQUFVLEVBQUUsa0JBQUksRUFBRSxvQ0FBYSxFQUFFLHNDQUFjLENBQVc7UUFDMUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdDLElBQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7UUFDcEMsSUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7UUFFbEQsV0FBUSxDQUFDLElBQUksRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVE7WUFDL0MsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsSUFBSSxPQUFYLE1BQU0sbUJBQVMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUU7UUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLE1BQU0sR0FBRyxzQ0FBNkIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUQsT0FBTyxDQUFDLElBQUksQ0FDUixlQUFLLENBQUMsS0FBSyxDQUFDLGtDQUFnQyxlQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0YsSUFBSSxPQUFPLEVBQUU7WUFDWCxrQkFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQUssQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7YUFBTSxJQUFJLENBQUMsZUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyx5Q0FBa0MsVUFBWSxDQUFDLENBQUMsQ0FBQztZQUN6RSxPQUFPLENBQUMsQ0FBQztTQUNWO1FBRUQsSUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztRQUV0Rix3RkFBd0Y7UUFDeEYsc0ZBQXNGO1FBQ3RGLGdGQUFnRjtRQUNoRixJQUFJLGFBQWEsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxpREFBaUQsQ0FBQyxDQUFDLENBQUM7WUFDOUUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBTyxTQUFXLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1lBQ2xGLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLEdBQUc7Z0JBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBTyxlQUFlLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBRyxDQUFDLENBQUM7Z0JBQ3JELEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVMsU0FBVyxDQUFDLEVBQWxDLENBQWtDLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQUMsYUFBTSxhQUFhLG9DQUFpQyxDQUFDLENBQUMsQ0FBQztZQUNqRixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQUMsb0VBQWtFLENBQUMsQ0FBQyxDQUFDO1NBQ2hHO1FBRUQsSUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUEsOENBQXVFLEVBQXRFLHdDQUFpQixFQUFFLG9DQUFtRCxDQUFDO1FBQzlFLElBQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFFbEYsSUFBSSxVQUFVLEVBQUU7WUFDZCxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQUssQ0FBQyxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsQ0FBQyxDQUFDO1FBQ3BGLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsTUFBTSxDQUFDLHFEQUFxRCxDQUFDLENBQUMsQ0FBQztZQUNuRixlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBVSw2QkFBNkIsQ0FBQyxDQUFDLENBQUcsQ0FBQyxFQUEzRCxDQUEyRCxDQUFDLENBQUM7U0FDM0Y7UUFDRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FDVCxlQUFLLENBQUMsTUFBTSxDQUFDLHlFQUF5RSxDQUFDLENBQUMsQ0FBQztZQUM3RixpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFVLDZCQUE2QixDQUFDLENBQUMsQ0FBRyxDQUFDLEVBQTNELENBQTJELENBQUMsQ0FBQztZQUM1RixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixJQUFJLGNBQWMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFLLENBQUMsTUFBTSxDQUFDLDRDQUEwQyxjQUFnQixDQUFDLENBQUMsQ0FBQzthQUN4RjtpQkFBTTtnQkFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQ3JCLDREQUE0RDtxQkFDNUQsd0NBQXNDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsVUFBVSxDQUFDLE1BQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQzthQUMzRjtTQUNGO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBdkVELG9CQXVFQztJQUVELDhEQUE4RDtJQUM5RCxTQUFTLGVBQWUsQ0FBQyxPQUFlLEVBQUUsSUFBWTtRQUNwRCxPQUFPLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFNBQVMsNkJBQTZCLENBQUMsS0FBNkI7UUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzlDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtzeW5jIGFzIGdsb2JTeW5jfSBmcm9tICdnbG9iJztcbmltcG9ydCB7aXNBYnNvbHV0ZSwgcmVsYXRpdmUsIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbXBvcnQge0FuYWx5emVyLCBSZWZlcmVuY2VDaGFpbn0gZnJvbSAnLi9hbmFseXplcic7XG5pbXBvcnQge2NvbXBhcmVHb2xkZW5zLCBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbiwgR29sZGVufSBmcm9tICcuL2dvbGRlbic7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtsb2FkVGVzdENvbmZpZywgQ2lyY3VsYXJEZXBlbmRlbmNpZXNUZXN0Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oXG4gICAgICAgICAgJ2NvbmZpZycsXG4gICAgICAgICAge3R5cGU6ICdzdHJpbmcnLCBkZW1hbmRPcHRpb246IHRydWUsIGRlc2NyaXB0aW9uOiAnUGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLid9KVxuICAgICAgLm9wdGlvbignd2FybmluZ3MnLCB7dHlwZTogJ2Jvb2xlYW4nLCBkZXNjcmlwdGlvbjogJ1ByaW50cyBhbGwgd2FybmluZ3MuJ30pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnY2hlY2snLCAnQ2hlY2tzIGlmIHRoZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgaGF2ZSBjaGFuZ2VkLicsIHt9LFxuICAgICAgICAgIChhcmd2OiB5YXJncy5Bcmd1bWVudHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtjb25maWc6IGNvbmZpZ0FyZywgd2FybmluZ3N9ID0gYXJndjtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBpc0Fic29sdXRlKGNvbmZpZ0FyZykgPyBjb25maWdBcmcgOiByZXNvbHZlKGNvbmZpZ0FyZyk7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChtYWluKGZhbHNlLCBjb25maWcsIHdhcm5pbmdzKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdhcHByb3ZlJywgJ0FwcHJvdmVzIHRoZSBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nLCB7fSwgKGFyZ3Y6IHlhcmdzLkFyZ3VtZW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3Qge2NvbmZpZzogY29uZmlnQXJnLCB3YXJuaW5nc30gPSBhcmd2O1xuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IGlzQWJzb2x1dGUoY29uZmlnQXJnKSA/IGNvbmZpZ0FyZyA6IHJlc29sdmUoY29uZmlnQXJnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KG1haW4odHJ1ZSwgY29uZmlnLCB3YXJuaW5ncykpO1xuICAgICAgICAgIH0pO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhlIHRzLWNpcmN1bGFyLWRlcGVuZGVuY2llcyB0b29sLlxuICogQHBhcmFtIGFwcHJvdmUgV2hldGhlciB0aGUgZGV0ZWN0ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBhcHByb3ZlZC5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuXG4gKiBAcGFyYW0gcHJpbnRXYXJuaW5ncyBXaGV0aGVyIHdhcm5pbmdzIHNob3VsZCBiZSBwcmludGVkIG91dC5cbiAqIEByZXR1cm5zIFN0YXR1cyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgICBhcHByb3ZlOiBib29sZWFuLCBjb25maWc6IENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZywgcHJpbnRXYXJuaW5nczogYm9vbGVhbik6IG51bWJlciB7XG4gIGNvbnN0IHtiYXNlRGlyLCBnb2xkZW5GaWxlLCBnbG9iLCByZXNvbHZlTW9kdWxlLCBhcHByb3ZlQ29tbWFuZH0gPSBjb25maWc7XG4gIGNvbnN0IGFuYWx5emVyID0gbmV3IEFuYWx5emVyKHJlc29sdmVNb2R1bGUpO1xuICBjb25zdCBjeWNsZXM6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgY29uc3QgY2hlY2tlZE5vZGVzID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBnbG9iU3luYyhnbG9iLCB7YWJzb2x1dGU6IHRydWV9KS5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gYW5hbHl6ZXIuZ2V0U291cmNlRmlsZShmaWxlUGF0aCk7XG4gICAgY3ljbGVzLnB1c2goLi4uYW5hbHl6ZXIuZmluZEN5Y2xlcyhzb3VyY2VGaWxlLCBjaGVja2VkTm9kZXMpKTtcbiAgfSk7XG5cbiAgY29uc3QgYWN0dWFsID0gY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4oY3ljbGVzLCBiYXNlRGlyKTtcblxuICBjb25zb2xlLmluZm8oXG4gICAgICBjaGFsay5ncmVlbihgICAgQ3VycmVudCBudW1iZXIgb2YgY3ljbGVzOiAke2NoYWxrLnllbGxvdyhjeWNsZXMubGVuZ3RoLnRvU3RyaW5nKCkpfWApKTtcblxuICBpZiAoYXBwcm92ZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZ29sZGVuRmlsZSwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsLCBudWxsLCAyKSk7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKCfinIUgIFVwZGF0ZWQgZ29sZGVuIGZpbGUuJykpO1xuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKCFleGlzdHNTeW5jKGdvbGRlbkZpbGUpKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYOKdjCAgQ291bGQgbm90IGZpbmQgZ29sZGVuIGZpbGU6ICR7Z29sZGVuRmlsZX1gKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nc0NvdW50ID0gYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLnNpemUgKyBhbmFseXplci51bnJlc29sdmVkTW9kdWxlcy5zaXplO1xuXG4gIC8vIEJ5IGRlZmF1bHQsIHdhcm5pbmdzIGZvciB1bnJlc29sdmVkIGZpbGVzIG9yIG1vZHVsZXMgYXJlIG5vdCBwcmludGVkLiBUaGlzIGlzIGJlY2F1c2VcbiAgLy8gaXQncyBjb21tb24gdGhhdCB0aGlyZC1wYXJ0eSBtb2R1bGVzIGFyZSBub3QgcmVzb2x2ZWQvdmlzaXRlZC4gQWxzbyBnZW5lcmF0ZWQgZmlsZXNcbiAgLy8gZnJvbSB0aGUgVmlldyBFbmdpbmUgY29tcGlsZXIgKGkuZS4gZmFjdG9yaWVzLCBzdW1tYXJpZXMpIGNhbm5vdCBiZSByZXNvbHZlZC5cbiAgaWYgKHByaW50V2FybmluZ3MgJiYgd2FybmluZ3NDb3VudCAhPT0gMCkge1xuICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coJ+KaoCAgVGhlIGZvbGxvd2luZyBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZDonKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZE1vZHVsZXMuZm9yRWFjaChzcGVjaWZpZXIgPT4gY29uc29sZS5pbmZvKGAgIOKAoiAke3NwZWNpZmllcn1gKSk7XG4gICAgYW5hbHl6ZXIudW5yZXNvbHZlZEZpbGVzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgICDigKIgJHtnZXRSZWxhdGl2ZVBhdGgoYmFzZURpciwga2V5KX1gKTtcbiAgICAgIHZhbHVlLmZvckVhY2goc3BlY2lmaWVyID0+IGNvbnNvbGUuaW5mbyhgICAgICAgJHtzcGVjaWZpZXJ9YCkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coYOKaoCAgJHt3YXJuaW5nc0NvdW50fSBpbXBvcnRzIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5gKSk7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdyhgICAgUGxlYXNlIHJlcnVuIHdpdGggXCItLXdhcm5pbmdzXCIgdG8gaW5zcGVjdCB1bnJlc29sdmVkIGltcG9ydHMuYCkpO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWQ6IEdvbGRlbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKGdvbGRlbkZpbGUsICd1dGY4JykpO1xuICBjb25zdCB7Zml4ZWRDaXJjdWxhckRlcHMsIG5ld0NpcmN1bGFyRGVwc30gPSBjb21wYXJlR29sZGVucyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgY29uc3QgaXNNYXRjaGluZyA9IGZpeGVkQ2lyY3VsYXJEZXBzLmxlbmd0aCA9PT0gMCAmJiBuZXdDaXJjdWxhckRlcHMubGVuZ3RoID09PSAwO1xuXG4gIGlmIChpc01hdGNoaW5nKSB7XG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKCfinIUgIEdvbGRlbiBtYXRjaGVzIGN1cnJlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLicpKTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCfinYwgIEdvbGRlbiBkb2VzIG5vdCBtYXRjaCBjdXJyZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcy4nKSk7XG4gIGlmIChuZXdDaXJjdWxhckRlcHMubGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYCAgIE5ldyBjaXJjdWxhciBkZXBlbmRlbmNpZXMgd2hpY2ggYXJlIG5vdCBhbGxvd2VkOmApKTtcbiAgICBuZXdDaXJjdWxhckRlcHMuZm9yRWFjaChjID0+IGNvbnNvbGUuZXJyb3IoYCAgICAg4oCiICR7Y29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoYyl9YCkpO1xuICB9XG4gIGlmIChmaXhlZENpcmN1bGFyRGVwcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay55ZWxsb3coYCAgIEZpeGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBnb2xkZW46YCkpO1xuICAgIGZpeGVkQ2lyY3VsYXJEZXBzLmZvckVhY2goYyA9PiBjb25zb2xlLmVycm9yKGAgICAgIOKAoiAke2NvbnZlcnRSZWZlcmVuY2VDaGFpblRvU3RyaW5nKGMpfWApKTtcbiAgICBjb25zb2xlLmluZm8oKTtcbiAgICBpZiAoYXBwcm92ZUNvbW1hbmQpIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coYCAgIFBsZWFzZSBhcHByb3ZlIHRoZSBuZXcgZ29sZGVuIHdpdGg6ICR7YXBwcm92ZUNvbW1hbmR9YCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KFxuICAgICAgICAgIGAgICBQbGVhc2UgdXBkYXRlIHRoZSBnb2xkZW4uIFRoZSBmb2xsb3dpbmcgY29tbWFuZCBjYW4gYmUgYCArXG4gICAgICAgICAgYHJ1bjogeWFybiB0cy1jaXJjdWxhci1kZXBzIGFwcHJvdmUgJHtnZXRSZWxhdGl2ZVBhdGgocHJvY2Vzcy5jd2QoKSwgZ29sZGVuRmlsZSl9LmApKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59XG5cbi8qKiBHZXRzIHRoZSBzcGVjaWZpZWQgcGF0aCByZWxhdGl2ZSB0byB0aGUgYmFzZSBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoYmFzZURpcjogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgcGF0aCkpO1xufVxuXG4vKiogQ29udmVydHMgdGhlIGdpdmVuIHJlZmVyZW5jZSBjaGFpbiB0byBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiAqL1xuZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9TdHJpbmcoY2hhaW46IFJlZmVyZW5jZUNoYWluPHN0cmluZz4pIHtcbiAgcmV0dXJuIGNoYWluLmpvaW4oJyDihpIgJyk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==