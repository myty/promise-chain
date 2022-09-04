# Composable-Async

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/composable_async)
[![npm version](https://badge.fury.io/js/composable-async.svg)](https://badge.fury.io/js/composable-async)

Wrapper utility class that enables composition via asynchronous (Promises) and
synchronous method chaining.

## Installation

### Node.js

```bash
# npm
npm install --save composable-async
# yarn
yarn add composable-async
# pnpm
pnpm install --save composable-async
```

### Deno

```bash
import { Composable } from "https://deno.land/x/composable_async/mod.ts";
```

## Example Usage

```typescript
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
}

const { propertyOne, propertyTwo } = await Composable.create(testClass)
  .asyncIncrement("propertyOne", 3)
  .asyncIncrement("propertyTwo", 5)
  .value();

console.log(`Result: propertyOne=${propertyOne}, propertyTwo=${propertyTwo}`);
// OUTPUT: "Result: propertyOne=3, propertyTwo=5"
```
