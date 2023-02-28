import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'
import { Type, Kind, Static, TSchema } from '@sinclair/typebox'

function nope(): TSchema {
  const no = Array.from({ length: 100 }).map((_, i) =>
    Type.Object({
      x: Type.Literal(i),
      y: Type.Literal(2),
      z: Type.Literal(3),
    }),
  )
  return Type.Union(no)
}

const T = Type.Not(
  nope(),
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number(),
  }),
)

const C = TypeCompiler.Compile(T)

console.log(C.Check({ x: 100, y: 2, z: 3 }))
