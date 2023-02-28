<div align='center'>

<h1>FluentBox</h1>

<p>Fluent Types for TypeBox</p>
	
<img src="./fluent.png" />

<br />

</div>

## Example

```typescript
import { Type, Static } from './fluent'

const T = Type.String().StartsWith('hello').MaxLength(64).Compile()

type T = Static<typeof T>         // type T = string

console.log(T.Code)               // prints validation code for this type

console.log(T.Schema)             // prints JSON schema for this type

const R = T.Parse('hello world')  // const R = true
```

## Overview

FluentBox is an abstraction layer built on top of the TypeBox type system. It provides a fluent interface which can be used to compose and constrain types through method chaining similar to other JavaScript validation libraries. It also incorporates TypeBox infrastructure for type checking, value initialization as well as the TypeBox compiler for high performance assertions.

FluentBox is written as a standalone `fluent.ts` file which can be extended with additional chainable operators as nessasary. It is written to explore ergonomic type composition in TypeBox, as well as establish a well defined set of chainable operators.

License MIT


