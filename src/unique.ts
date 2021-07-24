import stringify from 'fast-json-stable-stringify'
import Through2Filter, { Predicate } from './filter'
import { Options } from './map'

export type UniqueChunk<T> = string | Record<string, T>
export type UniqueChunkPropData<T> = string | T
export type UniqueChunkProp<T> = (
  data: UniqueChunk<T>
) => UniqueChunkPropData<T>

/**
 *
 * @template T
 * @param {string} propName Property name to be used as an object.
 * @returns {UniqueChunkProp<T>} A function that returns the data.
 */
function prop<T = unknown>(propName: string): UniqueChunkProp<T> {
  return function (data: UniqueChunk<T>): UniqueChunkPropData<T> {
    return (data as Record<string, unknown>)[propName] as string
  }
}

export default class UniqueFilter<T> extends Through2Filter {
  constructor(
    private keyStore: Set<T> = new Set(),
    options: Options = { wantsStrings: true },
    private propName?: string
  ) {
    super(() => true, options)
    this.options = options
    this.fn = this.uniqueFilter as Predicate
  }

  getKeyStore(): Set<T> {
    return this.keyStore
  }

  setKeyStore = (store: Set<T>): void => {
    this.keyStore = store
  }

  getPropName(): string | undefined {
    return this.propName
  }

  setPropName(propName: string): void {
    this.propName = propName
  }

  /**
   * @template T
   * @description Unique Filter
   * @param {UniqueChunk<T>} chunk A chunk is either string or an object. Buffers would have to be converted to a string.
   * @returns {boolean} Returns false if the chunk must be skipped.
   */
  uniqueFilter = (chunk: UniqueChunk<T>): boolean => {
    const propName = this.getPropName()

    let keyFn = propName != null ? prop(propName) : stringify
    if (typeof chunk === 'string') keyFn = (x: unknown) => x

    const key = keyFn(chunk) as T
    const keyStore = this.getKeyStore()

    if (keyStore.has(key)) return false

    keyStore.add(key)
    return true
  }
}

/**
 * @description Creates a unique stream with a keyStore, options and a propName.
 * @template T
 * @param {Set<T>} keyStore A Set to act as the key store.
 * @param {Options} options Options
 * @param {string} [propName] Property name.
 * @returns {UniqueFilter<T>} An instance of the UniqueFilter transform stream.
 */
export function make<T>(
  keyStore: Set<T> = new Set(),
  options: Options = { wantsStrings: true },
  propName?: string
): UniqueFilter<T> {
  return new UniqueFilter(keyStore, options, propName)
}

/**
 * @description Creates a UniqueFilter running in objectMode.
 * @template T
 * @param {Set<T>} keyStore A Set.
 * @param {Options} options Options.
 * @param {string} [propName] Prop Name
 * @returns {UniqueFilter} creates a unique filter that runs in object mode.
 */
export function obj<T>(
  keyStore: Set<T> = new Set(),
  options: Options = { wantsStrings: false },
  propName?: string
): UniqueFilter<T> {
  return new UniqueFilter(
    keyStore,
    {
      ...options,
      wantsStrings: false,
      objectMode: true,
      highWaterMark: 16
    },
    propName
  )
}
