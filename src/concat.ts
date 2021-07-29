import { Writable, WritableOptions } from 'stream'
import { BufferEncoding } from '.'
import {
  bufferConcat,
  ConcatStreamEncoding,
  inferEncoding,
  stringConcat,
  u8Concat
} from './utils'

export type Callback = (error?: Error | null, data?: unknown) => void
export type ConcatChunk = unknown

const uint8ArrayEncodings = [
  ConcatStreamEncoding.u8,
  ConcatStreamEncoding.uint8
]

export default class ConcatStream extends Writable {
  private shouldInferEncoding = false
  private body: ConcatChunk[] = []
  private encoding?: ConcatStreamEncoding

  constructor(
    options: WritableOptions = { objectMode: true },
    encoding?: ConcatStreamEncoding
  ) {
    const writableOptions = { ...options, objectMode: true }
    super(writableOptions)

    if (encoding == null) this.shouldInferEncoding = true
    else if (uint8ArrayEncodings.includes(encoding)) {
      this.encoding = ConcatStreamEncoding.uint8array
    }

    if (encoding != null) {
      this.encoding = encoding
    }
  }

  getBody(): Buffer | string | unknown[] | Uint8Array {
    const encoding = this.getEncoding()
    if (encoding != null && this.body.length === 0) return []

    const sample = this.body[0]

    if (this.shouldInferEncoding) this.encoding = inferEncoding(sample)
    if (this.encoding === 'array') return ([] as unknown[]).concat(...this.body)
    if (this.encoding === 'string') return stringConcat(this.body)
    if (this.encoding === 'buffer') return bufferConcat(this.body)
    if (this.encoding === 'uint8array') return u8Concat(this.body)
    return this.body
  }

  setBody(body: ConcatChunk[]): void {
    this.body = body
  }

  getEncoding(): ConcatStreamEncoding | undefined {
    return this.encoding
  }

  setEncoding(encoding: ConcatStreamEncoding): void {
    this.encoding = encoding
    this.shouldInferEncoding = false
  }

  override _write(chunk: unknown, _: BufferEncoding, callback: Callback): void {
    this.body.push(chunk)
    callback()
  }
}

/**
 * @description Creates a concat stream that calls the callback when it's finished.
 * @param {Callback} callback Callback invoked when the stream ends.
 * @param {WritableOptions} [options] Options to be provided to the stream, must set `objectMode: true`
 * @param {ConcatStreamEncoding} [encoding] Chunk Encoding
 * @returns {ConcatStream} A concat stream.
 */
export function concatWithCallback(
  callback: Callback,
  options: WritableOptions = { objectMode: true },
  encoding?: ConcatStreamEncoding
): ConcatStream {
  let stream: ConcatStream
  if (encoding != null) {
    stream = new ConcatStream(options, encoding)
  } else {
    stream = new ConcatStream(options)
  }

  stream.on('finish', () => {
    callback(null, stream.getBody())
  })

  stream.on('error', (err) => {
    callback(err)
  })

  return stream
}
