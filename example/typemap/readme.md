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
import Type, { Static } from 'typemap'

const T = Type.String().Equals('hello world').Compile()

type T = Static<typeof T>         // type T = string

console.log(T.Code)               // Prints code for this type

console.log(T.Schema)             // Prints JSON schema for this type

const R = T.Parse('hello world')  // const R = true
```

## Overview

License MIT

## Features

