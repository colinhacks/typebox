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

import { Type, TIntersect, TUnion, Kind, Static, Modifier, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate, TObject, TProperties, TNumber, UnionToIntersect } from '@sinclair/typebox'
import { TypeGuard } from 'src/guard/guard'
import { Value } from '@sinclair/typebox/value'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Types from '@sinclair/typebox'

// todo: need to solve the union / intersect case. This is somewhat
// difficult, but the normalize function needs to report correctly
// for nested union/intersections, this involves a recursive type, plus the
// normalization logic the type (so expensive as all hell)


// const A = Type.Intersect([
//     Type.Object({ b: Type.Number() }),
//     Type.Object({ b: Type.Number() })
// ])

// const B = Type.Intersect([
//     Type.Object({ c: Type.Number() }),
//     Type.Object({ c: Type.Number() })
// ])

// lets change the definition of Union and Intersect to be [L, R] for binary oprand

type TA = (
    {a: number} & {b:number}
) & {c: number}

type TAA = keyof TA

const A = Type.Intersect([
    Type.Intersect([
        Type.Object({ a: Type.Number() }),
        Type.Object({ b: Type.Number() }),
    ]),
    Type.Object({ c: Type.Number() }),
])

type A = [
    TIntersect<[
        TObject<{a: TNumber}>,
        TObject<{b: TNumber}>,
    ]>,
    TObject<{c: TNumber}>,
]

console.log(A)

const N = Type.Normalize(A)

const K = Type.KeyOf(N)

console.log(K)

type O = TObject<{
    a: TNumber;
} | {
    b: TNumber;
}>

type aa = keyof TA
