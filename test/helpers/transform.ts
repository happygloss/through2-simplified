import { expect } from '@jest/globals'
import { Transform, TransformCallback } from 'stream'
import Through2, { BufferEncoding } from '../../src/through2'
import { TestThrough2 } from './test-through2'

export interface UnderscoreI {
  _i?: number
}

export interface Chunk {
  in: number
}

/**
 * @description Receives Buffers from the producer and sends a buffer to the consumer based on the length of the chunk received and the ASCII value of `this._i`
 * @param {TestThrough2} this TestThrough2 is a subclass of Through2 with an _i property added.
 * @param {Buffer} chunk a chunk received from producer.
 * @param {BufferEncoding} _ unused encoding param.
 * @param {TransformCallback} callback Callback indicating that the next chunk can be processed.
 * @returns {void}
 */
export function transform(
  this: TestThrough2,
  chunk: Buffer,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  const chunkLength = chunk.length
  const buffer = Buffer.alloc(chunkLength)

  const previousValue = this.getI()
  this.setI(previousValue + 1)

  for (let i = 0; i < chunkLength; i++) {
    buffer[i] = this.getI()
  }
  this.push(buffer)
  callback()
}

/**
 * @template T
 * @description Receives Buffers from the producer and sends a buffer to the consumer based on the length of the chunk received and the ASCII value of `this._i`
 * @param {T} this TestThrough2 is a subclass of Through2 with an _i property added.
 * @param {Buffer} chunk a chunk received from producer.
 * @param {BufferEncoding} _ unused encoding param.
 * @param {TransformCallback} callback Callback indicating that the next chunk can be processed.
 * @returns {void}
 */
export function ctorTransform<T extends Transform & UnderscoreI>(
  this: T,
  chunk: Buffer,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  const chunkLength = chunk.length
  const buffer = Buffer.alloc(chunkLength)

  if (this._i == null) this._i = 97
  else this._i++

  for (let i = 0; i < chunkLength; i++) {
    buffer[i] = this._i
  }
  this.push(buffer)
  callback()
}

/**
 * @description Transform implementation for a stream receiving `Chunk` in objectMode.
 * @param {Through2} this A transform stream with a transform implementation provided as a constructor arg. Must be in object mode for the function.
 * @param {Chunk} chunk An object
 * @param {BufferEncoding} _ unused encoding param.
 * @param {TransformCallback} callback Callback indicating that the next chunk can be processed.
 * @returns {void}
 */
export function transformObj(
  this: Through2,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  this.push({
    out: chunk.in + 1
  })
  callback()
}

/**
 * @description Transform implementation for a stream that allows for custom options to be passed in receiving `Chunk` in objectMode.
 * @param {Through2} this A transform stream with a transform implementation provided as a constructor arg. Must be in object mode for the function.
 * @param {Chunk} chunk An object
 * @param {BufferEncoding} _ unused encoding param.
 * @param {TransformCallback} callback Callback indicating that the next chunk can be processed.
 * @returns {void}
 */
export function transformObjWithCustomOptions(
  this: Through2,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  const options = this.options as Record<string, string>
  expect(options.peek).toEqual(true)
  this.push({
    out: chunk.in + 1
  })
  callback()
}
