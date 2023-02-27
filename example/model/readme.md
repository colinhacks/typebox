# TypeBox Model

Using TypeBox as a Subsystem for Higher Order Composition

## Overview

By design, TypeBox seperates type composition from validation logic. The reason for this to allow integrators to select only the TypeBox components meaningful to their respective projects. For example, the Fastify framework sees good use from TypeBox type composition, but internally uses Ajv for validation (so embedding the TypeBox compiler doesn't make sense). However, a direct consequence of keeping schematic and validation seperate, is TypeBox cannot provide built in validation for types, or express higher-order type composition as seen in libraries like Zod.

Higher-order composition is possible with TypeBox, but as such abstractions are vary considerably from library to library, TypeBox such abstractions as a down stream concern. To illustrate how one would approach higher-order composition abstractions with TypeBox, this example script re-implements the Zod type compositor model using TypeBox as a subsystem for inference and validation.

Integrators can use this example as a reference for building their own Zod-like libraries, while getting the benefits of being based on the JSON Schema specification, as well as being able to leverage TypeBox's high performance validation infrastructure.

License MIT

- [Overview](#Overview)
- [Subsystem](#Subsystem)
- [Model](#Model)
- [Operators](#Operators)
  - [Extend](#OperatorsExtend)
  - [And](#OperatorsAnd)
  - [Or](#OperatorsOr)
- [Inference](#Inference)

## Subsystem

In the diagram below, the `Type`, `Value` and `TypeCompiler` modules are used as a sub system in which to express Zod.

```
            Higher Order Composition

                ┌─────────────┐
                |    Model    | <- `model.ts` - Is a replica of Zod (but capitalized)
                └─────────────┘
                       |
 ──────────-──[TypeBox Subsystem]─────────────────

   ┌─────────┐   ┌─────────┐  ┌──────────────┐
   │  Type   │   │  Value  │  │ TypeCompiler │
   └─────────┘   └─────────┘  └──────────────┘

 JSON Schema, Types, Inference, Runtime Assertions
```

## Model

Each TypeBox type is wrapped in a associated `Model` type. The `Model` is used to express a fluent interface for that type. All types in the model extend the base class `ModelType<T>`

```typescript
const T = Type.String().MaxLength(64).Email().Compile()
```

The above code can be expressed with the following

```typescript
export class ModelType<T extends Types.TSchema> {
  public Compile(): this {
    return this // todo: internally compile this type
  }
}
export class ModelString extends ModelType<Types.TString> {
  public MaxLength(n: number) {
    return new ModelString(Types.Type.String({ ...this.Schema, maxLength: n }))
  }
  public Email() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'email' }))
  }
}
namespace Type {
  export function String() {
    return new ModelString(Types.Type.String())
  }
}
```

## Operators

It is common for higher order compositors to implement user friendly operators such as `Extend`, `And`, `Or` which are aliases for `Intersect` and `Union`. This example implements the following.

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
