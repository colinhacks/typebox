import Type, { FluentType, Static, Value } from './typemap/typemap'

console.log(Value.Diff(1, 2))

function Vector<T extends FluentType>(type: T) {
  return Type.Object({
    x: type,
    y: type,
    z: type,
  })
}

const A = Vector(Type.String().Email()).KeyOf()

const P = Type.Record(A, Vector(Vector(Vector(Type.Number()))))

const C = Type.Extends(Type.Any(), Type.String()).Then(P).Else(Type.Literal(true))

console.log(C.Schema)

function test(value: Static<typeof P>) {}
