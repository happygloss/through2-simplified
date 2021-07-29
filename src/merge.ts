import { PassThrough, Stream } from 'stream'

export default class MergeStreams {
  private sources: Stream[] = []
  private readonly output: PassThrough = new PassThrough({ objectMode: true })

  constructor(streams: Stream[]) {
    this.output.on('unpipe', this.remove)
    streams.forEach(this.add)
  }

  getSources = (): Stream[] => this.sources

  setSources = (sources: Stream[]): void => {
    this.sources = sources
  }

  getOutput = (): PassThrough => this.output

  add = (source: Stream): MergeStreams => {
    this.sources.push(source)
    source.once('end', this.remove.bind(null, source))
    source.once('error', this.output.emit.bind(this.output, 'error'))
    source.pipe(this.output, { end: false })
    return this
  }

  addAll = (source: Stream[]): MergeStreams => {
    source.forEach(this.add)
    return this
  }

  isEmpty = (): boolean => this.sources.length === 0
  remove = (source: Stream): void => {
    this.sources = this.sources.filter((it) => it !== source)
    if (this.isEmpty() && this.output.readable) this.output.end()
  }
}

/**
 * @description Create an output merged stream given a list of input stream.
 * @param {Stream[]} streams All the streams to be merged
 * @returns {PassThrough} An output stream with all the streams merged
 */
export function merge(streams: Stream[]): PassThrough {
  return new MergeStreams(streams).getOutput()
}
