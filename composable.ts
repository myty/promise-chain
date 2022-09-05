import { AsyncComposable } from "./types.ts";

/**
 * Utility class to wrap a composition class with the intended purpose of chaining methods, specifically useful for
 * functions that return Promises. Note: Promise functions and non-promise functions can be mixed.
 */
export class Composable<T> implements Promise<T> {
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

  // Promise<T> implementation

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this._valuePromise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((
        reason: unknown,
      ) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<T | TResult> {
    return this._valuePromise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this._valuePromise.finally(onfinally);
  }

  [Symbol.toStringTag]!: "Composable";

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
