import { describe, expect, it, jest } from '@jest/globals'
import { createWriteStream, readFileSync, unlinkSync } from 'fs'
import * as path from 'path'
import { pipeline as pipelineCb } from 'stream'
import { promisify } from 'util'
import From2 from '../src/from'
import { fromString } from './helpers/readables'

// From2 is not nessecarily is a good idea because it's already been done as Readable.from
// let's see if we can practically replace the from2 npm package with

jest.setTimeout(25_000)
// const finished = promisify(finishedCb)
const pipeline = promisify(pipelineCb)
// const tmp = path.resolve(__dirname, 'tmp.txt')

describe('From2', () => {
  it.skip('reads file contents', async () => {
    const contents = readFileSync(__filename, 'utf8')
    const tmp = path.resolve(__dirname, 'tmp.txt')
    const read = fromString(contents)

    const stream = new From2({}, read)
    const sink = createWriteStream(tmp)

    await pipeline(stream, sink)
    // await finished(sink)
    const actual = readFileSync(tmp, 'utf8')
    expect(actual).toEqual(contents)
    unlinkSync(tmp)

    // finished(sink, (err: ErrnoException | null | undefined) => {
    //   if (err != null) {
    //     console.error('Error occured', err)
    //     done(err)
    //   } else {
    //     const tmp = path.resolve(__dirname, 'tmp.txt')

    //     const actual = readFileSync(tmp, 'utf8')
    //     expect(actual).toEqual(contents)
    //     unlinkSync(tmp)
    //     done()
    //   }
    // })

    // sink.on('close', () => {
    //   const tmp = path.resolve(__dirname, 'tmp.txt')

    //   const actual = readFileSync(tmp, 'utf8')
    //   expect(actual).toEqual(contents)
    //   unlinkSync(tmp)
    //   done()
    // })
  })
})
