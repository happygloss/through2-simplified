/**
 * @description Create an array of random bytes of length `len`.
 * @param {number} len Number of bytes.
 * @returns {Uint8Array} an array of bytes.
 */
export function randomBytes(len: number): Uint8Array {
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = Math.floor(Math.random() * 0xff)
  }
  return bytes
}

/**
 * @description Generate random data for testing.
 * @returns {Uint8Array[]} an array of random byte arrays.
 */
export function generateData(): Uint8Array[] {
  return [randomBytes(10), randomBytes(5), randomBytes(10)]
}