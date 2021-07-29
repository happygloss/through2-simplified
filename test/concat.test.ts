import { describe, it, expect, jest } from '@jest/globals'
import { finished as finishedCb } from 'stream'
import { promisify } from 'util'
import ConcatStream, { Callback, concatWithCallback } from '../src/concat'
import { ConcatStreamEncoding } from '../src/utils'

import { exec as execCb, spawn } from 'child_process'
import spigot from '../src/spigot'
import UniqueFilter from '../src/unique'

const finished = promisify(finishedCb)
const exec = promisify(execCb)

describe('Concat Writable stream', () => {
  it('concats a stream of arrays', (done) => {
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.array
    )
    const expected = [1, 2, 3, 4, 5, 6]
    stream.on('finish', () => {
      const actual = stream.getBody()
      expect(actual).toEqual(expected)
      done()
    })

    stream.write([1, 2, 3])
    stream.write([4, 5, 6])
    stream.end()
  })

  it('concats a stream of stringifiable stream', (done) => {
    const expected = 'pizza Array is not a stringy cat'
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.buffer
    )

    stream.on('finish', () => {
      const body = stream.getBody()
      expect(Buffer.isBuffer(body)).toEqual(true)
      expect(body.toString('utf8')).toEqual(expected)
      done()
    })

    stream.write(Buffer.from('pizza Array is not a ', 'utf8'))
    stream.write(Buffer.from('stringy cat'))
    stream.end()
  })

  it('concats a stream of buffers with mixed writes', (done) => {
    const expected = 'pizza Array is not a stringy cat555'
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.buffer
    )

    stream.on('finish', () => {
      const body = stream.getBody()
      expect(Buffer.isBuffer(body)).toEqual(true)

      const actual = body.toString('utf8')
      expect(actual).toEqual(expected)

      done()
    })

    stream.on('error', (err) => {
      done(err)
    })

    stream.write(Buffer.from('pizza'))
    stream.write(' Array is not a ')
    stream.write([115, 116, 114, 105, 110, 103, 121])
    const u8 = new Uint8Array(4)
    u8[0] = 32
    u8[1] = 99
    u8[2] = 97
    u8[3] = 116

    stream.write(u8)

    stream.write('555')
    stream.end()
  })

  it('concats a stream of buffers using a callback', (done) => {
    const expected = 'pizza Array is not a stringy cat'

    const stream = concatWithCallback((err?: Error | null, body?: unknown) => {
      if (err != null) {
        done(err)
      } else {
        if (body != null) {
          expect(Buffer.isBuffer(body)).toEqual(true)

          const actual = (body as Buffer).toString('utf8')
          expect(actual).toEqual(expected)
          done()
        }
      }
    })

    stream.write(Buffer.from('pizza Array is not a ', 'utf8'))
    stream.write(Buffer.from('stringy cat'))
    stream.end()
  })

  it('concats a stream of arrays using a callback, options and encoding', (done) => {
    const expected = [1, 2, 3, 4, 5, 6]

    const callback: Callback = (err?: Error | null, body?: unknown) => {
      if (err != null) {
        done(err)
      } else {
        if (body != null) {
          expect(body).toEqual(expected)
          done()
        }
      }
    }
    const stream = concatWithCallback(
      callback,
      { objectMode: true },
      ConcatStreamEncoding.array
    )

    stream.write([1, 2, 3])
    stream.write([4, 5, 6])
    stream.end()
  })

  it('concats a stream of arrays using a callback and options', (done) => {
    const expected = [1, 2, 3, 4, 5, 6]

    const callback: Callback = (err?: Error | null, body?: unknown) => {
      if (err != null) {
        done(err)
      } else {
        if (body != null) {
          expect(body).toEqual(expected)
          done()
        }
      }
    }
    const stream = concatWithCallback(callback, { objectMode: true })

    stream.write([1, 2, 3])
    stream.write([4, 5, 6])
    stream.end()
  })

  it('creates a concat stream with no data', async () => {
    const stream = new ConcatStream()
    stream.end()
    await finished(stream)
    expect(stream.getBody()).toEqual(Buffer.from([]))
  })

  it('creates a concat stream with an encoding to String', async () => {
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.string
    )

    stream.end()
    await finished(stream)

    expect(stream.getBody()).toEqual([])
  })

  it('creates a stream that concats objects', async () => {
    const expected = [{ foo: 'bar' }, { baz: 'taco' }]
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.object
    )

    stream.write({ foo: 'bar' })
    stream.write({ baz: 'taco' })
    stream.end()

    await finished(stream)

    const actual = stream.getBody()
    expect(actual).toEqual(expected)
  })

  it('creates a stream that infers object encoding', async () => {
    const expected = [{ foo: 'bar' }, { baz: 'taco' }]
    const stream = new ConcatStream()

    stream.write({ foo: 'bar' })
    stream.write({ baz: 'taco' })
    stream.end()

    await finished(stream)

    const actual = stream.getBody()
    expect(actual).toEqual(expected)
  })

  it('ensures the end chunk is included', async () => {
    const expected = 'this is the end'
    const stream = new ConcatStream()
    stream.write('this ')
    stream.write('is the ')
    stream.end('end')

    await finished(stream)

    const actual = stream.getBody()

    expect(actual).toEqual(expected)
  })

  it('creates a stream that reads a string from mixed types', async () => {
    const expected = 'nacho dogs'
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.string
    )

    stream.write('na')
    stream.write(Buffer.from('cho'))
    stream.write([32, 100])

    const u8 = new Uint8Array([111, 103, 115])
    stream.end(u8)

    await finished(stream)
    const actual = stream.getBody()
    expect(actual).toEqual(expected)
  })

  it('creates a stream that concats strings with multi-byte characters', async () => {
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.string
    )

    const snowman = Buffer.from('☃')
    for (let i = 0; i < 8; i++) {
      stream.write(snowman.slice(0, 1))
      stream.write(snowman.slice(1))
    }
    stream.end()

    await finished(stream)

    const expected = '☃☃☃☃☃☃☃☃'
    const actual = stream.getBody()
    expect(actual).toEqual(expected)
  })

  it('creates a string that concats an empty string with other strings', async () => {
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.string
    )

    stream.write('')
    stream.write('nacho ')
    stream.write('dogs')
    stream.end()

    await finished(stream)

    expect(stream.getBody()).toEqual('nacho dogs')
  })

  it('concats a typed array stream', async () => {
    const expected = 'abcde fg xyz'
    const a = new Uint8Array([97, 98, 99, 100, 101])
    const b = new Uint8Array([32, 102, 103])
    const c = new Uint8Array([32, 120, 121, 122])
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.u8
    )

    stream.write(a)
    stream.write(b)
    stream.end(c)
    await finished(stream)

    const actual = Buffer.from(stream.getBody() as Uint8Array).toString('utf8')
    expect(actual).toEqual(expected)
  })

  it('concats strings, arrays and buffer into a typedarray', async () => {
    const expected = 'abcde fg xyz'
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.uint8
    )

    stream.write('abcde')
    stream.write(Buffer.from(' fg '))
    stream.end([120, 121, 122])
    await finished(stream)

    const actual = Buffer.from(stream.getBody() as Uint8Array).toString('utf8')
    expect(actual).toEqual(expected)
  })

  // 29,52,60,93

  it('creates a stream with an already primed body', async () => {
    const stream = new ConcatStream()
    stream.setBody(['th', 'es', 'e '])
    stream.setEncoding(ConcatStreamEncoding.string)

    stream.write('pre')
    stream.write('tzels')
    stream.end()

    await finished(stream)

    const body = stream.getBody()
    expect(body).toEqual('these pretzels')
  })

  it('reads from ls', async () => {
    const cmd = spawn('ls', [__dirname])
    const stream = new ConcatStream()
    cmd.stdout.pipe(stream)

    const { stdout: expected } = await exec('ls ' + __dirname)
    const actual = stream.getBody()
    expect(actual.toString('utf8')).toEqual(expected)
  })

  it('concats data piped from a readable stream', async () => {
    const stream = new ConcatStream(
      { objectMode: true },
      ConcatStreamEncoding.string
    )

    const uniq = new UniqueFilter<string>()

    const input = spigot(['A', 'B', 'A', 'A', 'C', 'B', 'D', 'D'])
    jest.useFakeTimers('legacy')

    input.pipe(uniq).pipe(stream)
    jest.runAllImmediates()

    await finished(stream)

    const body = stream.getBody()
    expect(body).toEqual('ABCD')
  })
})
