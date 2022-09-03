import { AsyncChainable } from "./types.ts";

export class Chaninable<T> {
  private _chain: { key: keyof T; args: unknown[] }[] = [];

  private constructor(private _wrappedClass: T) {
    Chaninable.keysOfObject(_wrappedClass).forEach((key) => {
      const callableFunc = _wrappedClass[key];

      if (!(callableFunc instanceof Function)) {
        return;
      }

      Object.defineProperty(this, key, {
        value: (...args: unknown[]) => {
          this._chain.push({
            key,
            args,
          });

          return this;
        },
      });
    });
  }

  static create<T>(wrappedClass: T): AsyncChainable<T> {
    return new Chaninable(wrappedClass) as unknown as AsyncChainable<T>;
  }

  async value(): Promise<T> {
    for (const step of this._chain) {
      const funcProperty = this._wrappedClass[step.key];

      if (!(funcProperty instanceof Function)) {
        throw new Error(
          `Property: ${String(step.key)} is not a callable function`
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
      Object.getOwnPropertyNames(proto).filter((name) => name !== "constructor")
    );

    return keys as Array<keyof T>;
  }
}
