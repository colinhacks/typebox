// We normalize combinations of intersection and union types based on the distributive property of the '&'
// operator. Specifically, because X & (A | B) is equivalent to X & A | X & B, we can transform intersection
// types with union type constituents into equivalent union types with intersection type constituents and
// effectively ensure that union types are always at the top level in type representations.
//
// We do not perform structural deduplication on intersection types. Intersection types are created only by the &
// type operator and we can't reduce those because we want to support recursive intersection types. For example,
// a type alias of the form "type List<T> = T & { next: List<T> }" cannot be reduced during its declaration.
// Also, unlike union types, the order of the constituent types is preserved in order that overload resolution
// for intersections of types with signatures can be deterministic.

// import { Type, TIntersect, TUnion, Kind, Static, Modifier, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate, TObject, TProperties, TNumber, UnionToIntersect } from '@sinclair/typebox'
// import { TypeGuard } from 'src/guard/guard'
// import { Value } from '@sinclair/typebox/value'
// import { TypeSystem } from '@sinclair/typebox/system'
// import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Types from '@sinclair/typebox'

import Type, { Static, TSchema, TypeGuard } from '@sinclair/typebox'

export enum TypeExtendsResult {
  Union,
  True,
  False,
}

export namespace TypeExtends {
  // ------------------------------------------------------------------------------------------
  // Primitive Sets
  // ------------------------------------------------------------------------------------------
  const PrimitiveSets = new Map<string, Set<string>>([
    ['Any', new Set(['Any', 'Unknown'])],
    ['Unknown', new Set(['Any', 'Unknown'])],
    ['Literal', new Set(['Any', 'Unknown', 'String', 'Number', 'Boolean'])],
    ['String', new Set(['Any', 'Unknown', 'String'])],
    ['Boolean', new Set(['Any', 'Unknown', 'Boolean'])],
    ['Number', new Set(['Any', 'Unknown', 'Integer', 'Number'])],
    ['Integer', new Set(['Any', 'Unknown', 'Number', 'Integer'])],
    ['Null', new Set(['Any', 'Unknown', 'Null'])],
    ['Undefined', new Set(['Any', 'Unknown', 'Undefined'])],
    ['Undefined', new Set(['Any', 'Unknown', 'Undefined'])],
    ['Undefined', new Set(['Any', 'Unknown', 'Undefined'])],
    ['Never', new Set(['Never'])],
  ])

  function Literal(left: Types.TLiteral, right: TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TLiteral(right) && right.const === left.const) return TypeExtendsResult.True
    if (typeof left.const === 'string' && TypeGuard.TString(right)) return TypeExtendsResult.True
    if (typeof left.const === 'number' && TypeGuard.TNumber(right)) return TypeExtendsResult.True
    if (typeof left.const === 'boolean' && TypeGuard.TBoolean(right)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  function Primitive(left: Types.TPrimitive, right: TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TPrimitive(right)) return PrimitiveSets.get(left[Types.Kind])!.has(right[Types.Kind]) ? TypeExtendsResult.True : TypeExtendsResult.False
    return TypeExtendsResult.False
  }

  function IntersectRight(left: Types.TSchema, right: Types.TIntersect): TypeExtendsResult {
    return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function UnionRight(left: Types.TSchema, right: Types.TUnion): TypeExtendsResult {
    return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------------------------
  // Composite
  // ------------------------------------------------------------------------------------------
  export function Intersect(left: Types.TIntersect, right: Types.TSchema) {
    return left.allOf.some((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  export function Union(left: Types.TUnion, right: Types.TSchema) {
    return left.anyOf.every((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Primitives
  // ------------------------------------------------------------------------------------------

  export function Any(left: Types.TAny, right: Types.TSchema) {
    return TypeGuard.TIntersect(right) ||
      TypeGuard.TUnion(right) ||
      TypeGuard.TNever(right) ||
      TypeGuard.TObject(right) ||
      TypeGuard.TArray(right) ||
      TypeGuard.TTuple(right) ||
      TypeGuard.TUint8Array(right) ||
      TypeGuard.TDate(right) ||
      TypeGuard.TFunction(right) ||
      TypeGuard.TConstructor(right)
      ? TypeExtendsResult.Union
      : TypeExtendsResult.True
  }

  // ------------------------------------------------------------------------------------------
  // Complex
  // ------------------------------------------------------------------------------------------
  function Object(left: Types.TObject, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (!TypeGuard.TObject(right)) return TypeExtendsResult.False
    for (const key of globalThis.Object.keys(right.properties)) {
      if (!(key in left.properties)) continue
      if (Visit(left.properties[key], right.properties[key]) === TypeExtendsResult.False) {
        return TypeExtendsResult.False
      }
    }
    return TypeExtendsResult.True
  }

  function Visit(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    const resolvedRight = right
    if (TypeGuard.TIntersect(left)) return Intersect(left, resolvedRight)
    if (TypeGuard.TUnion(left)) return Union(left, resolvedRight)
    if (TypeGuard.TAny(left)) return Any(left, resolvedRight)
    if (TypeGuard.TPrimitive(left)) return Primitive(left, right)
    if (TypeGuard.TLiteral(left)) return Literal(left, resolvedRight)
    if (TypeGuard.TObject(left)) return Object(left, resolvedRight)
    if (TypeGuard.TUserDefined(left)) throw Error(`Structural: Cannot structurally compare custom type '${left[Types.Kind]}'`)
    throw Error(`Structural: Unknown left operand '${left[Types.Kind]}'`)
  }

  export function Extends(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}

const R = TypeExtends.Extends(
  Type.Union([
    Type.String(),
    Type.Number(),
  ]),
  Type.Union([
    Type.String(),
    Type.Number(),
  ]),
)

// const R = TypeExtends.Extends(Type.Number(), Type.Union([Type.Number(), Type.String()]))

type P = string | number extends string  ? true : false

console.log(TypeExtendsResult[R])

type S = { a: number } extends { a: number } ? true : false
