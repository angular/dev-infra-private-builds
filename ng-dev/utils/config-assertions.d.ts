import { NgDevConfig } from './config.js';
declare type UnionToIntersection<U> = (U extends unknown ? (union: U) => void : never) extends (intersection: infer I) => void ? I : never;
declare type AssertedType<A> = A extends AssertionFn<infer T> ? T : never;
declare type AllAssertedTypes<A extends readonly AssertionFn<unknown>[]> = {
    [K in keyof A]: AssertedType<A[K]>;
};
declare type ExtractValuesAsUnionFromObject<T> = T[keyof T & number];
export declare type Assertions<A extends readonly AssertionFn<unknown>[]> = UnionToIntersection<ExtractValuesAsUnionFromObject<AllAssertedTypes<A>>>;
export declare type AssertionFn<T> = (value: NgDevConfig & Partial<T>) => asserts value is NgDevConfig & T;
export declare type MultipleAssertions = AssertionFn<unknown>[];
export {};
