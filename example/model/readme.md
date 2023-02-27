# TypeBox Model

Using TypeBox as a Subsystem for Higher Order Composition

## Example

```typescript
import { Type } from './model'

const T = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
}).Strict().Compile()

const V = T.Parse({ x: 1, y: 2, z: 3 }) // V is { x: number, y: number, z: number }
```

## Overview

By design, TypeBox seperates type composition from validation logic. The reason for this to allow integrators to select only the TypeBox components meaningful to their projects. For example, the Fastify framework gets good milage from TypeBox schema composition, but internally uses Ajv for validation (so embedding the TypeBox compiler doesn't make sense). However, a consequence of TypeBox keeping schematic and validation logic seperate, is it cannot provide built in validation on types, or express higher-order type composition abstractions as seen in libraries like Zod (by default)

Higher-order abstractions are possible with TypeBox, but as such abstractions are vary considerably from library to library, TypeBox treats these abstractions as implementor concerns. But to illustrate how one would approach higher-order composition abstractions with TypeBox, this example `model.ts` re-implements the Zod type compositor using TypeBox as a subsystem for inference and validation. It's written as a single TS file in under 500 lines of code.

Integrators can use this example as a reference for building their own Zod-like, the benefits of which allow implementations to be based on the JSON Schema specification, as well as being able to leverage TypeBox's high performance validation infrastructure.

License MIT

- [Example](#Example)
- [Overview](#Overview)
- [Subsystem](#Subsystem)
- [Model](#Model)
- [Operators](#Operators)
  - [Extend](#OperatorsExtend)
  - [And](#OperatorsAnd)
  - [Or](#OperatorsOr)
- [Inference](#Inference)

## Subsystem

In the diagram below, the `Type`, `Value` and `TypeCompiler` modules are used as a subsystem which provides the Zod-like inference, validation and type compilation. The `Model` uses these components to implement aspects of the Zod interface, and uses re-implements Zod's compositor model (method chaining, logical types, extends and the `Parse(value: unknown): T` function)

```
            Higher Order Composition

                 ┌─────────────┐
                 │    Model    │ <-- 'model.ts' - A Pascal cased replica of Zod
                 └─────────────┘
                        |
 ┌──────────-──[TypeBox Subsystem]────────────────┐
 │                                                │
 │  ┌─────────┐   ┌─────────┐  ┌──────────────┐   │
 │  │  Type   │   │  Value  │  │ TypeCompiler │   │
 │  └─────────┘   └─────────┘  └──────────────┘   │
 │                                                │
 └────────────────────────────────────────────────┘
     JSON Schema + Types + Inference + Assertions

```

## Model

To support method chaining, the model encapuates each TypeBox type in an associated `TypeModel` class. Each class is responsible for implementing the chainable functions applicable for that type. All types in the model extend the base class `TypeModel<T>`

```typescript
const T = Type.String().MaxLength(64).Email().Compile()
```

To express the above, we can implement the following model types.

```typescript
export class TypeModel<T extends Types.TSchema> {
  constructor(public readonly schema: T) {}
  public Compile(): this {
    return this // see example implementation
  }
}
export class StringModel extends TypeModel<Types.TString> {
  public MaxLength(n: number) {
    return new StringModel(Types.Type.String({ ...this.schema, maxLength: n }))
  }
  public Email() {
    return new StringModel(Types.Type.String({ ...this.schema, format: 'email' }))
  }
}
namespace Type {
  export function String() {
    return new StringModel(Types.Type.String())
  }
}
```

## Operators

It is common for higher order abstractions to implement user friendly operators such as `Extend`, `And`, `Or` which are aliases for `Intersect` and `Union`. This example implements the following.

### Extends

The `Extend` operator produces an `Intersect` of `(this & TProperties)`

```typescript
const Vec1 = Type.Object({ x: Type.Number() }) // type Vec1 = { x: number }
const Vec2 = Vec1.Extend({ y: Type.Number() }) // type Vec2 = { x: number, y: number }
const Vec3 = Vec2.Extend({ z: Type.Number() }) // type Vec3 = { x: number, y: number, z: number }
```

### And

The `And` operator produces an `Intersect` of `(this & TObject)`

```typescript
const X = Type.Object({ x: Number() })

const Y = Type.Object({ y: Number() })

const Z = X.And(Y) // type T = { x: number, y: number }
```

### Or

The `Or` operator produces a `Union` of `(this | TSchema)`

```typescript
const T = Type.String().Or(Type.Number()) // type T = string | number
```

## Inference

Because TypeBox types are wrapped within `Model` type, there is a need to reimplement the `Static<T>` inference type. This is achieved with the following.

```typescript
export type Static<T> = T extends ModelType<infer S> ? Types.Static<S> : unknown
```
