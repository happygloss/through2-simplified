import { FromCallback, FromRead } from './stream-class'

/**
 * @description An array of data to be converted to From2.
 * @template T
 * @param {T} list An array of data.
 * @returns {FromRead} A read function to be supplied to From2.
 */
export default function arrayToRead<T = string>(list: T[]): FromRead {
  const arr = list.slice()
  return function (_: number, cb: FromCallback) {
    const item = arr.length > 0 ? arr.shift() : null
    item instanceof Error ? cb(item, null) : cb(null, item)
  }
}
