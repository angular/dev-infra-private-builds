/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
/// <reference types="node" />
/** Unique error class for failures when reading from the stdin. */
export declare class ReadBufferFromStdinError extends Error {
}
/**
 * Reads a `Buffer` from `stdin` until the stream is closed.
 *
 * @returns a Promise resolving with the `Buffer`. Rejects with `ReadBufferFromStdinError`
 *   on unexpected read errors.
 */
export declare function readBufferFromStdinUntilClosed(input?: NodeJS.ReadStream): Promise<Buffer>;
