import Type, { Static } from 'typemap'

const T = Type.String().Default('hello')

const M = Type.Object({
  x: Type.Number(),
}).Default({
  x: 1,
})

type X = Static<typeof M>

const S = Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)])
