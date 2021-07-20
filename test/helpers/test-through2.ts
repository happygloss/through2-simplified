import { TransformOptions } from "stream";
import Through2, { _Transform, _Flush } from "../../src";

export class TestThrough2 extends Through2 {
  // represents the ASCII code for a
  private _i: number = 96;
  constructor(
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    options: TransformOptions = {},
    flush?: _Flush
  ) {
    super(transform, options, flush);
  }

  getI() {
    return this._i;
  }
  setI(_i: number = 96) {
    this._i = _i;
  }
}
