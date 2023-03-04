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

export type PrimitiveType = Types.TAny | Types.TUnknown | Types.TLiteral | Types.TString | Types.TBoolean | Types.TNumber | Types.TInteger | Types.TNull | Types.TUndefined | Types.TNever

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
  function IsPrimitiveType(schema: Types.TSchema): schema is PrimitiveType {
    return (
      TypeGuard.TAny(schema) ||
      TypeGuard.TUnknown(schema) ||
      TypeGuard.TLiteral(schema) ||
      TypeGuard.TString(schema) ||
      TypeGuard.TBoolean(schema) ||
      TypeGuard.TNumber(schema) ||
      TypeGuard.TInteger(schema) ||
      TypeGuard.TNull(schema) ||
      TypeGuard.TUndefined(schema) ||
      TypeGuard.TNever(schema)
    )
  }
  function ExtendsLiteralType(left: Types.TLiteral, right: PrimitiveType): TypeExtendsResult {
    if (typeof left.const === 'string' && TypeGuard.TString(right)) {
      return TypeExtendsResult.True
    } else if (typeof left.const === 'number' && TypeGuard.TNumber(right)) {
      return TypeExtendsResult.True
    } else if (typeof left.const === 'boolean' && TypeGuard.TBoolean(right)) {
      return TypeExtendsResult.True
    } else {
      return TypeExtendsResult.False
    }
  }
  function ExtendsPrimitiveType(left: PrimitiveType, right: PrimitiveType): TypeExtendsResult {
    if (TypeGuard.TLiteral(left)) return ExtendsLiteralType(left, right)
    return PrimitiveSets.get(left[Types.Kind])!.has(right[Types.Kind]) ? TypeExtendsResult.True : TypeExtendsResult.False
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

  export function Unknown(left: Types.TUnknown, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Literal(left: Types.TLiteral, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function String(left: Types.TString, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Boolean(left: Types.TBoolean, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Number(left: Types.TNumber, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Integer(left: Types.TInteger, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Null(left: Types.TNull, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Undefined(left: Types.TUndefined, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  export function Never(left: Types.TNever, right: Types.TSchema) {
    return IsPrimitiveType(right) ? ExtendsPrimitiveType(left, right) : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Complex
  // ------------------------------------------------------------------------------------------
  export function Object(left: Types.TObject, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) {
      return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
    } else if (TypeGuard.TUnion(right)) {
      return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
    } else if (TypeGuard.TObject(right)) {
      for (const key of globalThis.Object.keys(right.properties)) {
        if (!(key in left.properties)) return TypeExtendsResult.False
        const result = Visit(left.properties[key], right.properties[key])
        if (result === TypeExtendsResult.False) return TypeExtendsResult.False
      }
      return TypeExtendsResult.True
    } else {
      return TypeExtendsResult.False
    }
  }
  function Visit(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    const resolvedRight = right
    // ------------------------------------------------------------------------------------------
    // Composite
    // ------------------------------------------------------------------------------------------
    if (TypeGuard.TIntersect(left)) {
      return Intersect(left, resolvedRight)
    } else if (TypeGuard.TUnion(left)) {
      return Union(left, resolvedRight)
    }
    // ------------------------------------------------------------------------------------------
    // Primitives
    // ------------------------------------------------------------------------------------------
    else if (TypeGuard.TAny(left)) {
      return Any(left, resolvedRight)
    } else if (TypeGuard.TBoolean(left)) {
      return Boolean(left, resolvedRight)
    } else if (TypeGuard.TInteger(left)) {
      return Integer(left, resolvedRight)
    } else if (TypeGuard.TLiteral(left)) {
      return Literal(left, resolvedRight)
    } else if (TypeGuard.TNull(left)) {
      return Null(left, resolvedRight)
    } else if (TypeGuard.TNumber(left)) {
      return Number(left, resolvedRight)
    } else if (TypeGuard.TString(left)) {
      return String(left, resolvedRight)
    } else if (TypeGuard.TUndefined(left)) {
      return Undefined(left, resolvedRight)
    } else if (TypeGuard.TUnknown(left)) {
      return Unknown(left, resolvedRight)
    } else if (TypeGuard.TObject(left)) {
      return Object(left, resolvedRight)
    }
    // -----------------------------------------------------
    // Non Resolvable
    // -----------------------------------------------------
    else if (TypeGuard.TUserDefined(left)) {
      throw Error(`Structural: Cannot structurally compare custom type '${left[Types.Kind]}'`)
    } else {
      throw Error(`Structural: Unknown left operand '${left[Types.Kind]}'`)
    }
  }

  export function Extends(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}

const R = TypeExtends.Extends(
  Type.Object({
    a: Type.Number(),
    b: Type.Number(),
  }),
  Type.Intersect([
    Type.Object({
      a: Type.Number(),
    }),
    Type.Object({
      b: Type.Union([Type.String(), Type.Number()]),
    }),
  ]),
)

console.log(TypeExtendsResult[R])

type S = { a: number; b: number } extends { a: number } & { b: string | number } ? true : false
