import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'
import { Type, Kind, Static, TSchema } from '@sinclair/typebox'

const T = Type.Object({
  x: Type.Not(Type.Number(), Type.String(), { default: 'hello' }),
})

console.log(Value.Cast(T, { x: 'helloasd' }))

// const C = TypeCompiler.Compile(T)
// const A = 1
// const E = [...C.Errors(A)]

// console.log(JSON.stringify(E, null, 2))
// console.log(C.Check(A))
