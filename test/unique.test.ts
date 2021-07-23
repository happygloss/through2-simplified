import { describe, expect, it, jest } from '@jest/globals'
import spigot from '../src/spigot'
import UniqueFilter, { make, obj } from '../src/unique'
import {
  createSourceWithData,
  objectStreamToArray,
  streamToArray
} from './helpers'

describe('UniqueFilter', () => {
  it('filters a stream of strings', async () => {
    const data = ['A', 'B', 'A', 'A', 'C', 'B', 'D', 'D']
    const expected = ['A', 'B', 'C', 'D']

    jest.useFakeTimers('legacy')
    const source = spigot(data)
    const stream = new UniqueFilter<string>()

    source.pipe(stream)
    jest.runAllImmediates()

    const actual = await streamToArray(stream)
    jest.useRealTimers()
    expect(actual).toEqual(expected)
  })

  it('sets a keystore on the filter', async () => {
    const data = ['A', 'C', 'B', 'F', 'D', 'L']
    const store = new Set(['A', 'C'])

    const stream = make<string>()
    stream.setKeyStore(store)

    stream.options = { wantsStrings: true }
    expect(stream.getKeyStore()).toEqual(store)

    jest.useFakeTimers('legacy')
    const source = spigot(data)

    source.pipe(stream)
    jest.runAllImmediates()

    const actual = await streamToArray(stream)

    expect(actual).toEqual(['B', 'F', 'D', 'L'])
    expect(stream.getKeyStore()).toEqual(
      new Set(['A', 'C', 'B', 'F', 'D', 'L'])
    )
  })

  it('filters a stream of objects using stringify', async () => {
    const data = [
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Blake',
        lastName: 'McLucas'
      }
    ]

    const expected = [
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Blake',
        lastName: 'McLucas'
      }
    ]

    const source = createSourceWithData(data, true)
    const sink = new UniqueFilter(new Set(), {
      objectMode: true,
      wantsStrings: false
    })

    source.pipe(sink)
    const actual = await objectStreamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('filters a stream of objects using obj shorthand', async () => {
    const data = [
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Blake',
        lastName: 'McLucas'
      }
    ]

    const expected = [
      {
        firstName: 'Mitchell',
        lastName: 'Niland'
      },
      {
        firstName: 'Sofia',
        lastName: 'Howden'
      },
      {
        firstName: 'Blake',
        lastName: 'McLucas'
      }
    ]

    const source = createSourceWithData(data, true)
    const sink = obj()

    source.pipe(sink)
    const actual = await objectStreamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('filters a stream by key given a stream of objects', async () => {
    const data = [
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Hydra'
      },
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Treadstone'
      },
      {
        id: '8233297f-923c-43e9-a744-2c64ac232cc1',
        project: 'Hydra'
      },
      {
        id: 'ee13e159-04d4-4503-9128-9b6d59bdff34',
        project: 'Renegade'
      }
    ]

    const expected = [
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Hydra'
      },
      {
        id: '8233297f-923c-43e9-a744-2c64ac232cc1',
        project: 'Hydra'
      },
      {
        id: 'ee13e159-04d4-4503-9128-9b6d59bdff34',
        project: 'Renegade'
      }
    ]

    const source = createSourceWithData(data, true)
    const sink = make(
      new Set(),
      { objectMode: true, wantsStrings: false },
      'id'
    )

    source.pipe(sink)

    const actual = await objectStreamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('filters a stream with a propName set after creating the stream', async () => {
    const data = [
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Hydra'
      },
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Treadstone'
      },
      {
        id: '8233297f-923c-43e9-a744-2c64ac232cc1',
        project: 'Hydra'
      },
      {
        id: 'ee13e159-04d4-4503-9128-9b6d59bdff34',
        project: 'Renegade'
      },
      {
        id: '07b82eac-3b13-4e85-b96a-7895081839e3',
        project: 'Renegade'
      }
    ]

    const expected = [
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Hydra'
      },
      {
        id: '1377f0a6-aa99-4c57-9f54-57698f6f2c0f',
        project: 'Treadstone'
      },
      {
        id: 'ee13e159-04d4-4503-9128-9b6d59bdff34',
        project: 'Renegade'
      }
    ]

    const source = createSourceWithData(data, true)

    const sink = obj(new Set(), { wantsStrings: false })
    sink.setPropName('project')

    source.pipe(sink)

    const actual = await objectStreamToArray(sink)
    expect(actual).toEqual(expected)
  })
})
