import { ReadableOptions, Readable } from 'stream'

export class SimpleBufferListStream extends Readable {
  private readonly store: Uint8Array[] = []
  constructor(options: ReadableOptions = {}) {
    super(options)
  }

  /**
   * @description Concats buffers into a single buffer and sends it to the downstream consumer.
   * @param {number} _  Unused size parameter.
   * @returns {void}
   */
  override _read(_: number): void {
    const b = Buffer.concat(this.store)
    const length = b.length
    const chunk = b.slice(0, length)
    this.push(chunk)
    this.push(null)
  }

  /**
   * @description Appends data to the store.
   * @param {SimpleBufferListStream} this Runs as a method of SimpleBufferListStream class.
   * @param { Buffer | Uint8Array} data Binary data to be appended.
   * @returns {void}
   */
  public append(this: SimpleBufferListStream, data: Buffer | Uint8Array): void {
    const item = Buffer.from(data)
    this.store.push(item)
  }
}
