// deno-lint-ignore-file ban-types

// https://stackoverflow.com/a/57044690/203857
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type PickMatching<T, V> = Pick<T, KeysMatching<T, V>>;

export type PickFunctionsThatReturnSelf<TType> = {
  [TKey in keyof PickMatching<TType, Function>]: TType[TKey] extends (
    ...args: infer TParams
  ) => TType | Promise<TType>
    ? (...args: TParams) => AsyncChainable<TType>
    : never;
};

export type AsyncChainable<TType> = PickFunctionsThatReturnSelf<TType> & {
  value(): Promise<TType>;
};
