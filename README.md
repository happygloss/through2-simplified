# through2-simplified

**Installation**

```
yarn add @happygloss/through2
```

**Usage**

```
import Through2, {BufferEncoding } from '@happygloss/through2'
import { TransformCallback } from 'stream'

// unknown is a type-safe variant of any, provide the this context as a type param.
function transform(this: Through2, chunk: unknown, enc: BufferEncoding, callback: TransformCallback) {
  const updated = chunk.toString() + '!'
  this.push(updated)
  callback()
}

const through2 = new Through2(transform)
```

**Development**

We use `Readable` and `Transform` streams when testing the code, we don't rely on other modules such as spigot, from, concat when testing. To test the code, use:

```
yarn test
```

To run tests with coverage:

```
yarn cover
```
