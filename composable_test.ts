import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { Composable } from "./composable.ts";
import { TestClass } from "./stubs/test-class.ts";

Deno.test(async function whenTraditionalAsyncChainingItReturnsResult() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = await testClass
    .asyncIncrement("propertyOne", 3)
    .then((t) => t.asyncIncrementTwo())
    .then((t) => t.asyncIncrementOne())
    .then((t) => t.increment("propertyTwo", 5))
    .then((t) => t.increment("propertyOne", 2))
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

Deno.test(function whenComposableAsyncItIsPromise() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = Composable.create(testClass);

  // Assert
  assert(result instanceof Composable);
  assert(result instanceof Promise);
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
