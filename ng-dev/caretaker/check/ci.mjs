"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiModule = void 0;
const node_fetch_1 = require("node-fetch");
const index_1 = require("../../release/versioning/index");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
class CiModule extends base_1.BaseModule {
    async retrieveData() {
        const nextBranchName = (0, index_1.getNextBranchName)(this.config.github);
        const repo = {
            api: this.git.github,
            ...this.git.remoteConfig,
            nextBranchName,
        };
        const { latest, next, releaseCandidate } = await (0, index_1.fetchActiveReleaseTrains)(repo);
        const ciResultPromises = Object.entries({ releaseCandidate, latest, next }).map(async ([trainName, train]) => {
            if (train === null) {
                return {
                    active: false,
                    name: trainName,
                    label: '',
                    status: 'not found',
                };
            }
            return {
                active: true,
                name: train.branchName,
                label: `${trainName} (${train.branchName})`,
                status: await this.getBranchStatusFromCi(train.branchName),
            };
        });
        return await Promise.all(ciResultPromises);
    }
    async printToTerminal() {
        const data = await this.data;
        const minLabelLength = Math.max(...data.map((result) => result.label.length));
        console_1.info.group((0, console_1.bold)(`CI`));
        data.forEach((result) => {
            if (result.active === false) {
                (0, console_1.debug)(`No active release train for ${result.name}`);
                return;
            }
            const label = result.label.padEnd(minLabelLength);
            if (result.status === 'not found') {
                (0, console_1.info)(`${result.name} was not found on CircleCI`);
            }
            else if (result.status === 'success') {
                (0, console_1.info)(`${label} ✅`);
            }
            else {
                (0, console_1.info)(`${label} ❌`);
            }
        });
        console_1.info.groupEnd();
        (0, console_1.info)();
    }
    /** Get the CI status of a given branch from CircleCI. */
    async getBranchStatusFromCi(branch) {
        const { owner, name } = this.git.remoteConfig;
        const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
        const result = await (0, node_fetch_1.default)(url).then((result) => result.text());
        if (result && !result.includes('no builds')) {
            return result.includes('passing') ? 'success' : 'failed';
        }
        return 'not found';
    }
}
exports.CiModule = CiModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJDQUErQjtBQUMvQiwwREFLd0M7QUFFeEMsaURBQXNEO0FBQ3RELGlDQUFrQztBQWFsQyxNQUFhLFFBQVMsU0FBUSxpQkFBa0I7SUFDckMsS0FBSyxDQUFDLFlBQVk7UUFDekIsTUFBTSxjQUFjLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELE1BQU0sSUFBSSxHQUF1QjtZQUMvQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNO1lBQ3BCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO1lBQ3hCLGNBQWM7U0FDZixDQUFDO1FBQ0YsTUFBTSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUMsR0FBRyxNQUFNLElBQUEsZ0NBQXdCLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsR0FBRyxDQUMzRSxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFnQyxFQUFFLEVBQUU7WUFDMUQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUNsQixPQUFPO29CQUNMLE1BQU0sRUFBRSxLQUFLO29CQUNiLElBQUksRUFBRSxTQUFTO29CQUNmLEtBQUssRUFBRSxFQUFFO29CQUNULE1BQU0sRUFBRSxXQUFvQjtpQkFDN0IsQ0FBQzthQUNIO1lBRUQsT0FBTztnQkFDTCxNQUFNLEVBQUUsSUFBSTtnQkFDWixJQUFJLEVBQUUsS0FBSyxDQUFDLFVBQVU7Z0JBQ3RCLEtBQUssRUFBRSxHQUFHLFNBQVMsS0FBSyxLQUFLLENBQUMsVUFBVSxHQUFHO2dCQUMzQyxNQUFNLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQzthQUMzRCxDQUFDO1FBQ0osQ0FBQyxDQUNGLENBQUM7UUFFRixPQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFUSxLQUFLLENBQUMsZUFBZTtRQUM1QixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RSxjQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsY0FBSSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3RCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUU7Z0JBQzNCLElBQUEsZUFBSyxFQUFDLCtCQUErQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDcEQsT0FBTzthQUNSO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtnQkFDakMsSUFBQSxjQUFJLEVBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSw0QkFBNEIsQ0FBQyxDQUFDO2FBQ2xEO2lCQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3RDLElBQUEsY0FBSSxFQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDTCxJQUFBLGNBQUksRUFBQyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFBLGNBQUksR0FBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELHlEQUF5RDtJQUNqRCxLQUFLLENBQUMscUJBQXFCLENBQUMsTUFBYztRQUNoRCxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1FBQzVDLE1BQU0sR0FBRyxHQUFHLDJCQUEyQixLQUFLLElBQUksSUFBSSxTQUFTLE1BQU0sbUJBQW1CLENBQUM7UUFDdkYsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLG9CQUFLLEVBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUVoRSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUMxRDtRQUNELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7Q0FDRjtBQWpFRCw0QkFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IHtcbiAgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICBnZXROZXh0QnJhbmNoTmFtZSxcbiAgUmVsZWFzZVJlcG9XaXRoQXBpLFxuICBSZWxlYXNlVHJhaW4sXG59IGZyb20gJy4uLy4uL3JlbGVhc2UvdmVyc2lvbmluZy9pbmRleCc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG4vKiogVGhlIHJlc3VsdCBvZiBjaGVja2luZyBhIGJyYW5jaCBvbiBDSS4gKi9cbnR5cGUgQ2lCcmFuY2hTdGF0dXMgPSAnc3VjY2VzcycgfCAnZmFpbGVkJyB8ICdub3QgZm91bmQnO1xuXG4vKiogQSBsaXN0IG9mIHJlc3VsdHMgZm9yIGNoZWNraW5nIENJIGJyYW5jaGVzLiAqL1xudHlwZSBDaURhdGEgPSB7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgbmFtZTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBzdGF0dXM6IENpQnJhbmNoU3RhdHVzO1xufVtdO1xuXG5leHBvcnQgY2xhc3MgQ2lNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPENpRGF0YT4ge1xuICBvdmVycmlkZSBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZSh0aGlzLmNvbmZpZy5naXRodWIpO1xuICAgIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtcbiAgICAgIGFwaTogdGhpcy5naXQuZ2l0aHViLFxuICAgICAgLi4udGhpcy5naXQucmVtb3RlQ29uZmlnLFxuICAgICAgbmV4dEJyYW5jaE5hbWUsXG4gICAgfTtcbiAgICBjb25zdCB7bGF0ZXN0LCBuZXh0LCByZWxlYXNlQ2FuZGlkYXRlfSA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcbiAgICBjb25zdCBjaVJlc3VsdFByb21pc2VzID0gT2JqZWN0LmVudHJpZXMoe3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdCwgbmV4dH0pLm1hcChcbiAgICAgIGFzeW5jIChbdHJhaW5OYW1lLCB0cmFpbl06IFtzdHJpbmcsIFJlbGVhc2VUcmFpbiB8IG51bGxdKSA9PiB7XG4gICAgICAgIGlmICh0cmFpbiA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbmFtZTogdHJhaW5OYW1lLFxuICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgc3RhdHVzOiAnbm90IGZvdW5kJyBhcyBjb25zdCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgbmFtZTogdHJhaW4uYnJhbmNoTmFtZSxcbiAgICAgICAgICBsYWJlbDogYCR7dHJhaW5OYW1lfSAoJHt0cmFpbi5icmFuY2hOYW1lfSlgLFxuICAgICAgICAgIHN0YXR1czogYXdhaXQgdGhpcy5nZXRCcmFuY2hTdGF0dXNGcm9tQ2kodHJhaW4uYnJhbmNoTmFtZSksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICk7XG5cbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoY2lSZXN1bHRQcm9taXNlcyk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBjb25zdCBtaW5MYWJlbExlbmd0aCA9IE1hdGgubWF4KC4uLmRhdGEubWFwKChyZXN1bHQpID0+IHJlc3VsdC5sYWJlbC5sZW5ndGgpKTtcbiAgICBpbmZvLmdyb3VwKGJvbGQoYENJYCkpO1xuICAgIGRhdGEuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0LmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgZGVidWcoYE5vIGFjdGl2ZSByZWxlYXNlIHRyYWluIGZvciAke3Jlc3VsdC5uYW1lfWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsYWJlbCA9IHJlc3VsdC5sYWJlbC5wYWRFbmQobWluTGFiZWxMZW5ndGgpO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdub3QgZm91bmQnKSB7XG4gICAgICAgIGluZm8oYCR7cmVzdWx0Lm5hbWV9IHdhcyBub3QgZm91bmQgb24gQ2lyY2xlQ0lgKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIGluZm8oYCR7bGFiZWx9IOKchWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mbyhgJHtsYWJlbH0g4p2MYCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIENJIHN0YXR1cyBvZiBhIGdpdmVuIGJyYW5jaCBmcm9tIENpcmNsZUNJLiAqL1xuICBwcml2YXRlIGFzeW5jIGdldEJyYW5jaFN0YXR1c0Zyb21DaShicmFuY2g6IHN0cmluZyk6IFByb21pc2U8Q2lCcmFuY2hTdGF0dXM+IHtcbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2NpcmNsZWNpLmNvbS9naC8ke293bmVyfS8ke25hbWV9L3RyZWUvJHticmFuY2h9LnN2Zz9zdHlsZT1zaGllbGRgO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoKHVybCkudGhlbigocmVzdWx0KSA9PiByZXN1bHQudGV4dCgpKTtcblxuICAgIGlmIChyZXN1bHQgJiYgIXJlc3VsdC5pbmNsdWRlcygnbm8gYnVpbGRzJykpIHtcbiAgICAgIHJldHVybiByZXN1bHQuaW5jbHVkZXMoJ3Bhc3NpbmcnKSA/ICdzdWNjZXNzJyA6ICdmYWlsZWQnO1xuICAgIH1cbiAgICByZXR1cm4gJ25vdCBmb3VuZCc7XG4gIH1cbn1cbiJdfQ==