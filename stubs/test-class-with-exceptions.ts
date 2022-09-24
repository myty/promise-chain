export class TestClassWithException {
  throwException(): Promise<TestClassWithException> {
    return Promise.reject();
  }
}
