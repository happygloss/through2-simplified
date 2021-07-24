import { TransformCallback, TransformOptions } from 'stream'
import Through2, { BufferEncoding } from './index'

export type NonObjectChunk = Buffer | string | Uint8Array
export type ObjectChunk = unknown

export type Chunk = NonObjectChunk | ObjectChunk

export type ChunkHandler = (
  this: Through2,
  chunk: Chunk,
  index: number
) => Chunk

export interface Options extends TransformOptions {
  wantsStrings: boolean
}

export class Through2Map extends Through2 {
  fn: ChunkHandler
  _index: number
  override options: Options
  constructor(
    fn: ChunkHandler = (x: Chunk, _: number) => x,
    options: Options = { wantsStrings: false }
  ) {
    const { wantsStrings, ...transformOptions } = options
    super(transform, transformOptions)

    this._index = -1
    this.fn = fn

    this.options = options
    this._transform = this._transform.bind(this)
  }
}

export type Through2MapConstructor = typeof Through2Map

/**
 * @description Create a Through2Map transform stream.
 * @param {ChunkHandler} fn Transform each chunk before pushing it downstream.
 * @param {Options} options Options
 * @returns {Through2Map} instance of Through2Map
 */
export function make(
  fn: ChunkHandler = (x: Chunk, _: number) => x,
  options: Options = { wantsStrings: false }
): Through2Map {
  return new Through2Map(fn, options)
}

/**
 * @description Create a Through2Map transform stream running in objectMode.
 * @param {ChunkHandler} fn Transform each chunk before pushing it downstream.
 * @param {Options} options Options.
 * @returns {Through2Map} instance of Through2Map running in object mode.
 */
export function obj(
  fn: ChunkHandler = (x: Chunk, _: number) => x,
  options: Options = {
    wantsStrings: false,
    objectMode: true,
    highWaterMark: 16
  }
): Through2Map {
  return new Through2Map(fn, options)
}

/**
 * @description Transform for Through2Map.
 * @param {Through2Map} this Context is Through2Map.
 * @param {Chunk} chunk Chunk received.
 * @param {BufferEncoding} _ unused encoding parameter
 * @param {TransformCallback} callback Callback
 */
export function transform(
  this: Through2Map,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  let updatedChunk = chunk
  if (this.options.wantsStrings && Buffer.isBuffer(chunk)) {
    updatedChunk = chunk.toString()
  }

  this._index = this._index + 1
  try {
    const updated = this.fn(updatedChunk, this._index)
    this.push(updated)
    callback()
  } catch (e) {
    callback(e)
  }
}

/**
 * @description Create a dynamic subclass of Through2Map
 * @param {string} name Name of the sub-class.
 * @param {ChunkHandler} fn Transform each chunk before pushing it downstream..
 * @param {Options} ctorOptions Options.
 * @returns {Through2MapConstructor} A dynamic subclass of Through2Map
 */
export function ctor(
  name: string,
  fn: ChunkHandler = (x: Chunk, _: number) => x,
  ctorOptions: Options = { wantsStrings: false }
): Through2MapConstructor {
  const c = class extends Through2Map {
    constructor(overrides: Options = { wantsStrings: false }) {
      const updatedOptions = { ...ctorOptions, ...overrides }
      super(fn, updatedOptions)
      this._transform = this._transform.bind(this)
    }
  }

  Object.defineProperty(c, 'name', { value: name })

  return c as unknown as Through2MapConstructor
}
