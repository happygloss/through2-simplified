import { ReadableOptions, Readable } from "stream";

export class SimpleBufferListStream extends Readable {
  private store: Uint8Array[] = [];
  constructor(options: ReadableOptions = {}) {
    super(options);
  }
  override _read() {
    const b = Buffer.concat(this.store);
    const length = b.length;
    const chunk = b.slice(0, length);
    this.push(chunk);
    this.push(null);
  }

  public append = (data: Buffer | Uint8Array) => {
    const item = Buffer.from(data);
    this.store.push(item);
  };
}
