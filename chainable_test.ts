import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { Chaninable } from "./chainable.ts";
import { PickMatching } from "./types.ts";

Deno.test(async function asyncChainable() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = await Chaninable.create(testClass)
    .asyncIncrement("propertyOne", 3)
    .asyncIncrementTwo()
    .asyncIncrementOne()
    .increment("propertyTwo", 5)
    .increment("propertyOne", 2)
    .asyncIncrementOne()
    .value();

  // Assert
  assertEquals(result.propertyOne, 7);
  assertEquals(result.propertyTwo, 6);
});

type PickNumbers<T> = PickMatching<T, number>;

class TestClass {
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
    increment: number
  ): Promise<TestClass> {
    return new TestClass({
      ...this,
      [property]: await Promise.resolve(this[property] + increment),
    });
  }

  async asyncIncrementOne(): Promise<TestClass> {
    return await this.asyncIncrement("propertyOne", 1);
  }

  async asyncIncrementTwo(): Promise<TestClass> {
    return await this.asyncIncrement("propertyTwo", 1);
  }

  increment(
    property: keyof PickNumbers<TestClass>,
    increment: number
  ): TestClass {
    return new TestClass({
      ...this,
      [property]: this[property] + increment,
    });
  }
}
