import { describe, expect, it } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import from2, { obj } from '../src/from/index'
import { fromFn, fromArray } from '../src/from/from2'
import { FromCallback } from '../src/from/stream-class'

const tmp = path.resolve(__dirname, 'tmp.txt')

function readNo(_: number, next: FromCallback): void {
  process.nextTick(function () {
    next(null, 'no')
  })
}

describe('fromFn', () => {
  it('destroy', (done) => {
    const stream = fromFn(readNo)

    stream
      .on('data', function (_: string) {
        expect(false).toBe(true)
      })
      .on('close', function () {
        expect(true).toEqual(true)
        done()
      })

    stream.destroy()
  })
})

describe('fromArray', () => {
  it('arrays', (done) => {
    const input = ['a', 'b', 'c']
    const stream = fromArray(input)
    const output: string[] = []

    stream.on('data', function (letter: Buffer | string) {
      output.push(letter.toString())
    })

    stream.on('end', function () {
      expect(input).toEqual(output)
      done()
    })
  })

  it('arrays can emit errors', (done) => {
    const input = ['a', 'b', new Error('ooops'), 'c']
    const stream = fromArray(input)
    const output: string[] = []

    stream.on('data', function (letter: string | Buffer) {
      output.push(letter.toString())
    })

    stream.on('error', function (e) {
      expect(['a', 'b']).toEqual(output)
      expect('ooops').toEqual(e.message)
      done()
    })

    stream.on('end', function () {
      throw new Error('the stream should have errored')
    })
  })

  it('obj arrays', (done) => {
    const input: Array<Record<string, string>> = [
      { foo: 'a' },
      { foo: 'b' },
      { foo: 'c' }
    ]

    const stream = fromArray(input, { objectMode: true })
    const output: Array<Record<string, string>> = []

    stream.on('data', function (letter) {
      output.push(letter)
    })

    stream.on('end', function () {
      expect(input).toEqual(output)
      done()
    })
  })

  it('obj arrays can emit errors', (done) => {
    const input: Array<Record<string, string> | Error> = [
      { foo: 'a' },
      { foo: 'b' },
      new Error('ooops'),
      { foo: 'c' }
    ]

    const stream = fromArray(input, { objectMode: true })
    const output: Array<Record<string, string>> = []

    stream.on('data', function (letter) {
      output.push(letter)
    })

    stream.on('error', function (e) {
      expect([{ foo: 'a' }, { foo: 'b' }]).toEqual(output)
      expect(e.message).toEqual('ooops')
      done()
    })
    stream.on('end', function () {
      expect(true).toEqual(false)
    })
  })
})

describe('from2', () => {
  it('from2', (done) => {
    const contents = fs.readFileSync(__filename, 'utf8')
    const stream = from2(contents)

    stream.pipe(fs.createWriteStream(tmp)).on('close', function () {
      expect(fs.readFileSync(tmp, 'utf8')).toEqual(contents)
      fs.unlinkSync(tmp)
      done()
    })
  })

  it('old mode', (done) => {
    const contents = fs.readFileSync(__filename, 'utf8')
    const stream = from2(contents)
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

  it('destroy', (done) => {
    const stream = from2(function (size: number, next: FromCallback): void {
      process.nextTick(function () {
        next(null, 'no')
      })
    } as unknown)

    stream
      .on('data', function (data) {
        expect(false).toBe(true)
      })
      .on('close', function () {
        expect(true).toEqual(true)
        done()
      })

    stream.destroy()
  })

  it('arrays', (done) => {
    const input = ['a', 'b', 'c']
    const stream = from2(input)
    const output = []

    stream.on('data', function (letter: Buffer | string) {
      output.push(letter.toString())
    })

    stream.on('end', function () {
      expect(input).toEqual(output)
      done()
    })
  })

  it('arrays can emit errors', (done) => {
    const input = ['a', 'b', new Error('ooops'), 'c']
    const stream = from2(input)
    const output = []

    stream.on('data', function (letter: string | Buffer) {
      output.push(letter.toString())
    })

    stream.on('error', function (e) {
      expect(['a', 'b']).toEqual(output)
      expect('ooops').toEqual(e.message)
      done()
    })
    stream.on('end', function () {
      throw new Error('the stream should have errored')
    })
  })
})

describe('obj', () => {
  it('obj arrays', (done) => {
    const input: Array<Record<string, string>> = [
      { foo: 'a' },
      { foo: 'b' },
      { foo: 'c' }
    ]
    const stream = obj(input)
    const output: Array<Record<string, string>> = []

    stream.on('data', function (letter: Record<string, string>) {
      output.push(letter)
    })

    stream.on('end', function () {
      expect(input).toEqual(output)
      done()
    })
  })

  it('obj arrays can emit errors', (done) => {
    const input = [{ foo: 'a' }, { foo: 'b' }, new Error('ooops'), { foo: 'c' }]
    const stream = obj(input)
    const output: Array<Record<string, string>> = []

    stream.on('data', function (letter: Record<string, string>) {
      output.push(letter)
    })

    stream.on('error', function (e) {
      expect([{ foo: 'a' }, { foo: 'b' }]).toEqual(output)
      expect(e.message).toEqual('ooops')
      done()
    })

    stream.on('end', function () {
      expect(true).toEqual(false)
    })
  })
})
