import { Transform, TransformOptions } from "stream";

export type _Transform = Transform["_transform"];
export type _Flush = Transform["_flush"];

export default class Through2 extends Transform {
  private objectMode = false;
  constructor(
    transform: _Transform = (chunk, _, cb) => cb(null, chunk),
    public options: TransformOptions = {},
    flush?: _Flush
  ) {
    super(options);

    this._transform = transform.bind(this);
    if (flush) this._flush = flush.bind(this);

    if (options.objectMode && !options.highWaterMark) {
      options.highWaterMark = 16;
    }

    if (options.objectMode) {
      this.objectMode = true;
    }
  }

  public getObjectMode() {
    return this.objectMode;
  }

  static make(transform: _Transform, options = {}, flush?: _Flush) {
    return new Through2(transform, options, flush);
  }

  static obj(
    transform: _Transform,
    overrides: TransformOptions = {},
    flush?: _Flush
  ) {
    const options: TransformOptions = {
      objectMode: true,
      highWaterMark: 16,
      ...overrides,
    };

    return new Through2(transform, options, flush);
  }
}

const make = Through2.make;
const obj = Through2.obj;

// create a subclass of Through2 with the provided function params as the constructor params.
// I have made name mandatory because subclasses must have names.
function ctor(
  name: string,
  transform: _Transform,
  options: TransformOptions & Record<string, any> = {},
  flush?: _Flush
) {
  let c = class extends Through2 {
    constructor(
      lastChanceOptions: TransformOptions & Record<string, any> = {}
    ) {
      super(
        transform,
        { ...options, ...lastChanceOptions } as TransformOptions,
        flush
      );
    }
  };

  Object.defineProperty(c, "name", { value: name });

  return c;
}

export { make, obj, ctor };
