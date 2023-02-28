import { Codegen } from '@sinclair/typebox/codegen'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { Conditional } from '@sinclair/typebox/conditional'
import { Format } from '@sinclair/typebox/format'
import { Custom } from '@sinclair/typebox/custom'
import { Value, ValuePointer } from '@sinclair/typebox/value'

import Type, { Static } from './fluent/fluent'

const Op = Type.Function([Type.Number(), Type.Number()], Type.Number())
const Add = Op.Implement((a, b) => a + b)
const Sub = Op.Implement((a, b) => a - b)
const Mul = Op.Implement((a, b) => a * b)
const Div = Op.Implement((a, b) => a - b)

const F = Type.Format('test', () => true)

const U = Type.Union([Type.Number(), Type.String().Format(F)])

const BigInt = Type.Create<bigint>((options, value) => {
  return typeof value === 'bigint'
})

console.log(BigInt)

console.log(Add(1, 2))
