"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = exports.services = void 0;
const node_fetch_1 = require("node-fetch");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
/** List of services Angular relies on. */
exports.services = [
    {
        url: 'https://status.us-west-1.saucelabs.com/api/v2/status.json',
        name: 'Saucelabs',
    },
    {
        url: 'https://status.npmjs.org/api/v2/status.json',
        name: 'Npm',
    },
    {
        url: 'https://status.circleci.com/api/v2/status.json',
        name: 'CircleCi',
    },
    {
        url: 'https://www.githubstatus.com/api/v2/status.json',
        name: 'Github',
    },
];
class ServicesModule extends base_1.BaseModule {
    async retrieveData() {
        return Promise.all(exports.services.map((service) => this.getStatusFromStandardApi(service)));
    }
    async printToTerminal() {
        const statuses = await this.data;
        const serviceNameMinLength = Math.max(...statuses.map((service) => service.name.length));
        console_1.info.group(console_1.bold('Service Statuses'));
        for (const status of statuses) {
            const name = status.name.padEnd(serviceNameMinLength);
            if (status.status === 'passing') {
                console_1.info(`${name} ✅`);
            }
            else {
                console_1.info.group(`${name} ❌ (Updated: ${status.lastUpdated.toLocaleString()})`);
                console_1.info(`  Details: ${status.description}`);
                console_1.info.groupEnd();
            }
        }
        console_1.info.groupEnd();
        console_1.info();
    }
    /** Retrieve the status information for a service which uses a standard API response. */
    async getStatusFromStandardApi(service) {
        const result = await node_fetch_1.default(service.url).then((result) => result.json());
        const status = result.status.indicator === 'none' ? 'passing' : 'failing';
        return {
            name: service.name,
            status,
            description: result.status.description,
            lastUpdated: new Date(result.page.updated_at),
        };
    }
}
exports.ServicesModule = ServicesModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJDQUErQjtBQUUvQixpREFBK0M7QUFDL0MsaUNBQWtDO0FBZWxDLDBDQUEwQztBQUM3QixRQUFBLFFBQVEsR0FBb0I7SUFDdkM7UUFDRSxHQUFHLEVBQUUsMkRBQTJEO1FBQ2hFLElBQUksRUFBRSxXQUFXO0tBQ2xCO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsNkNBQTZDO1FBQ2xELElBQUksRUFBRSxLQUFLO0tBQ1o7SUFDRDtRQUNFLEdBQUcsRUFBRSxnREFBZ0Q7UUFDckQsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLEdBQUcsRUFBRSxpREFBaUQ7UUFDdEQsSUFBSSxFQUFFLFFBQVE7S0FDZjtDQUNGLENBQUM7QUFFRixNQUFhLGNBQWUsU0FBUSxpQkFBK0I7SUFDeEQsS0FBSyxDQUFDLFlBQVk7UUFDekIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFUSxLQUFLLENBQUMsZUFBZTtRQUM1QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDakMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUNyQyxLQUFLLE1BQU0sTUFBTSxJQUFJLFFBQVEsRUFBRTtZQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLGNBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7YUFDbkI7aUJBQU07Z0JBQ0wsY0FBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksZ0JBQWdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRSxjQUFJLENBQUMsY0FBYyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDekMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2pCO1NBQ0Y7UUFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsY0FBSSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsd0ZBQXdGO0lBQ3hGLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxPQUFzQjtRQUNuRCxNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDeEUsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMxRSxPQUFPO1lBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLE1BQU07WUFDTixXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXO1lBQ3RDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUM5QyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbENELHdDQWtDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5cbmltcG9ydCB7Ym9sZCwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbmludGVyZmFjZSBTZXJ2aWNlQ29uZmlnIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbn1cblxuLyoqIFRoZSByZXN1bHRzIG9mIGNoZWNraW5nIHRoZSBzdGF0dXMgb2YgYSBzZXJ2aWNlICovXG5pbnRlcmZhY2UgU3RhdHVzQ2hlY2tSZXN1bHQge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXR1czogJ3Bhc3NpbmcnIHwgJ2ZhaWxpbmcnO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBsYXN0VXBkYXRlZDogRGF0ZTtcbn1cblxuLyoqIExpc3Qgb2Ygc2VydmljZXMgQW5ndWxhciByZWxpZXMgb24uICovXG5leHBvcnQgY29uc3Qgc2VydmljZXM6IFNlcnZpY2VDb25maWdbXSA9IFtcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vc3RhdHVzLnVzLXdlc3QtMS5zYXVjZWxhYnMuY29tL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ1NhdWNlbGFicycsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy5ucG1qcy5vcmcvYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnTnBtJyxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vc3RhdHVzLmNpcmNsZWNpLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdDaXJjbGVDaScsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3d3dy5naXRodWJzdGF0dXMuY29tL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ0dpdGh1YicsXG4gIH0sXG5dO1xuXG5leHBvcnQgY2xhc3MgU2VydmljZXNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPFN0YXR1c0NoZWNrUmVzdWx0W10+IHtcbiAgb3ZlcnJpZGUgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChzZXJ2aWNlcy5tYXAoKHNlcnZpY2UpID0+IHRoaXMuZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKHNlcnZpY2UpKSk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3Qgc3RhdHVzZXMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgY29uc3Qgc2VydmljZU5hbWVNaW5MZW5ndGggPSBNYXRoLm1heCguLi5zdGF0dXNlcy5tYXAoKHNlcnZpY2UpID0+IHNlcnZpY2UubmFtZS5sZW5ndGgpKTtcbiAgICBpbmZvLmdyb3VwKGJvbGQoJ1NlcnZpY2UgU3RhdHVzZXMnKSk7XG4gICAgZm9yIChjb25zdCBzdGF0dXMgb2Ygc3RhdHVzZXMpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBzdGF0dXMubmFtZS5wYWRFbmQoc2VydmljZU5hbWVNaW5MZW5ndGgpO1xuICAgICAgaWYgKHN0YXR1cy5zdGF0dXMgPT09ICdwYXNzaW5nJykge1xuICAgICAgICBpbmZvKGAke25hbWV9IOKchWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mby5ncm91cChgJHtuYW1lfSDinYwgKFVwZGF0ZWQ6ICR7c3RhdHVzLmxhc3RVcGRhdGVkLnRvTG9jYWxlU3RyaW5nKCl9KWApO1xuICAgICAgICBpbmZvKGAgIERldGFpbHM6ICR7c3RhdHVzLmRlc2NyaXB0aW9ufWApO1xuICAgICAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgYSBzZXJ2aWNlIHdoaWNoIHVzZXMgYSBzdGFuZGFyZCBBUEkgcmVzcG9uc2UuICovXG4gIGFzeW5jIGdldFN0YXR1c0Zyb21TdGFuZGFyZEFwaShzZXJ2aWNlOiBTZXJ2aWNlQ29uZmlnKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoKHNlcnZpY2UudXJsKS50aGVuKChyZXN1bHQpID0+IHJlc3VsdC5qc29uKCkpO1xuICAgIGNvbnN0IHN0YXR1cyA9IHJlc3VsdC5zdGF0dXMuaW5kaWNhdG9yID09PSAnbm9uZScgPyAncGFzc2luZycgOiAnZmFpbGluZyc7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHNlcnZpY2UubmFtZSxcbiAgICAgIHN0YXR1cyxcbiAgICAgIGRlc2NyaXB0aW9uOiByZXN1bHQuc3RhdHVzLmRlc2NyaXB0aW9uLFxuICAgICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKHJlc3VsdC5wYWdlLnVwZGF0ZWRfYXQpLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==