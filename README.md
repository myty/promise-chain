# PromiseChain

[![GitHub version](https://badgen.net/github/release/myty/promise-chain?color=green)](https://github.com/myty/promise-chain)
[![deno land](https://badgen.net/github/release/myty/promise-chain?color=green&label=deno.land)](https://deno.land/x/promise_chain)
[![npm version](https://badgen.net/npm/v/promise-chain?color=green)](https://www.npmjs.com/package/promise-chain)
[![Coverage Status](https://badgen.net/coveralls/c/github/myty/promise-chain?color=green)](https://coveralls.io/github/myty/promise-chain?branch=main)

Wrapper utility class that enables composition via asynchronous (Promises) and
synchronous method chaining.

## Installation

### Node.js

```bash
# npm
npm install --save promise-chain
# yarn
yarn add promise-chain
# pnpm
pnpm install --save promise-chain
```

### Deno

```bash
import { Composable } from "https://deno.land/x/promise_chain/mod.ts";
```

## Example Usage

Provided the following class:

```typescript
class TestClass {
  public readonly propertyOne: number;
  public readonly propertyTwo: number;

  constructor({
    propertyOne = 0,
    propertyTwo = 0,
  }: Partial<TestClass> = {}) {
    this.propertyOne = propertyOne;
    this.propertyTwo = propertyTwo;
  }

  async asyncIncrement(
    property: string,
    increment: number,
  ): Promise<TestClass> {
    return new TestClass({
      ...this,
      [property]: await Promise.resolve(this[property] + increment),
    });
  }

  increment(
    property: string,
    increment: number,
  ): Promise<TestClass> {
    return new TestClass({
      ...this,
      [property]: this[property] + increment,
    });
  }
}
```

Traditionally to chain these methods you would need to do the follwing:

```typescript
const { propertyOne, propertyTwo } = await testClass
  .asyncIncrement("propertyOne", 3)
  .then((t) => t.asyncIncrement("propertyTwo", 5))
  .then((t) => Promise.resolve(t.increment("propertyTwo", 5)));

console.log(`Result: propertyOne=${propertyOne}, propertyTwo=${propertyTwo}`);
// OUTPUT: "Result: propertyOne=3, propertyTwo=10"
```

With PromiseChain, it is simplified and easier to read.

```typescript
const { propertyOne, propertyTwo } = await PromiseChain(testClass)
  .asyncIncrement("propertyOne", 3)
  .asyncIncrement("propertyTwo", 5)
  .increment("propertyTwo", 5);

console.log(`Result: propertyOne=${propertyOne}, propertyTwo=${propertyTwo}`);
// OUTPUT: "Result: propertyOne=3, propertyTwo=10"
```
