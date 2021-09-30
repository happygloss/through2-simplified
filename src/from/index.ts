// @ts-nocheck

import { ReadableOptions } from 'stream'
// import noop from './noop'
// import arrayToRead from './array-to-read'
import From2, { FromRead, FromCallback } from './stream-class'
// import { fromArray, fromFn } from './from2'
import obj from './obj'
import from2 from './from2'
import range from './range'

function ctor(opts: ReadableOptions | FromRead, read?: FromRead): typeof From2 {
  if (typeof opts === 'function') {
    read = opts
    opts = {}
  }

  opts = defaults(opts)

  return class From2Extended extends From2 {
    constructor(options: ReadableOptions = {}, read: FromRead) {
      super({ ...opts, ...options }, read)
    }
  }
}

export { obj, ctor, From2, range, FromRead, FromCallback }
export default from2

function defaults(opts: ReadableOptions | null): ReadableOptions {
  return opts ?? {}
}
