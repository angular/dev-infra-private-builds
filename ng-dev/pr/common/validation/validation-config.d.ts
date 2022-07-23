/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PullRequestValidationFailure } from './validation-failure.js';
/**
 * Pull request validation configuration controlling which assertions
 * should run or not. This enables the forcibly non-fatal ignore feature.
 */
export declare class PullRequestValidationConfig {
    assertPending: boolean;
    assertMergeReady: boolean;
    assertSignedCla: boolean;
    assertChangesAllowForTargetLabel: boolean;
    assertPassingCi: boolean;
}
/** Type describing a helper function for validations to create a validation failure. */
export declare type PullRequestValidationErrorCreateFn = (message: string) => PullRequestValidationFailure;
/**
 * Base class for pull request validations, providing helpers for the validation errors,
 * and a consistent interface for checking the activation state of validations
 */
export declare abstract class PullRequestValidation {
    protected name: keyof PullRequestValidationConfig;
    protected _createError: PullRequestValidationErrorCreateFn;
    constructor(name: keyof PullRequestValidationConfig, _createError: PullRequestValidationErrorCreateFn);
}
/** Creates a pull request validation from a configuration and implementation class. */
export declare function createPullRequestValidation<T extends PullRequestValidation>({ name, canBeForceIgnored }: {
    name: keyof PullRequestValidationConfig;
    canBeForceIgnored: boolean;
}, getValidationCtor: () => new (...args: ConstructorParameters<typeof PullRequestValidation>) => T): {
    run(validationConfig: PullRequestValidationConfig, fn: (v: T) => void): Promise<void>;
};
