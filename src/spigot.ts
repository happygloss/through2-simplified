import { Readable, ReadableOptions } from 'stream'

export type _Read = Readable['_read']

export class Spigot extends Readable {
  private data: unknown[]
  constructor(data: unknown[] = [], options: ReadableOptions = {}) {
    super(options)
    this.data = [...data]
  }

  getData(): unknown[] {
    return this.data
  }

  setData(data: unknown[]): void {
    this.data = data
  }

  override _read(_: number): void {
    setImmediate(() => {
      let value = this.data.shift()
      if (value === undefined) {
        value = null
      }

      this.push(value)
    })
  }
}

/**
 * @description A stream that pushes data from an array downstream
 * @param {any[]} data An array of data
 * @param {ReadableOptions} options Readable stream options
 * @returns {Spigot} A Readable Stream
 */
export default function spigot(
  data: unknown[],
  options: ReadableOptions = {}
): Spigot {
  return new Spigot(data, options)
}
