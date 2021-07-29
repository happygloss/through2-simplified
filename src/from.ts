import { Readable, ReadableOptions } from 'stream'

export type Check = (err: Error | null, data: unknown | null) => void
export type From = (size: number, check: Check) => void

/**
 * @description A two parameter noop function.
 * @param {number} _1 Size.
 * @param {Check} _2 Callback.
 * @returns {undefined}.
 */
export function noop(_1: number, _2: Check): void {
  return undefined
}

/**
 * @description Take an array of data and convert it to a `From` which emits each item of the data.
 * @param {any[]} list An array of items.
 * @returns {From} Returns a `From` function from a list of data.
 */
function toFunction(list: unknown[]): From {
  const copy = list.slice()
  return function (_: number, cb: Check): void {
    const item: unknown = copy.length !== 0 ? copy.shift() : null
    item instanceof Error ? cb(item, null) : cb(null, item)
  }
}

export default class From2 extends Readable {
  private _reading = false
  private readonly _callback: Check
  private readonly _from: From

  constructor(options: ReadableOptions = {}, read: From = noop) {
    super(options)
    this._reading = false
    this._callback = this.check as Check
    this.destroyed = false

    this._from = read.bind(this)
  }

  check = (err: Error, data: unknown): void => {
    if (this.destroyed) return
    if (err != null) return this.destroy(err)
    if (data === null) {
      this.push(null)
      this._reading = false
    }

    if (this.push(data)) {
      const highWaterMark = this.readableHighWaterMark
      this._read(highWaterMark)
    }
  }

  override _read = (size: number): void => {
    if (this._reading || this.destroyed) return undefined
    this._reading = true
    this._from(size, this._callback)
  }

  override destroy(err?: Error): void {
    if (this.destroyed) return
    this.destroyed = true

    process.nextTick(() => {
      if (err != null) this.emit('error', err)
      this.emit('close')
    })
  }
}

/**
 * @description Creates a Readable Stream that runs in objectMode.
 * @param {ReadableOptions} [opts] Options.
 * @param {From} [read = noop] Read function
 * @returns {From2} An readable stream running in object mode.
 */
export function obj(opts: ReadableOptions = {}, read: From = noop): From2 {
  return new From2(
    {
      ...opts,
      objectMode: true,
      highWaterMark: 16
    },
    read
  )
}

/**
 * @description Creates a readable stream from an array of scalars.
 * @param {ReadableOptions} options Readable stream Options.
 * @param {any[]} list An array of values to be streamed.
 * @returns {From2} A Readable Stream.s
 */
export function fromArray(
  options: ReadableOptions = {},
  list: unknown[] = []
): From2 {
  return new From2(options, toFunction(list))
}

/**
 * @description Creates a readable stream from an array of objects.
 * @param {ReadableOptions} options Readable stream Options.
 * @param {any[]} list An array of objects to be streamed.
 * @returns {From2} A Readable Stream.
 * */
export function fromArrayObj(
  options: ReadableOptions = {},
  list: unknown[]
): From2 {
  return obj(options, toFunction(list))
}
