import { expect } from "@jest/globals";
import { Transform, TransformCallback } from "stream";
import Through2 from "../../src";
import { TestThrough2 } from "./test-through2";

export interface UnderscoreI {
  _i?: number;
}

export interface Chunk {
  in: number;
}

export function transform(
  this: TestThrough2,
  chunk: Buffer,
  _: BufferEncoding,
  callback: TransformCallback
) {
  const chunkLength = chunk.length;
  const buffer = Buffer.alloc(chunkLength);

  const previousValue = this.getI();
  this.setI(previousValue + 1);

  for (let i = 0; i < chunkLength; i++) {
    buffer[i] = this.getI();
  }
  this.push(buffer);
  callback();
}

export function ctorTransform<T extends Transform & UnderscoreI>(
  this: T,
  chunk: Buffer,
  _: BufferEncoding,
  callback: TransformCallback
) {
  const chunkLength = chunk.length;
  const buffer = Buffer.alloc(chunkLength);

  if (!this._i) this._i = 97;
  else this._i++;

  for (let i = 0; i < chunkLength; i++) {
    buffer[i] = this._i;
  }
  this.push(buffer);
  callback();
}

export function transformObj(
  this: Through2,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
) {
  this.push({
    out: chunk.in + 1,
  });
  callback();
}

export function transformObjWithCustomOptions(
  this: Through2,
  chunk: Chunk,
  _: BufferEncoding,
  callback: TransformCallback
) {
  const options = this.options as Record<string, string>;
  expect(options.peek).toEqual(true);
  this.push({
    out: chunk.in + 1,
  });
  callback();
}
