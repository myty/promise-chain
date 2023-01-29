import {
  assert,
  assertEquals,
  assertRejects,
  assertSpyCalls,
  spy,
} from "./deps.ts";
import PromiseChain from "./promise-chain.ts";
import { TestClassWithException } from "./stubs/test-class-with-exceptions.ts";
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
  const result = await PromiseChain(testClass)
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

Deno.test(function whenComposableAsyncItIsPromiseLike() {
  // Arrange
  const testClass = new TestClass();

  // Act
  const result = PromiseChain(testClass);

  // Assert
  assert("then" in result && typeof result.then === "function");
  assert("catch" in result && typeof result.catch === "function");
  assert("finally" in result && typeof result.finally === "function");
});

Deno.test(async function whenChainedPromiseIsReusedItReturnsCachedResult() {
  // Arrange
  const testClass = new TestClass();
  const durationExpectedMs = 250;
  const resultTask = PromiseChain(testClass)
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

Deno.test(function whenPromiseChainHasExceptionItIsRejected() {
  // Arrange
  const testClassWithException = new TestClassWithException();

  // Act, Assert
  assertRejects(() => PromiseChain(testClassWithException).throwException());
});

Deno.test(async function whenPromiseChainHasExceptionItIsCaught() {
  // Arrange
  const catchSpy = spy();
  const testClassWithException = new TestClassWithException();

  // Act
  await PromiseChain(testClassWithException)
    .throwException()
    .catch(catchSpy);

  // Assert
  assertSpyCalls(catchSpy, 1);
});

Deno.test(async function whenPromiseChainPromiseIsFinalized() {
  // Arrange
  const finallySpy = spy();
  const testClass = new TestClass();

  // Act
  await PromiseChain(testClass)
    .asyncIncrementOne()
    .finally(finallySpy);

  // Assert
  assertSpyCalls(finallySpy, 1);
});
