import ConcatStream, { ConcatChunk, concatWithCallback } from './concat'
import FilterStream, {
  ctor as filterCtor,
  make as makeFilter,
  transform as transformFilter
} from './filter'
import From2, { Check, From, fromArray, fromArrayObj } from './from'
import MapStream, { Chunk, ChunkHandler, ObjectChunk } from './map'
import MergeStreams, { merge } from './merge'
import ReduceStream, {
  Reducer,
  make as reduceMake,
  obj as reduceObj
} from './reduce'
import Spigot, { spigot } from './spigot'
import Through2, {
  make,
  ctor,
  obj,
  BufferEncoding,
  Ctor,
  _Flush,
  _Transform
} from './through2'
import UniqueFilter, {
  UniqueChunk,
  UniqueChunkProp,
  UniqueChunkPropData,
  make as uniqueMake,
  obj as uniqueObj
} from './unique'

const filter = {
  transform: transformFilter,
  make: makeFilter,
  ctor: filterCtor
}

const from = {
  make: fromArray,
  obj: fromArrayObj
}

const reduce = {
  make: reduceMake,
  obj: reduceObj
}

const through2 = {
  make,
  obj,
  ctor
}

const unique = {
  make: uniqueMake,
  obj: uniqueObj
}

// supporting types
export {
  Chunk,
  ChunkHandler,
  ConcatChunk,
  Check,
  From,
  ObjectChunk,
  Reducer,
  BufferEncoding,
  _Flush,
  _Transform,
  Ctor,
  UniqueChunk,
  UniqueChunkProp,
  UniqueChunkPropData
}

// streams: From2 and Spigot are Readable, all other streams are Transform streams.
export {
  ConcatStream,
  FilterStream,
  From2,
  MapStream,
  MergeStreams,
  ReduceStream,
  Spigot,
  Through2,
  UniqueFilter
}

// helpers
export {
  concatWithCallback,
  filter,
  from,
  merge,
  reduce,
  spigot,
  through2,
  unique
}
