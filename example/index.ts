import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'
// import {  Kind, Static, TSchema } from '@sinclair/typebox'

import { Type, Static } from './model/model'

const T = Type.Object({
  x: Type.String().Not(Type.Literal('hello'))
}).Extend({
  y: Type.Number().GreaterThan(1)
})

console.log(T.Schema)



