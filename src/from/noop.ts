import { FromCallback } from './stream-class'

/**
 * @description Noop, does nothing.
 * @param {number} _1 a number.
 * @param {unknown} _2 unknown.
 * @returns {void} returns undefined.
 */
export default function noop(_1: number, _2: FromCallback): void {
  return undefined
}
