export function randomBytes(len: number) {
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = Math.floor(Math.random() * 0xff);
  }
  return bytes;
}

export function generateData(): Uint8Array[] {
  return [randomBytes(10), randomBytes(5), randomBytes(10)];
}

