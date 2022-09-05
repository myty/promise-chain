import { AsyncComposable } from "./types.ts";

/**
 * Utility class to wrap a composition class with the intended purpose of chaining methods, specifically useful for
 * functions that return Promises. Note: Promise functions and non-promise functions can be mixed.
 */
export class Composable<T> {
  /**
   * Create a chaninable class based off of the functions that return "this" or a Promise of "this".
   */
  static create<T>(wrappedClass: T): AsyncComposable<T> {
    return new Composable(wrappedClass) as unknown as AsyncComposable<T>;
  }

  private _valuePromise: Promise<T>;

  private constructor(_wrappedClass: T) {
    this._valuePromise = Promise.resolve(_wrappedClass);

    Composable.keysOfObject(_wrappedClass).forEach((key) => {
      const callableFunc = _wrappedClass[key];

      if (!(callableFunc instanceof Function)) {
        return;
      }

      Object.defineProperty(this, key, {
        value: (...args: unknown[]) => {
          this._valuePromise = this._valuePromise.then((val: T) =>
            Promise.resolve(
              callableFunc.apply(val, args),
            )
          );

          return this;
        },
      });
    });
  }

  /**
   * Unfolds a series of methods by executing them in the order at which they were added to the composition chain.
   */
  value(): Promise<T> {
    return this._valuePromise;
  }

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
