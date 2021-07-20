declare module "bl" {
  import { Duplex } from "stream";

  type Callback = (err: Error, value: any) => void;

  export interface BufferListInstance {
    length: number;
    append: (
      buf:
        | Buffer
        | Buffer[]
        | BufferListInstance
        | BufferListInstance[]
        | string
        | Uint8Array
    ) => BufferListInstance;

    get(index: number): number;
    indexOf(value: any, byteOffset?: number, encoding?: BufferEncoding): number;
    slice(start: number, end?: number): Buffer;
    shallowSlice(start: number, end?: number): BufferListInstance;
    copy(
      dest: Buffer,
      dstStart?: number,
      srcStart?: number,
      srcEnd?: number
    ): Buffer;
    duplicate(): BufferListInstance;
    consume(bytes: Buffer): BufferListInstance;
    toString(encoding: BufferEncoding, start?: number, end?: number): string;
  }

  function BufferListConstructor(buf: Buffer): BufferListInstance;

  export { BufferListConstructor as BufferList };
  export default BufferListStreamConstructor;

  function BufferListStreamConstructor(callback?: Callback): BufferListStream;

  export interface BufferListStream extends BufferListInstance, Duplex {
    _callback: Callback;
    _new(callback: Callback): BufferListStream;
    _isBufferList: (b: any) => boolean;
    isBufferList: (b: any) => boolean;
  }
}
