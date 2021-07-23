import { Spigot, _Read } from '../../src/spigot'

export function createReadAsync(num = 0): _Read {
  let c = num
  return function readAsync(this: Spigot, _: number): void {
    if (c++ < 5) {
      console.log('C', c)
      setTimeout(() => {
        console.log('Inside setTimeout with value')
        this.push(c)
      }, 10)
    } else {
      setTimeout(() => {
        console.log('Inside setTimeout end')
        this.push(null)
      }, 10)
    }
  }
}
