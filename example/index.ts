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
  x: Type.Not(Type.Union([Type.Literal('hello'), Type.Literal('world')]), Type.String()),
})

console.log('ASD', TypeGuard.TObject(T))

console.log(Value.Check(T, { x: 'hello' }))

type T = Static<typeof T>
