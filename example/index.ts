import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'

import Type, { Static } from './fluent/fluent'

const F = Type.Format('test', () => true)

const U = Type.Union([Type.Number(), Type.String().Format(F)])

const T = Type.Recursive(
  (Node) =>
    Type.Object({
      x: Type.String().Email(),
      into: U,
      node: Type.Array(Node),
    }),
  {
    $id: 'Node',
  },
)

const R = Type.Record(Type.Union([Type.Literal('y'), Type.Literal('z')]), Type.Number())
  .Extend({
    x: Type.Number().Not(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)])),
  })
  .Omit(['y'])
  .Omit(['z'])
  .Extend({
    y: T,
  })

function test(value: Static<typeof R>) {
  value.y.node[0].into
}

console.log(R.Schema)
console.log(R.Code)
console.log(
  R.Check({
    x: 1,
    y: 2,
    z: 3,
  }),
)
