import { ConcatChunk } from '../concat'

export enum ConcatStreamEncoding {
  array = 'array',
  buffer = 'buffer',
  string = 'string',
  object = 'object',
  u8 = 'uint8array',
  uint8 = 'uint8array',
  uint8array = 'uint8array'
}

/**
 * @description Infer the encoding based on a single chunk
 * @param {any} buff A chunk
 * @returns {ConcatStreamEncoding} Compatible Encoding supported by ConcatStream
 */
export function inferEncoding(buff: ConcatChunk): ConcatStreamEncoding {
  if (Buffer.isBuffer(buff)) return ConcatStreamEncoding.buffer
  if (buff instanceof Uint8Array) return ConcatStreamEncoding.uint8array
  if (Array.isArray(buff)) return ConcatStreamEncoding.array
  if (typeof buff === 'string') return ConcatStreamEncoding.string
  if (typeof buff === 'object') return ConcatStreamEncoding.object
  return ConcatStreamEncoding.buffer
}
