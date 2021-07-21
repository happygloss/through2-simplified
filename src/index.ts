import { Transform, TransformOptions } from 'stream'

export type _Transform = Transform['_transform']
export type _Flush = Transform['_flush']
export type BufferEncoding =
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

export default class Through2 extends Transform {
  constructor(
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    public options: TransformOptions = {},
    flush?: _Flush
  ) {
    super(options)

    this._transform = transform.bind(this)
    if (flush != null) this._flush = flush.bind(this)

    if (options.objectMode === true && options.highWaterMark != null) {
      options.highWaterMark = 16
    }
  }

  /**
   * @description Convenience method to create a `Through2` instance.
   * @param {void} this Static method, does not use this.
   * @param {_Transform} transform `_transform` method to be implemented for TransformStream.
   * @param {TransformOptions} [options={}] Transform stream options.
   * @param {_Flush} [flush] _flush method to be implemented for Transform stream.
   * @returns {Through2} creates a Through2 transform stream with the implementation details.
   */
  static make(
    this: void,
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    options: TransformOptions = {},
    flush?: _Flush
  ): Through2 {
    return new Through2(transform, options, flush)
  }

  /**
   * @description Convenience method to create a Through2 stream with object mode enabled.
   * @param {void} this Static method, does not use this.
   * @param {_Transform} transform `_transform` method to be implemented for TransformStream.
   * @param {TransformOptions} [overrides={}] Transform stream options.
   * @param {_Flush} [flush] _flush method to be implemented for Transform stream.
   * @returns {Through2} creates an object mode Through2 transform stream with the implementation details.
   */
  static obj(
    this: void,
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    overrides: TransformOptions = {},
    flush?: _Flush
  ): Through2 {
    const options: TransformOptions = {
      objectMode: true,
      highWaterMark: 16,
      ...overrides
    }

    return new Through2(transform, options, flush)
  }
}

const make = Through2.make
const obj = Through2.obj

export type Ctor = typeof Through2 & {
  new: (options: TransformOptions & Record<string, unknown>) => Through2
}

/**
 * @description Creates a subclass of `Through2` with the provided function params as the constructor params. The constructor can override the options.
 * @param {string} name Name of the sub-class to be returned.
 * @param {_Transform} transform `_transform` method to be implemented for TransformStream.
 * @param {TransformOptions} [options={}] Transform stream options.
 * @param {_Flush} [flush] _flush method to be implemented for Transform stream.
 * @returns {Through2} a named sub-class of Through2 with an optional options parameter.
 * @class
 */
function ctor(
  name: string,
  transform: _Transform,
  options: TransformOptions & Record<string, unknown> = {},
  flush?: _Flush
): Ctor {
  const c = class extends Through2 {
    constructor(overrides: TransformOptions & Record<string, unknown> = {}) {
      const updatedOptions = { ...options, ...overrides }
      super(transform, updatedOptions, flush)
    }
  }

  Object.defineProperty(c, 'name', { value: name })

  return c as Ctor
}

export { make, obj, ctor }
