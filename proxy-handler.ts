export class SudoProxyHandler implements ProxyHandler<{}> {
  apply(target: {}, thisArg: any, argArray: any[]): any {
  }

  construct(target: {}, argArray: any[], newTarget: Function): object {
    return undefined;
  }

  defineProperty(
    target: {},
    p: string | symbol,
    attributes: PropertyDescriptor,
  ): boolean {
    return false;
  }

  deleteProperty(target: {}, p: string | symbol): boolean {
    return false;
  }

  get(target: {}, p: string | symbol, receiver: any): any {
  }

  getOwnPropertyDescriptor(
    target: {},
    p: string | symbol,
  ): PropertyDescriptor | undefined {
    return undefined;
  }

  getPrototypeOf(target: {}): object | null {
    return undefined;
  }

  has(target: {}, p: string | symbol): boolean {
    return false;
  }

  isExtensible(target: {}): boolean {
    return false;
  }

  ownKeys(target: {}): ArrayLike<string | symbol> {
    return undefined;
  }

  preventExtensions(target: {}): boolean {
    return false;
  }

  set(
    target: {},
    p: string | symbol,
    value: any,
    receiver: any,
  ): boolean {
    return false;
  }

  setPrototypeOf(target: {}, v: object | null): boolean {
    return false;
  }
}
