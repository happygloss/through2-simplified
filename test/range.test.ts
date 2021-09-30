import { describe, it, expect, jest } from '@jest/globals'
import range from '../src/from/range'

export type TimeoutFn = Parameters<typeof global.setTimeout>[0]
export type Timeout = ReturnType<typeof global.setTimeout>

jest
  .spyOn(global, 'setTimeout')
  .mockImplementation((fn: TimeoutFn): Timeout => {
    fn()
    return {} as unknown as Timeout
  })

describe('range', () => {
  it('creates a stream of numbers from positive integer n decreasing to 0', (done) => {
    const stream = range(5)
    const data: number[] = []

    stream.on('data', (num: number) => {
      data.push(num)
    })

    stream.on('end', () => {
      expect(data).toEqual([4, 3, 2, 1, 0])
      done()
    })
  })

  it('creates a stream of numbers from negative integer n increasing to 0', (done) => {
    const stream = range(-5)
    const data: number[] = []

    stream.on('data', (num: number) => {
      data.push(num)
    })

    stream.on('end', () => {
      expect(data).toEqual([-4, -3, -2, -1, 0])
      done()
    })
  })

  it('terminates if provided with a value of 0', (done) => {
    const stream = range(0)
    const data: number[] = []

    stream.on('data', (num: number) => {
      data.push(num)
    })

    stream.on('end', () => {
      expect(data).toEqual([])
      done()
    })
  })
})
