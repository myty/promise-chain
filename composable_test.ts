import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { Composable } from "./composable.ts";
import { PickMatching } from "./types.ts";

Deno.test(async function whenTraditionalAsyncChainingItReturnsResult() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = await testClass
    .asyncIncrement("propertyOne", 3)
    .then((t) => t.asyncIncrementTwo())
    .then((t) => t.asyncIncrementOne())
    .then((t) => Promise.resolve(t.increment("propertyTwo", 5)))
    .then((t) => Promise.resolve(t.increment("propertyOne", 2)))
    .then((t) => t.asyncIncrementOne());

  // Assert
  assertEquals(result.propertyOne, 7);
  assertEquals(result.propertyTwo, 6);
});

Deno.test(async function whenAsyncChainingItReturnsResult() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = await Composable.create(testClass)
    .asyncIncrement("propertyOne", 3)
    .asyncIncrementTwo()
    .asyncIncrementOne()
    .increment("propertyTwo", 5)
    .increment("propertyOne", 2)
    .asyncIncrementOne();

  // Assert
  assertEquals(result.propertyOne, 7);
  assertEquals(result.propertyTwo, 6);
});

Deno.test(async function whenChainedPromiseIsReusedItReturnsCachedResult() {
  // Arrange
  const testClass = new TestClass();
  const durationExpectedMs = 250;
  const resultTask = Composable.create(testClass)
    .asyncIncrement("propertyTwo", 3)
    .asyncIncrementOneLongRunningTask(durationExpectedMs);
  await resultTask;

  // Act
  const startTime = Date.now();
  const resultTwo = await resultTask
    .asyncIncrement("propertyTwo", 3);
  const durationActualMs = Date.now() - startTime;

  // Assert
  assert(
    durationActualMs < durationExpectedMs,
    `durationActual was actually ${durationActualMs}`,
  );
  assertEquals(resultTwo.propertyOne, 1);
  assertEquals(resultTwo.propertyTwo, 6);
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
