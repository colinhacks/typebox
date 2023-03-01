import { Type, Kind, Static, Modifier, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate, TObject, TProperties, TNumber, UnionToIntersect } from '@sinclair/typebox'
import * as Types from '@sinclair/typebox'

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

const S = Type.Object({ a: Type.Number() })
const A = Type.Object({ a: Type.Optional(Type.Number()) })
const B = Type.Object({ b: Type.Optional(Type.Number()) })
const C = Type.Object({ c: Type.Optional(Type.Number()) })
const I = Type.Intersect([A, B, C])
const K = Type.KeyOf(S)
const M = Type.Pick(I, K)

const P = Type.Partial(Type.Required(I))

type K = Static<typeof M>

// // -------------------------------------------------------------------
// // Omit
// // -------------------------------------------------------------------
// export type TOmit<T extends Types.TObject, K extends keyof any> = TPick<T, Exclude<keyof T['properties'], K>>

// // -------------------------------------------------------------------
// // Pick
// // -------------------------------------------------------------------
// export type TPick<T extends Types.TObject, K extends keyof any> = Types.TObject<{
//    [IK in K]: IK extends keyof T['properties'] ? T['properties'][IK] : never
// }>

// export function Pick<T extends Types.Normalizable, K extends Types.NormalizeKeyOf<T>[]>(schema: T, keys: [...K]): TPick<Types.Normalize<T>, K[number]> {
//     throw 1
// }

// export function Omit<T extends Types.Normalizable, K extends Types.NormalizeKeyOf<T>[]>(schema: T, keys: [...K]): TOmit<Types.Normalize<T>, K[number]> {
//     throw 1
// }

// const X = Omit(I, ['c', 'b'])

// // type T = Static<typeof X>

// type T = Types.TUnion<[
//     Types.TLiteral<1>,
//     Types.TLiteral<2>,
//     Types.TLiteral<3>
// ]>
