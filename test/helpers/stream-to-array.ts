import { Duplex } from "stream";

export async function bufferStreamToArray(sink: Duplex) {
  const arr: string[] = [];

  for await (const chunk of sink) {
    const str = chunk.toString("ascii");
    arr.push(str);
  }

  return arr;
}

export async function objectStreamToArray(sink: Duplex) {
  const arr: Record<string, string>[] = [];

  for await (const obj of sink) {
    arr.push(obj);
  }

  return arr;
}

export function writeArrayToStream<T>(arr: T[], stream: Duplex) {
  for (const value of arr) {
    stream.write(value);
  }
}
