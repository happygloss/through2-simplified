import { Chunk } from '../../src/map'

export interface Widget {
  widgets: number
  time: number
}

export interface Serializable {
  toString: () => string
}

/**
 * @description Sum two values if they can be converted to numbers
 * @param {Chunk} prev Accumulated value so far
 * @param {Chunk} curr Current chunk
 * @returns {string} Accumulated value with current chunk
 */
export function sumUnknowns(prev: Chunk, curr: Chunk): string {
  const prevNum = parseFloat(prev as string)
  const currNum = parseFloat(curr as string)

  if (isNaN(prevNum)) {
    throw new Error(
      `Expected number, received: ${(prev as Serializable).toString()}`
    )
  }

  if (isNaN(currNum)) {
    throw new Error(
      `Expected number, received: ${(curr as Serializable).toString()}`
    )
  }

  return `${prevNum + currNum}`
}

/**
 * @description Sum two numbers
 * @param {number} a Accumulated sum so far.
 * @param {number} b Current chunk
 * @returns {number} Sum including current chunk
 */
export function sum(a: number, b: number): number {
  return a + b
}

/**
 * @description Compute mean of a reducable
 * @param {number} prev Mean of all values so far
 * @param {number} current Current chunk
 * @param {number} index Index
 * @returns {number} Mean of all chunks including current chunk
 */
export function mean(prev: number, current: number, index: number): number {
  return prev - (prev - current) / (index + 1)
}

/**
 * @description Mean of all widgets in an array or object stream
 * @param {Widget} prev Mean of widgets so far.
 * @param {Widget} curr Current widget
 * @param {number} index Index
 * @returns {Widget} A widget with the mean.
 */
export function meanWidgets(prev: Widget, curr: Widget, index: number): Widget {
  const meanWidgets = prev.widgets - (prev.widgets - curr.widgets) / (index + 1)
  return {
    widgets: meanWidgets,
    time: curr.time
  }
}

/**
 * @description Compare strings until the smallest is found.
 * @param {string} prev A string
 * @param {string} curr Another string
 * @returns {string} The smallest string (as per string comparision)
 */
export function sort(prev: string, curr: string): string {
  if (prev < curr) return prev
  return curr
}
