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

type PP = string extends unknown ? true : false

type N0 = string extends Record<number, unknown> ? true : false // true
type N1 = string extends Record<number, any> ? true : false // true
type N2 = string extends Record<number, never> ? true : false // false
type N3 = string extends Record<number, null> ? true : false // false
type N4 = string extends Record<number, undefined> ? true : false // false
type N5 = string extends Record<number, string> ? true : false // true
type N6 = string extends Record<number, number> ? true : false // false
type N7 = string extends Record<number, boolean> ? true : false // false
type N8 = string extends Record<number, {}> ? true : false // true
type N9 = string extends Record<number, { length: number }> ? true : false // true
type N10 = string extends Record<number, { x: number }> ? true : false // false
type N11 = string extends Record<number, []> ? true : false // false

type S0 = string extends Record<string, unknown> ? true : false // false
type S1 = string extends Record<string, any> ? true : false // false
type S2 = string extends Record<string, never> ? true : false // false
type S3 = string extends Record<string, null> ? true : false // false
type S4 = string extends Record<string, undefined> ? true : false // false
type S5 = string extends Record<string, string> ? true : false // false
type S6 = string extends Record<string, number> ? true : false // false
type S7 = string extends Record<string, boolean> ? true : false // false
type S8 = string extends Record<string, {}> ? true : false // false
type S9 = string extends Record<string, { length: number }> ? true : false // false
type S10 = string extends Record<string, { x: number }> ? true : false // false
type S11 = string extends Record<string, []> ? true : false // false

type Result = 'asdad' extends string ? 1 : 2

const R = TypeExtends.Extends(Type.Record(Type.Number(), Type.Number()), Type.Record(Type.Number(), Type.Number()))

// const R = TypeExtends.Extends(
//   Type.Any(),
//   Type.Function([Type.Any()], Type.Any())
// )

console.log(TypeExtendsResult[R])
