import { PickMatching } from "../types.ts";

type PickNumbers<T> = PickMatching<T, number>;

export class TestClass {
  public readonly propertyOne: number;
  public readonly propertyTwo: number;

  constructor({
    propertyOne = 0,
    propertyTwo = 0,
  }: Partial<PickNumbers<TestClass>> = {}) {
    this.propertyOne = propertyOne;
    this.propertyTwo = propertyTwo;
  }

  async asyncIncrement(
    property: keyof PickNumbers<TestClass>,
    increment: number,
  ): Promise<TestClass> {
    return new TestClass({
      ...this,
      [property]: await Promise.resolve(this[property] + increment),
    });
  }

  async asyncIncrementOne(): Promise<TestClass> {
    return await this.asyncIncrement("propertyOne", 1);
  }

  asyncIncrementOneLongRunningTask(
    durationMs: number,
  ): Promise<TestClass> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.asyncIncrement("propertyOne", 1).then(resolve);
        clearTimeout(timer);
      }, durationMs);
    });
  }

  async asyncIncrementTwo(): Promise<TestClass> {
    return await this.asyncIncrement("propertyTwo", 1);
  }

  increment(
    property: keyof PickNumbers<TestClass>,
    increment: number,
  ): TestClass {
    return new TestClass({
      ...this,
      [property]: this[property] + increment,
    });
  }
}
