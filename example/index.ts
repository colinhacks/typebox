import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'

import Type, { Static } from './typemap/typemap'

const T = Type.Intersect([
  Type.Object({
    x: Type.Number(),
  }),
  Type.Object({
    b: Type.Number().LessThan(10).Optional(),
  }),
])

const M = T.Extend({
  x: Type.String(),
})

type T = Static<typeof M>

console.log(T.Schema)
