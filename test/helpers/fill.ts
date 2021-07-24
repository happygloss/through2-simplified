/**
 * @description Takes a value x, a number n and creates an array of length n with each value deep equal to x.
 * @template T
 * @param {T} value A value.
 * @param {number} times The number of times to repeat the value.
 * @returns {T[]} An array with the value repeated n times.
 */
export function fill<T>(value: T, times: number): T[] {
  return Array.from<T>({ length: times }).fill(value)
}

/**
 * @description Takes a string x, n the number of times to repeat it and returns a string with the string x repeated n times.
 * @param {string} value The string to be repeated.
 * @param {number} times The number of times to repeat.
 * @param {string} [seperator=''] seperator to be used when joining multiple strings.
 * @returns {string} A string consistin of the `value` param repeated n times.
 */
export function fillString(
  value: string,
  times: number,
  seperator = ''
): string {
  return fill(value, times).join(seperator)
}
