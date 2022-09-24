import { PromiseChain } from "./promise-chain.ts";
import { TestClass } from "./stubs/test-class.ts";

const iterate = (
  execute: (input: TestClass) => Promise<TestClass>,
) => {
  return async () => {
    await execute(new TestClass());
  };
};

Deno.bench(
  "Traditional Async Chain (1 Step)",
  { group: "1 step", baseline: true },
  iterate((t) => t.asyncIncrement("propertyOne", 3)),
);

Deno.bench(
  "Composable Async Chain (1 Step)",
  { group: "1 step" },
  iterate((t) => PromiseChain.create(t).asyncIncrement("propertyOne", 3)),
);

Deno.bench(
  "Traditional Async Chain (2 Steps)",
  { group: "2 steps", baseline: true },
  iterate((t) =>
    t.asyncIncrement("propertyOne", 3).then((t) =>
      t.increment("propertyTwo", 5)
    )
  ),
);

Deno.bench(
  "Composable Async Chain (2 Steps)",
  { group: "2 steps" },
  iterate((t) =>
    PromiseChain.create(t).asyncIncrement("propertyOne", 3).increment(
      "propertyTwo",
      5,
    )
  ),
);

Deno.bench(
  "Traditional Async Chain (6 Steps)",
  { group: "6 steps", baseline: true },
  iterate((t) =>
    t
      .asyncIncrement("propertyOne", 3)
      .then((t) => t.asyncIncrementTwo())
      .then((t) => t.asyncIncrementOne())
      .then((t) => t.increment("propertyTwo", 5))
      .then((t) => t.increment("propertyOne", 2))
      .then((t) => t.asyncIncrementOne())
  ),
);

Deno.bench(
  "Composable Async Chain (6 Steps)",
  { group: "6 steps" },
  iterate((t) =>
    PromiseChain.create(t)
      .asyncIncrement("propertyOne", 3)
      .asyncIncrementTwo()
      .asyncIncrementOne()
      .increment("propertyTwo", 5)
      .increment("propertyOne", 2)
      .asyncIncrementOne()
  ),
);
