declare module "stream-spigot" {
  import { Readable, ReadableOptions } from "stream";
  type ReadableConstructor = typeof Readable;
  type _Read = Readable["_read"];

  function ctor<T = any>(arr: T[]): Readable;
  function ctor(options: ReadableOptions, _read: _Read): ReadableConstructor;
  function ctor<T = any>(
    options: ReadableOptions,
    arr: T[]
  ): ReadableConstructor;

  function array<T = any>(options: ReadableOptions, array: T[]): Readable;
  function sync<T = any>(options: ReadableOptions, fn: () => T): Readable;

  function make(options: ReadableOptions, _read: _Read): Readable;
  function make<T = any>(options: ReadableOptions, arr: T[]): Readable;
  function make<T = any>(arr: T[]): Readable;

  export default make;
  export { ctor, array, sync };
}
