declare module 'bl' {
  import { Duplex } from 'stream'
  type BufferEncoding =
    | 'ascii'
    | 'utf8'
    | 'utf-8'
    | 'utf16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'base64url'
    | 'latin1'
    | 'binary'
    | 'hex'
  type Callback = (err: Error, value: unknown) => void
  type Buf = Buffer | Buffer[] | string | Uint8Array

  export interface BufferListInstance {
    length: number
    append: (
      buf: Buf | BufferListInstance | BufferListInstance[]
    ) => BufferListInstance

    get: (index: number) => number
    indexOf: (
      value: unknown,
      byteOffset?: number,
      encoding?: BufferEncoding
    ) => number
    slice: (start: number, end?: number) => Buffer
    shallowSlice: (start: number, end?: number) => BufferListInstance
    copy: (
      dest: Buffer,
      dstStart?: number,
      srcStart?: number,
      srcEnd?: number
    ) => Buffer
    duplicate: () => BufferListInstance
    consume: (bytes: Buffer) => BufferListInstance
    toString: (encoding: BufferEncoding, start?: number, end?: number) => string
  }

  function BufferListConstructor(buf: Buffer): BufferListInstance

  export { BufferListConstructor as BufferList }
  export default BufferListStreamConstructor

  export interface BufferListStream extends BufferListInstance, Duplex {
    _callback: Callback
    _new: (callback: Callback) => BufferListStream
    _isBufferList: (b: unknown) => boolean
    isBufferList: (b: unknown) => boolean
  }

  function BufferListStreamConstructor(callback?: Callback): BufferListStream
}
