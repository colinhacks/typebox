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
import Type, { Static, TSchema, TypeExtends, TypeExtendsResult, TypeGuard } from '@sinclair/typebox'

type T = string extends Record<number, any> ? 1 : 2
const R = TypeExtends.Extends(Type.String(), Type.Record(Type.Number(), Type.Any()))

// const R = TypeExtends.Extends(
//   Type.Any(),
//   Type.Function([Type.Any()], Type.Any())
// )

console.log(TypeExtendsResult[R])
