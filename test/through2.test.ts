import { describe, expect, it } from "@jest/globals";
import { PassThrough, TransformCallback, TransformOptions } from "stream";
import Through2 from "../src";
import {
  Chunk,
  fillString,
  generateData,
  objectStreamToArray,
  SimpleBufferListStream as Source,
  streamToArray,
  TestThrough2,
  transform,
  transformObj,
  writeArrayToStream,
} from "./helpers";

function flush(this: TestThrough2, callback: TransformCallback) {
  // Ascii codes: 101: e, 110: n, , 100: d, equal to this.push(Buffer.from('end'));
  this.push(Buffer.from([101, 110, 100]));
  callback();
}

describe("Through2", () => {
  it("noop stream aka PassThrough", async () => {
    const expected = "eeee";
    const stream = new Through2();

    stream.end(expected);

    const [actual] = await streamToArray(stream);
    expect(actual).toEqual(expected);
  });

  it("Plain: receives a transform function and converts it to a string consisting of characters starting from a", async () => {
    const data = generateData();
    const expected = [
      fillString("a", 10),
      fillString("b", 5),
      fillString("c", 10),
    ].join("");

    const stream = new TestThrough2(transform);
    const sink = new PassThrough();

    stream.pipe(sink);

    writeArrayToStream(data, stream);
    stream.end();

    const actual: string[] = await streamToArray(sink);
    expect(actual[0]).toEqual(expected);
  });

  it("Pipeable: reads data piped from another stream", async () => {
    const expected = fillString("a", 25);

    const stream = new TestThrough2(transform);
    const source = new Source();
    const sink = new PassThrough();

    source.pipe(stream).pipe(sink);
    generateData().map(source.append);

    const actual = await streamToArray(sink);
    expect(actual[0]).toEqual(expected);
  });

  it("Through2.obj: creates a transform stream in object mode", async () => {
    const data = [{ in: 101 }, { in: 202 }, { in: -100 }];
    const expected = [{ out: 102 }, { out: 203 }, { out: -99 }];

    const stream = Through2.obj(transformObj);
    writeArrayToStream<Chunk>(data, stream);
    stream.end();

    const actual = await objectStreamToArray(stream);
    expect(actual).toEqual(expected);
  });

  it("Flush: uses the flush param if one is provided", async () => {
    const data = generateData();
    const expected = [
      fillString("a", 10),
      fillString("b", 5),
      fillString("c", 10),
      "end",
    ].join("");

    const stream = new TestThrough2(transform, {} as TransformOptions, flush);
    const sink = new PassThrough();
    stream.pipe(sink);

    writeArrayToStream(data, stream);
    stream.end();

    const actual = await streamToArray(sink);
    expect(actual[0]).toEqual(expected);
  });

  it("Flush Object Mode: uses the flush param if one is provided", (done) => {
    let chunkCalled = false;
    const transformWithFlush = function transformWithFlush(
      chunk: Buffer,
      _: BufferEncoding,
      callback: TransformCallback
    ) {
      expect(chunk).toEqual({ a: "a" });
      chunkCalled = true;
      callback();
    };

    const flushWithAssertion = function flushWithAssertion() {
      expect(chunkCalled).toEqual(true);
      done();
    };
    const stream = Through2.obj(
      transformWithFlush,
      { objectMode: true },
      flushWithAssertion
    );

    stream.end({ a: "a" });
  });

  it("emits a close event when the stream is destroyed", () => {
    const stream = new Through2();
    const promise = new Promise((resolve, reject) => {
      stream.on("close", () => resolve(42));
      stream.on("error", reject);
    });

    stream.destroy();
    stream.destroy();
    expect(promise).resolves.toEqual(42);
  });
});
