<div align='center'>

<h1>TypeMap</h1>

<p>Advanced Runtime Type System for TypeScript</p>
	
<img src="./typemap.png" />

<br />

</div>

## Install

```bash
$ npm install typemap
```

## Example

```typescript
import { Type, Static } from 'typemap'

const T = Type.String().Equals('hello world').Compile()

type T = Static<typeof T>         // type T = string

console.log(T.Code)               // Prints code for this type

console.log(T.Schema)             // Prints JSON schema for this type

const R = T.Parse('hello world')  // const R = true
```

## Overview

TypeMap is an advanced abstraction layer built upon the TypeBox runtime type system. It provides a fluent interface which can be used to compose and constrain types through method chaining similar to other JavaScript validation libraries. It also incorporates TypeBox infrastructure for type checking, value initialization as well as the TypeBox compiler for high performance assertions.

TypeMap is written as a standalone `fluent.ts` file which can be extended with additional chainable operators as nessasary. It is written to explore ergonomic type composition in TypeBox, as well as establish a well defined set of chainable operators.

License MIT

## Features

- High Performance Type Checking (Dynamic and JIT)
- High Performance Type Inference
- Creates Default Values from Types
- Runtime Conditional Type Mapping
- Recursive Type Inference
- Code Generation for Ahead of the Time Compilation
- Type Representation is JSON Schema
- User Defined Types
- Support for Ajv

