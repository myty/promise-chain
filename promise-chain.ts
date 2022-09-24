import { PromiseChainable, PromiseChainableConstructor } from "./types.ts";

/**
 * Utility class to wrap a composition class with the intended purpose of chaining methods, specifically useful for
 * functions that return Promises. Note: Promise functions and non-promise functions can be mixed.
 */
const PromiseChain = function <T>(this: PromiseChainable<T> | void, obj: T) {
  if (!(this instanceof PromiseChain)) {
    return new PromiseChain(obj);
  } else {
    const self = this as unknown as { _valuePromise: Promise<T> } & Promise<T>;

    self._valuePromise = Promise.resolve(obj);

    this.then = (...args) => self._valuePromise.then(...args);
    this.catch = (...args) => self._valuePromise.catch(...args);
    this.finally = (...args) => self._valuePromise.finally(...args);

    keysOfObject(obj).forEach((key) => {
      const callableFunc = obj[key];

      if (!(callableFunc instanceof Function)) {
        return;
      }

      Object.defineProperty(this, key, {
        value: (...args: unknown[]) => {
          self._valuePromise = self._valuePromise.then((val: T) =>
            callableFunc.apply(val, args)
          );

          return this;
        },
      });
    });
  }
} as PromiseChainableConstructor;

function keysOfObject<T>(obj: T): Array<keyof T> {
  const proto = Object.getPrototypeOf(obj);

  const keys = Object.keys(obj).concat(
    Object.getOwnPropertyNames(proto).filter((name) => name !== "constructor"),
  );

  return keys as Array<keyof T>;
}

export default PromiseChain;
