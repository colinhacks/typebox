<div align='center'>

<h1>FluentBox</h1>

<p>Fluent Types for the TypeBox Type System</p>
	
<img src="./fluent.png" />

<br />

</div>

## Example

```typescript
import { Type, Static } from './fluent'

const T = Type.Object({
  x: Type.Number().Equals(1),
  y: Type.Number().LessThan(2),
  z: Type.Number().MultipleOf(3),
}).Strict().Compile()

console.log(T.Code)      // print validation code for this type

console.log(T.Schema)    // print the JSON schema for this type

const value = T.Parse({  // value is {
  x: 1,                  //   x: number
  y: 1,                  //   y: number
  z: 3,                  //   z: number
})                       // }
```

## Overview

FluentBox is a chainable type compositor for TypeBox. It is built over the core TypeBox infrastructure and provides fluent interface for composing types. It is modelled on Yup, Zod and Joi, but provides additional capabilities such as type JIT compilation for types, value parsing and value initialization.

This project is implemented as a proof of concept. FluentBox is implemented entirely within `fluent.ts` file located in this directory. Developers can copy and past this file into their projects to experiment with this API.

License MIT


