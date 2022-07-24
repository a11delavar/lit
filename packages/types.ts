/* eslint-disable @typescript-eslint/no-unused-vars */
type AbstractConstructor<T> = abstract new (...args: Array<any>) => T;
type Constructor<T> = new (...args: Array<any>) => T;