// import { Codegen } from '@sinclair/typebox/codegen'
// import { TypeSystem } from '@sinclair/typebox/system'
// import { TypeCompiler } from '@sinclair/typebox/compiler'
// import { TypeGuard } from '@sinclair/typebox/guard'
// import { Conditional } from '@sinclair/typebox/conditional'
// import { Format } from '@sinclair/typebox/format'
// import { Custom } from '@sinclair/typebox/custom'
// import { Value, ValuePointer } from '@sinclair/typebox/value'
// import { Type, Kind, Static, TSchema } from '@sinclair/typebox'
import Ajv from 'ajv'

const ajv = new Ajv()

import { Type, Static } from './model/model'

const T = Type.Object({
  x: Type.Number()
    .Not(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)]))
    .Default(1),
})

console.log(ajv.validate(T.Schema, { x: 1 }))
console.log(T.Schema)

type T = Static<typeof T>
