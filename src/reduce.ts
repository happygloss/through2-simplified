import { Transform, TransformCallback } from 'stream'
import { BufferEncoding } from '.'
import { Chunk, Options } from './map'

export type Reducer = (acc: Chunk, value: Chunk, index: number) => Chunk

export default class Through2Reduce extends Transform {
  private _index: number
  private _reduction?: Chunk
  private fn: Reducer
  private readonly options: Options
  constructor(
    fn: Reducer,
    options: Options = { wantsStrings: false },
    initialValue?: Chunk
  ) {
    const { wantsStrings, ...transformOptions } = options
    super(transformOptions)

    this.fn = fn
    this.options = options
    this._index = -1

    if (initialValue != null) this._reduction = initialValue
  }

  getIndex(): number {
    return this._index
  }

  getInitialValue(): Chunk | undefined {
    return this._reduction
  }

  getOptions(): Options {
    return this.options
  }

  setIndex(index: number): void {
    this._index = index
  }

  setInitialValue(reduction: Chunk): void {
    this._reduction = reduction
  }

  setAccumulatedValue(value: Chunk): void {
    this._reduction = value
  }

  getAccumulatedValue(): Chunk | undefined {
    return this._reduction
  }

  setReducer(fn: Reducer): void {
    this.fn = fn
  }

  override _transform(
    chunk: unknown,
    _: BufferEncoding,
    callback: TransformCallback
  ): void {
    const updatedChunk =
      this.options.wantsStrings && Buffer.isBuffer(chunk)
        ? chunk.toString()
        : chunk

    let reduction = this.getAccumulatedValue()
    const index = this.getIndex() + 1

    if (index === 0 && reduction == null) {
      this.setInitialValue(updatedChunk)
      callback()
    } else {
      try {
        reduction = this.fn(reduction, updatedChunk, index)
        this.setAccumulatedValue(reduction)
        this.setIndex(index)
        callback()
      } catch (e) {
        callback(e)
      }
    }
  }

  override _flush(callback: TransformCallback): void {
    this.push(this._reduction)
    callback()
  }
}

/**
 * @description Creates a stream that reduces all the chunks in the stream using a reducer and emits a single accumulated value
 * @param {Reducer} reducer A reducer function.
 * @param {Options} options Options.
 * @param {Chunk} acc Inital value to act as the accumulator.
 * @returns {Through2Reduce} A stream that reduces chunks to a single value.
 */
export function make(
  reducer: Reducer,
  options: Options = { wantsStrings: false },
  acc?: Chunk
): Through2Reduce {
  return new Through2Reduce(reducer, options, acc)
}

/**
 * @description Creates a stream that reduces all the chunks in the stream of objects using a reducer and emits a single accumulated value
 * @param {Reducer} reducer A reducer function.
 * @param {Options} options Options.
 * @param {Chunk} acc Inital value to act as the accumulator.
 * @returns {Through2Reduce} A stream of objects that reduces chunks to a single value.
 */
export function obj(
  reducer: Reducer,
  options: Options = {
    wantsStrings: false,
    objectMode: true,
    highWaterMark: 16
  },
  acc?: Chunk
): Through2Reduce {
  return new Through2Reduce(reducer, options, acc)
}
