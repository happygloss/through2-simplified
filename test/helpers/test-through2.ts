import { TransformOptions } from 'stream'
import Through2, { _Transform, _Flush } from '../../src/through2'

export class TestThrough2 extends Through2 {
  // represents the ASCII code for a
  private _i = 96
  constructor(
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    options: TransformOptions = {},
    flush?: _Flush
  ) {
    super(transform, options, flush)
  }

  /**
   * @description Getter for _i property.
   * @returns {number} returns this._i
   */
  getI(): number {
    return this._i
  }

  /**
   * @description Setter for _i property.
   * @param {number} _i Value to set for _i.
   * @returns {void}
   */
  setI(_i = 96): void {
    this._i = _i
  }
}
