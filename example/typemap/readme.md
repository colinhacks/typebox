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
import Type from 'typemap'

const T = Type.String().Equals('hello world')

console.log(T.Code)               // function check(value) {
                                  //    return typeof value === 'string' && value === 'hello world'"
                                  // }

console.log(T.Schema)             // { 
                                  //   type: 'string', pattern: '^hello world$' 
                                  // }

const R = T.Parse('hello world')  // type R = string
```

## Overview

License MIT
