import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { fromString } from '../src/from/from2'

const tmp = path.resolve(__dirname, 'tmp2.txt')

describe('fromString', () => {
  it('from2', (done) => {
    const contents = fs.readFileSync(__filename, 'utf8')
    const stream = fromString(contents)

    stream.pipe(fs.createWriteStream(tmp)).on('close', function () {
      expect(fs.readFileSync(tmp, 'utf8')).toEqual(contents)
      fs.unlinkSync(tmp)
      done()
    })
  })

  it('old mode', (done) => {
    const contents = fs.readFileSync(__filename, 'utf8')
    const stream = fromString(contents)
    let buffer = ''

    stream
      .on('data', function (data: string) {
        buffer += data
      })
      .on('end', function () {
        expect(buffer).toEqual(contents)
        done()
      })
  })
})
