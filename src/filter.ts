import { TransformCallback } from 'stream'
import Through2, { BufferEncoding } from './through2'
import { Chunk, Options } from './map'

export type Predicate = (chunk: Chunk, index: number) => boolean

export default class Through2Filter extends Through2 {
  _index: number
  fn: Predicate
  override options: Options
  constructor(
    fn: Predicate = (_1: Chunk, _2: number) => true,
    options: Options = { wantsStrings: false }
  ) {
    const { wantsStrings, ...transformOptions } = options
    super(transform, transformOptions)

    this.options = options
    this.fn = fn
    this._index = -1

    this._transform = this._transform.bind(this)
  }
}

/**
 * @description Transform that allows for dropping of chunks if it does not satisy the condition.
 * @param {Through2Filter} this Uses the Through2Filter as context
 * @param {Chunk} chunk Chunk received
 * @param {BufferEncoding} _ encoding
 * @param {TransformCallback} callback Callback
 * @returns {void}
 */
export function transform(
  this: Through2Filter,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  const updatedChunk =
    this.options.wantsStrings && Buffer.isBuffer(chunk)
      ? chunk.toString()
      : chunk

  try {
    this._index = this._index + 1
    if (this.fn(updatedChunk, this._index)) {
      this.push(updatedChunk)
    }
    callback()
  } catch (e) {
    callback(e)
  }
}

/**
 * @description Creates a Through2Filter
 * @param {Predicate} fn A function that determines if a chunk needs to be dropped.
 * @param {Options} options Options
 * @returns {Through2Filter} Through2Filter.
 */
export function make(
  fn: Predicate = (_1: unknown, _2: number) => true,
  options: Options = { wantsStrings: false }
): Through2Filter {
  return new Through2Filter(fn, options)
}

/**
 * @description Creates a Through2Filter running in object mode.
 * @param {Predicate} fn A function that determines if a chunk needs to be dropped.
 * @param {Options} options Options
 * @returns {Through2Filter} Through2Filter.
 */
export function obj(
  fn: Predicate = (_1: unknown, _2: number) => true,
  options: Options = {
    wantsStrings: false,
    objectMode: true,
    highWaterMark: 16
  }
): Through2Filter {
  return new Through2Filter(fn, options)
}

type Through2FilterConstructor = typeof Through2Filter

/**
 * @description Creates a dynamic subclass of Through2Filter
 * @param {string} name Name of the subclass
 * @param {Predicate} fn A function that determines if a chunk needs to be dropped.
 * @param {Options} options Options
 * @returns {Through2FilterConstructor} Through2Filter subclass constructor
 */
export function ctor(
  name: string,
  fn: Predicate = (_1: unknown, _2: number) => true,
  options: Options = {
    wantsStrings: false
  }
): Through2FilterConstructor {
  const c = class extends Through2Filter {
    constructor(overrides: Options) {
      const updatedOptions = { ...options, ...overrides }
      super(fn, updatedOptions)
      this._transform = this._transform.bind(this)
    }
  }

  Object.defineProperty(c, 'name', { value: name })

  return c as unknown as Through2FilterConstructor
}
