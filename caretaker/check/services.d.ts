/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/services" />
import { BaseModule } from './base';
interface ServiceConfig {
    name: string;
    url: string;
}
/** The results of checking the status of a service */
interface StatusCheckResult {
    name: string;
    status: 'passing' | 'failing';
    description: string;
    lastUpdated: Date;
}
/** List of services Angular relies on. */
export declare const services: ServiceConfig[];
export declare class ServicesModule extends BaseModule<StatusCheckResult[]> {
    retrieveData(): Promise<StatusCheckResult[]>;
    printToTerminal(): Promise<void>;
    /** Retrieve the status information for a service which uses a standard API response. */
    getStatusFromStandardApi(service: ServiceConfig): Promise<StatusCheckResult>;
}
export {};
