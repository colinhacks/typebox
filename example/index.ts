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

import { Type, Static, TypeGuard, KeyResolver } from '@sinclair/typebox'
import * as Types from '@sinclair/typebox'

// --------------------------------------------------------------------
// TypeResolver
// --------------------------------------------------------------------
export namespace TypeResolver {
  function Intersect(schema: Types.TIntersect) {
    return [...schema.allOf.reduce((set, schema) => Visit(schema).map((key) => set.add(key))[0], new Set<string>())]
  }
  function Union(schema: Types.TUnion) {
    const sets = schema.anyOf.map((inner) => Visit(inner))
    return [...sets.reduce((set, outer) => outer.map((key) => (sets.every((inner) => inner.includes(key)) ? set.add(key) : set))[0], new Set<string>())]
  }
  function Object(schema: Types.TObject) {
    return globalThis.Object.keys(schema.properties)
  }
  function Visit(schema: Types.TSchema): string[] {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema)
    if (TypeGuard.TUnion(schema)) return Union(schema)
    if (TypeGuard.TObject(schema)) return Object(schema)
    return []
  }
  export function Resolve<T extends Types.TSchema>(schema: T) {
    return Visit(schema)
  }
}

const T = Type.Union([
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
  }),
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
  })
])

const K = Type.KeyOf(T)

console.log(K)

