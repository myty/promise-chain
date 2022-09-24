// deno-lint-ignore-file ban-types

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type PickMatching<T, V> = Pick<T, KeysMatching<T, V>>;

export type PickFunctionsThatReturnSelf<TType> = {
  [TKey in keyof PickMatching<TType, Function>]: TType[TKey] extends (
    ...args: infer TParams
  ) => TType | Promise<TType> ? (...args: TParams) => PromiseChainable<TType>
    : never;
};

export type PromiseChainable<TType> =
  & PickFunctionsThatReturnSelf<TType>
  & Promise<TType>;

export interface PromiseChainableConstructor {
  new <T>(obj: T): PromiseChainable<T>;
  <T>(obj: T): PromiseChainable<T>;
}
