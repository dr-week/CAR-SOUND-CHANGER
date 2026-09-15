/**
 * Shared Utility Types
 *
 * Generic TypeScript helpers used across multiple layers.
 * Never import domain or infrastructure types here — keep this framework-agnostic.
 */

/** A function with no arguments that returns void — used for cleanup / unsubscribe. */
export type Cleanup = () => void;

/** A callback that receives a value of type T. */
export type Listener<T> = (value: T) => void;

/** Make all properties of T non-readonly (inverse of Readonly<T>). */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/** Extract the resolved type from a Promise. */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** A range with inclusive min and max. */
export interface Range {
  min: number;
  max: number;
}
