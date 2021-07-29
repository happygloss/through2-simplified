import { Buffer } from 'buffer'
import { ConcatChunk } from '../concat'
import { inferEncoding, ConcatStreamEncoding } from './infer-encoding'
import { getStringFromBytes, isNotUTF8 } from 'utf-8'

export type BufferConvertableChunk = Parameters<typeof Buffer.from>[0]
const bufferCompatibleEncoding = [
  ConcatStreamEncoding.u8,
  ConcatStreamEncoding.buffer,
  ConcatStreamEncoding.string
]

/**
 * @description Checks if a value can be converted to UTF-8
 * @param {any[]} chunk A value
 * @returns {boolean} true if the chunk is utf-8, false if the chunk is utf-8.
 */
export function isUTF8(chunk: unknown[]): boolean {
  return !isNotUTF8(chunk as number[])
}

/**
 * @description A type guard for any chunk that can be converted to Buffer.
 * @param {ConcatChunk} chunk A chunk
 * @returns {boolean} Returns true if a Uint8array, String or Buffer is presented
 */
export function canBeConvertedToBuffer(
  chunk: ConcatChunk
): chunk is BufferConvertableChunk {
  return (
    (Array.isArray(chunk) &&
      (isUTF8(chunk) || chunk.every(canBeConvertedToBuffer))) ||
    bufferCompatibleEncoding.includes(inferEncoding(chunk))
  )
}
/**
 * @description Concat multiple chunks to a buffer.
 * @param {any[]} chunks An array of chunks
 * @returns {Buffer} A buffer concatenated with one or more chunks.
 */
export function bufferConcat(chunks: unknown[]): Buffer {
  const updatedChunks = chunks
    .map((chunk) =>
      Array.isArray(chunk) ? convertArrayToBuffer(chunk) : chunk
    )
    .filter(canBeConvertedToBuffer)
    .map((chunk) => Buffer.from(chunk))

  return Buffer.concat(updatedChunks)
}

/**
 * @description Converts all chunks to buffers and converts them to a string.
 * @param {any} chunks An array of chunks
 * @returns {string} A string concatenated from all the chunks
 */
export function stringConcat(chunks: unknown[]): string {
  return bufferConcat(chunks).toString('utf8')
}

/**
 * @description Convert an array of data to the buffer.
 * @param {any[]} value An array of buffer compatible data.
 * @returns {Buffer} A Buffer.
 */
export function convertArrayToBuffer(value: unknown[]): Buffer {
  if (isUTF8(value)) return Buffer.from(getStringFromBytes(value as number[]))
  else {
    return Buffer.concat(
      value.filter(canBeConvertedToBuffer).map((chunk) => Buffer.from(chunk))
    )
  }
}

/**
 * @description Converts a buffer to Uint8Array.
 * @param {Buffer} buffer A Buffer.
 * @returns {Uint8Array} A Uint8Array
 */
export function convertBufferToUint8Array(buffer: Buffer): Uint8Array {
  const len: number = buffer.length
  const a = new Uint8Array(len)

  for (let i = 0; i < buffer.length; i++) a[i] = buffer[i] as number
  return a
}

/**
 * @description Concatenate chunks to return a Uint8Array
 * @param {any[]} chunks An array of chunks
 * @returns {Uint8Array} a Uint8Array that is a result of concatenating the chunks.
 */
export function u8Concat(chunks: unknown[]): Uint8Array {
  const buffer = bufferConcat(chunks)
  return convertBufferToUint8Array(buffer)
}
