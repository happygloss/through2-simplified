import { Check, From } from '../../src/from'

export function fromString(str: string): From {
  let copy = str.slice()
  return function (size: number, next: Check): void {
    if (str.length === 0) return next(null, null)
    const chunk = copy.slice(0, size)
    copy = str.slice(size)
    next(null, chunk)
  }
}
