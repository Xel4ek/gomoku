//TODO: caching not working fast enough

function memoize() {
  const cache = new Map();
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)  {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      let result;
      const key = args[0].toString();
      if (cache.has(key)) {
        result = cache.get(key);
        // console.log("get from cache", key);
      } else {
        result = originalMethod.apply(this, args);
        cache.set(key, result);
      }
      return result;
    }
  }
}

export default memoize;
