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

  private _compositionSteps: { key: keyof T; args: unknown[] }[] = [];

  private constructor(private _wrappedClass: T) {
    Composable.keysOfObject(_wrappedClass).forEach((key) => {
      const callableFunc = _wrappedClass[key];

      if (!(callableFunc instanceof Function)) {
        return;
      }

      Object.defineProperty(this, key, {
        value: (...args: unknown[]) => {
          this._compositionSteps.push({
            key,
            args,
          });

          return this;
        },
      });
    });
  }

  /**
   * Unfolds a series of methods by executing them in the order at which they were added to the composition chain.
   */
  async value(): Promise<T> {
    for (const step of this._compositionSteps) {
      const funcProperty = this._wrappedClass[step.key];

      if (!(funcProperty instanceof Function)) {
        throw new Error(
          `Property: ${String(step.key)} is not a callable function`,
        );
      }

      const funcResult = funcProperty.apply(this._wrappedClass, step.args);

      this._wrappedClass = await Promise.resolve(funcResult);
    }

    return this._wrappedClass;
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
