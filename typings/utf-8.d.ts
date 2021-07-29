declare module 'utf-8' {
  export type ByteLength = 1 | 2 | 3 | 4
  export type CharLength = 0 | 1 | 2 | 3 | 4

  export function setBytesFromCharCode(
    charCode?: number,
    bytes?: number[],
    byteOffset?: number,
    neededBytes?: number
  ): number[]

  export function setBytesFromString(
    str?: string,
    bytes?: number[],
    byteOffset?: number,
    neededBytes?: number
  ): number[]

  export function getBytesFromString(
    bytes: number[],
    byteOffset: number,
    byteLength?: ByteLength,
    strict?: boolean
  ): number[]

  export function getBytesForCharCode(charCode: number): ByteLength
  export function getStringFromBytes(
    bytes: number[],
    byteOffset?: number,
    byteLength?: ByteLength,
    strict?: boolean
  ): string

  export function getCharCode(
    bytes: number[],
    byteOffset?: number,
    charLength?: number
  ): number

  export function getCharLength(byte: number): CharLength

  export function isNotUTF8(
    bytes: number[],
    byteOffset?: number,
    byteLength?: ByteLength
  ): boolean
}
