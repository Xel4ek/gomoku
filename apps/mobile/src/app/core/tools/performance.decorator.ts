export const accDecorator = function () {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      target.__counter[propertyKey] = target.__counter[propertyKey] ?? {
        time: 0,
        count: -1,
      };
      target.__counter[propertyKey].count++;
      const start = performance.now();
      const res = originalMethod.apply(this, args);
      const end = performance.now();
      target.__counter[propertyKey].time += end - start;
      return res;
    };
    return descriptor;
  };
};

export function counterReporter(logger?: (param?: unknown) => void) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): any {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      target.__counter = {};
      const res = originalMethod.apply(this, args);
      if (logger) {
        logger(`counterReporter: ${JSON.stringify(target.__counter, null, 2)}`);
      }
      return res;
    };
    return descriptor;
  };
}
