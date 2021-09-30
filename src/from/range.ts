import obj from './obj'
import From2 from './stream-class'

export default function range(n: number): From2 {
  const k = n > 0 ? -1 : 1
  return obj(function (_, next) {
    setTimeout(function () {
      n === 0 ? next(null, null) : next(null, (n += k))
      return undefined
    }, Math.round(6 + Math.round(Math.random() * 6)))
  })
}
