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

import { Type, Static, TypeGuard, TypeExtends, TypeExtendsResult } from '@sinclair/typebox'
import * as Types from '@sinclair/typebox'

// -------------------------------------------------------------
// Symbol
// -------------------------------------------------------------
type T1 = symbol extends unknown ? true : false // true
type T2 = symbol extends any ? true : false // true
type T3 = string extends never ? true : false // false
type T4 = symbol extends string ? true : false // false
type T5 = symbol extends boolean ? true : false // false
type T6 = symbol extends number ? true : false // false
type T7 = symbol extends {} ? true : false // true
type T8 = symbol extends [] ? true : false // false

type S1 = unknown extends symbol ? true : false // false
type S2 = any extends symbol ? true : false // union
type S3 = never extends symbol ? true : false // true
type S4 = string extends symbol ? true : false // false
type S5 = boolean extends symbol ? true : false // false
type S6 = number extends symbol ? true : false // false
type S7 = {} extends symbol ? true : false // false
type S8 = [] extends symbol ? true : false // false

const R = TypeExtends.Extends(Type.Array(Type.Number()), Type.Symbol(undefined))

type X = symbol extends { description: string | undefined } ? true : false

const AASD = Symbol()
AASD.description

type AA = keyof symbol

console.log(TypeExtendsResult[R])
