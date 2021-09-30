import { Readable, ReadableOptions } from 'stream'
import noop from './noop'

export type FromCallback = (
  err: Error | null,
  data: unknown | null
) => undefined | null | boolean

export type FromRead = (size: number, callback: FromCallback) => void

export default class From2 extends Readable {
  private _reading = false

  private readonly _destroyed = false

  private readonly _callback: FromCallback

  private readonly _from: FromRead

  constructor(options: ReadableOptions, read = noop) {
    super(options)
    this._from = read.bind(this)

    // initial readable state, used by _callback.
    const hwm = this.readableHighWaterMark
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this._callback = function check(
      err: Error | null,
      data: unknown
    ): undefined | null | boolean {
      if (self.destroyed) {
        return undefined
      }

      if (err != null) return self.destroy(err) as undefined | null | boolean
      if (data === null) return self.push(null) as undefined | null | boolean
      self._reading = false

      if (self.push(data)) self._read(hwm)
      return undefined
    }
  }

  public getUnderscoreDestroyed = (): boolean => {
    return this._destroyed
  }

  override _read = (size: number): void => {
    if (this._reading || this.destroyed) return
    this._reading = true
    this._from(size, this._callback)
  }

  override destroy = (err?: Error): void => {
    if (this.destroyed) return
    this.destroyed = true

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    process.nextTick(() => {
      if (err != null) self.emit('error', err)
      self.emit('close')
    })
  }
}

// function check(
//   self: From2,
//   hwm: number,
//   err?: Error,
//   data?: unknown
// ): void | boolean {
//   if (self.destroyed) return
//   if (err) return self.destroy(err)
//   if (data === null) return self.push(null)
//   self._reading = false
//   if (self.push(data)) self._read(hwm)
// }

// function Class(override) {
//   if (!(this instanceof Class)) return new Class(override)
//   this._reading = false
//   this._callback = check
//   this.destroyed = false
//   Readable.call(this, override || opts)

//   let self = this
//   let hwm = this._readableState.highWaterMark

//   function check(err, data) {
//     if (self.destroyed) return
//     if (err) return self.destroy(err)
//     if (data === null) return self.push(null)
//     self._reading = false
//     if (self.push(data)) self._read(hwm)
//   }
// }

// Class.prototype._from = read || noop
// Class.prototype._read = function (size) {
//   if (this._reading || this.destroyed) return
//   this._reading = true
//   this._from(size, this._callback)
// }

// Class.prototype.destroy = function (err) {
//   if (this.destroyed) return
//   this.destroyed = true

//   let self = this
//   process.nextTick(function () {
//     if (err) self.emit('error', err)
//     self.emit('close')
//   })
// }
