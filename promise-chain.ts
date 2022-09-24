import { AsyncComposable } from "./types.ts";

/**
 * Utility class to wrap a composition class with the intended purpose of chaining methods, specifically useful for
 * functions that return Promises. Note: Promise functions and non-promise functions can be mixed.
 */
export default class PromiseChain<T> extends Promise<T> implements Promise<T> {
  /**
   * Create a chaninable class based off of the functions that return "this" or a Promise of "this".
   */
  static create<T>(wrappedClass: T): AsyncComposable<T> {
    return new PromiseChain(wrappedClass) as unknown as AsyncComposable<T>;
  }

  private _valuePromise: Promise<T>;

  private constructor(_wrappedClass: T) {
    super((_resolve, _reject) => {});

    this._valuePromise = Promise.resolve(_wrappedClass);
    this.then = (...args) => this._valuePromise.then(...args);
    this.catch = (...args) => this._valuePromise.catch(...args);
    this.finally = (...args) => this._valuePromise.finally(...args);

    PromiseChain.keysOfObject(_wrappedClass).forEach((key) => {
      const callableFunc = _wrappedClass[key];

      if (!(callableFunc instanceof Function)) {
        return;
      }

      Object.defineProperty(this, key, {
        value: (...args: unknown[]) => {
          this._valuePromise = this._valuePromise.then((val: T) =>
            callableFunc.apply(val, args)
          );

          return this;
        },
      });
    });
  }

  // Private static methods

  private static keysOfObject<T>(obj: T): Array<keyof T> {
    const proto = Object.getPrototypeOf(obj);

    const keys = Object.keys(obj).concat(
      Object.getOwnPropertyNames(proto).filter((name) =>
        name !== "constructor"
      ),
    );

    return keys as Array<keyof T>;
  }
}
