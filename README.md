# Chainable

Utility class to wrap classes that are meant for method chaining, specifically useful for functions that return Promises. Promise functions and non-promise functions can be mixed.

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
    increment: number
  ): Promise<TestClass> {
    return new TestClass({
      ...this,
      [property]: await Promise.resolve(this[property] + increment),
    });
  }
}

const {propertyOne, propertyTwo} = await Chaninable.create(testClass)
    .asyncIncrement("propertyOne", 3)
    .asyncIncrement("propertyTwo", 5)
    .value();

console.log(`Result: propertyOne=${propertyOne}, propertyTwo=${propertyTwo}`);
// OUTPUT: "Result: propertyOne=3, propertyTwo=5"
```
