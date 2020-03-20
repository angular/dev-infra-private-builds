/// <amd-module name="@angular/dev-infra-private/utils/config" />
/**
 * Gets the path of the directory for the repository base.
 */
export declare function getRepoBaseDir(): string;
/**
 * Retrieve the configuration from the .dev-infra.json file.
 */
export declare function getAngularDevConfig<K, T>(): DevInfraConfig<K, T>;
/**
 * Interface exressing the expected structure of the DevInfraConfig.
 * Allows for providing a typing for a part of the config to read.
 */
export interface DevInfraConfig<K, T> {
    [K: string]: T;
}
