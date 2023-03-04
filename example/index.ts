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

// import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Types from '@sinclair/typebox'
import { TypeSystem } from '@sinclair/typebox/system'
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
  // prettier-ignore
  const PrimitiveSets = new Map<string, Set<string>>([
    ['Unknown', new Set(['Any', 'Unknown'])],
    ['Literal', new Set(['Any', 'Unknown', 'String', 'Number', 'Boolean'])],
    ['String',  new Set(['Any', 'Unknown', 'String'])],
    ['Boolean', new Set(['Any', 'Unknown', 'Boolean'])],
    ['Number',  new Set(['Any', 'Unknown', 'Integer', 'Number'])],
    ['Integer', new Set(['Any', 'Unknown', 'Number', 'Integer'])],
    ['Null',    new Set(['Any', 'Unknown', 'Null'])],
    ['Never',   new Set(['Never'])],
  ])

  // ------------------------------------------------------------------------------------------
  // Intersect
  // ------------------------------------------------------------------------------------------
  function IntersectRight(left: Types.TSchema, right: Types.TIntersect): TypeExtendsResult {
    return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Intersect(left: Types.TIntersect, right: Types.TSchema) {
    return left.allOf.some((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------------------------
  // Union
  // ------------------------------------------------------------------------------------------
  function UnionRight(left: Types.TSchema, right: Types.TUnion): TypeExtendsResult {
    return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  export function Union(left: Types.TUnion, right: Types.TSchema) {
    return left.anyOf.every((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------------------------
  // Primitive
  // ------------------------------------------------------------------------------------------
  function Primitive(left: Types.TPrimitive, right: TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True

    if (TypeGuard.TPrimitive(right)) return PrimitiveSets.get(left[Types.Kind])!.has(right[Types.Kind]) ? TypeExtendsResult.True : TypeExtendsResult.False
    return TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------------------------
  // Literal
  // ------------------------------------------------------------------------------------------
  function Literal(left: Types.TLiteral, right: TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True

    if (TypeGuard.TLiteral(right) && right.const === left.const) return TypeExtendsResult.True
    if (typeof left.const === 'string' && TypeGuard.TString(right)) return TypeExtendsResult.True
    if (typeof left.const === 'number' && TypeGuard.TNumber(right)) return TypeExtendsResult.True
    if (typeof left.const === 'boolean' && TypeGuard.TBoolean(right)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Any
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
  // Object
  // ------------------------------------------------------------------------------------------
  function Property(left: Types.TSchema, right: Types.TSchema) {
    if (Visit(left, right) === TypeExtendsResult.False) return TypeExtendsResult.False
    if (TypeGuard.TOptional(left) && !TypeGuard.TOptional(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }

  function Object(left: Types.TObject, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TPrimitive(right)) return TypeExtendsResult.False
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True

    if (!TypeGuard.TObject(right)) return TypeExtendsResult.False
    for (const key of globalThis.Object.keys(right.properties)) {
      if (!(key in left.properties)) continue
      if (Property(left.properties[key], right.properties[key]) === TypeExtendsResult.False) {
        return TypeExtendsResult.False
      }
    }
    return TypeExtendsResult.True
  }

  // ------------------------------------------------------------------------------------------
  // Array
  // ------------------------------------------------------------------------------------------

  function IsObjectArrayLike(object: Types.TObject) {
    return globalThis.Object.keys(object.properties).length === 0 || ('length' in object.properties && TypeGuard.TNumber(object.properties['length']))
  }

  function Array(left: Types.TArray, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TPrimitive(right)) return TypeExtendsResult.False
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True

    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (!TypeGuard.TArray(right)) return TypeExtendsResult.False
    return Visit(left.items, right.items)
  }

  // ------------------------------------------------------------------------------------------
  // Tuple
  // ------------------------------------------------------------------------------------------
  function IsTupleArrayRight(left: Types.TTuple, right: Types.TSchema) {
    return TypeGuard.TArray(right) && 'items' in left && left.items!.every((schema) => Visit(schema, right.items) === TypeExtendsResult.True)
  }

  function Tuple(left: Types.TTuple, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TPrimitive(right)) return TypeExtendsResult.False
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True

    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TArray(right) && IsTupleArrayRight(left, right)) return TypeExtendsResult.True
    if (!TypeGuard.TTuple(right)) return TypeExtendsResult.False
    if ((left.items === undefined && right.items !== undefined) || (left.items !== undefined && right.items === undefined)) return TypeExtendsResult.False
    if (left.items === undefined && right.items === undefined) return TypeExtendsResult.True
    return left.items!.every((schema, index) => Visit(schema, right.items![index]) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  function Visit(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    const resolvedRight = right
    if (TypeGuard.TIntersect(left)) return Intersect(left, resolvedRight)
    if (TypeGuard.TUnion(left)) return Union(left, resolvedRight)
    if (TypeGuard.TAny(left)) return Any(left, resolvedRight)
    if (TypeGuard.TPrimitive(left)) return Primitive(left, right)
    if (TypeGuard.TLiteral(left)) return Literal(left, resolvedRight)
    if (TypeGuard.TObject(left)) return Object(left, resolvedRight)
    if (TypeGuard.TArray(left)) return Array(left, resolvedRight)
    if (TypeGuard.TTuple(left)) return Tuple(left, resolvedRight)
    if (TypeGuard.TUserDefined(left)) throw Error(`Structural: Cannot structurally compare custom type '${left[Types.Kind]}'`)
    throw Error(`Structural: Unknown left operand '${left[Types.Kind]}'`)
  }

  export function Extends(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}

const R = TypeExtends.Extends(
  Type.Tuple([Type.Literal(1), Type.Literal(2)]),
  Type.Tuple([Type.Unknown(), Type.Literal(2)]),
  //Type.Tuple([]),
)

// const R = TypeExtends.Extends(Type.Number(), Type.Union([Type.Number(), Type.String()]))

type P = string extends 'asdsad' ? true : false

console.log(TypeExtendsResult[R])

type S = Array<number> & string extends Array<string> | Array<number> ? true : false
