import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals'
import spigot from '../src/spigot'
import Through2Reduce, { make, obj, Reducer } from '../src/reduce'
import {
  createSourceWithData,
  objectStreamToArray,
  streamToArray
} from './helpers'
import { Readable } from 'stream'
import {
  sum,
  sumUnknowns,
  sort,
  mean,
  meanWidgets,
  Widget
} from './helpers/reducers'

describe('Through2Reduce', () => {
  beforeEach(() => {
    jest.useFakeTimers('legacy')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('called with the reducer only in Buffer/string mode', async () => {
    const source = spigot(['2', '4', '6', '8', '10'])
    const sink = new Through2Reduce(sumUnknowns as unknown as Reducer)

    source.pipe(sink)
    jest.runAllImmediates()

    const [actual] = await streamToArray(sink)
    expect(actual).toEqual('30')
  })

  it('can invoke make with a reducer only to work in Buffer/string mode', async () => {
    const source = spigot(['2', '4', '6', '8', '10'])
    const sink = make(sumUnknowns as unknown as Reducer)

    source.pipe(sink)
    jest.runAllImmediates()

    const [actual] = await streamToArray(sink)
    expect(actual).toEqual('30')
  })

  it('sums numbers', async () => {
    const data = [2, 4, 6, 8, 10]
    const source = spigot(data, { objectMode: true })
    const sink = new Through2Reduce(sum as unknown as Reducer, {
      objectMode: true,
      wantsStrings: false
    })

    source.pipe(sink)
    jest.runAllImmediates()
    const actual = await objectStreamToArray(sink)
    expect(actual[0]).toEqual(30)
  })

  it('sums numbers with an initial value provided', async () => {
    const data = [2, 4, 6, 8, 10]
    const acc = 5

    const source = spigot(data, { objectMode: true })
    const sink = make(
      sum as unknown as Reducer,
      { wantsStrings: false, objectMode: true },
      acc
    )

    source.pipe(sink)
    jest.runAllImmediates()
    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual(35)
  })

  it('computes the mean of an array of numbers using the index', async () => {
    const data = [2, 4, 8, 2, 6, 8, 10, 2]
    const source = spigot(data, { objectMode: true })
    const sink = obj(mean as unknown as Reducer)

    expect(sink.getIndex()).toEqual(-1)
    expect(sink.getAccumulatedValue()).not.toBeDefined()

    source.pipe(sink)
    jest.runAllImmediates()

    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual(5.714285714285714)
  })

  it('computes the mean on a stream of numbers using the index and an initial value', async () => {
    const data = [2, 4, 8, 2, 6, 8, 10]
    const source = spigot(data, { objectMode: true })
    const sink = obj(
      mean as unknown as Reducer,
      { objectMode: true, wantsStrings: false },
      5
    )

    source.pipe(sink)
    jest.runAllImmediates()

    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual(5.714285714285714)
  })

  it('reduces a stream of objects', async () => {
    const data: Widget[] = [
      { time: 1, widgets: 2 },
      { time: 2, widgets: 4 },
      { time: 3, widgets: 8 },
      { time: 4, widgets: 2 },
      { time: 5, widgets: 6 },
      { time: 6, widgets: 8 },
      { time: 7, widgets: 10 },
      { time: 8, widgets: 2 }
    ]

    const source = new Readable({ objectMode: true })
    const sink = obj(meanWidgets as unknown as Reducer)
    sink.setInitialValue({
      widgets: 0,
      time: 0
    })

    source.pipe(sink)

    for (const widget of data) {
      source.push(widget)
    }

    source.push(null)

    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual({
      time: 8,
      widgets: 5.25
    })
  })

  it('uses wantsStrings and sorts the strings in order', async () => {
    const data = ['Cat', 'Dog', 'Bird', 'Rabbit', 'Elephant']
    const source = spigot(data)
    const sink = make(sort as unknown as Reducer, { wantsStrings: true })

    source.pipe(sink)
    jest.runAllImmediates()

    const [actual] = await streamToArray(sink)
    expect(actual).toEqual('Bird')
  })

  it('changes the reducer after initialization of the class', async () => {
    const data = [2, 4, 8, 2, 6, 8, 10, 2]
    const sink = obj(sum as unknown as Reducer)

    // assume that there were three values: 12, 12, 12 (or any three values totalling 36) were previously processed.
    sink.setInitialValue(12)
    sink.setIndex(2)
    sink.setReducer(mean as unknown as Reducer)
    // calculated the mean from the data based on the assumption
    const expected = [12, 12, 12, ...data].reduce(mean)

    const source = createSourceWithData(data, true)
    source.pipe(sink)

    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('emits an error event if an error occurs', (done) => {
    const source = createSourceWithData([2, 4, 'Foo', 2, 6, 8, 10, 2], true)

    const sink = obj(sumUnknowns as unknown as Reducer)
    sink.setInitialValue(0)

    source.pipe(sink)

    sink.on('error', (error) => {
      expect(error.message).toEqual('Expected number, received: Foo')
      done()
    })
  })

  it('options can be updated after the stream is created', async () => {
    const sink = make(sum as unknown as Reducer, {
      objectMode: true,
      wantsStrings: false
    })
    const source = createSourceWithData([2, 4, 6, 8, 10], true)

    expect(sink.getInitialValue()).not.toBeDefined()
    expect(sink.getOptions()).toEqual({
      objectMode: true,
      wantsStrings: false
    })

    source.pipe(sink)

    const [actual] = await objectStreamToArray(sink)
    expect(actual).toEqual(30)
  })
})
