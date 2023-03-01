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

import { Type, Kind, Static, Modifier, TSchema, SchemaOptions, IntersectReduce, IntersectEvaluate, TObject, TProperties, TNumber, UnionToIntersect } from '@sinclair/typebox'
import { TypeGuard } from 'src/guard/guard'
import { Value } from '@sinclair/typebox/value'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Types from '@sinclair/typebox'

const X = Type.Object({ x: Type.Number() })
const Y = Type.Object({ y: Type.Number() })
const Z = Type.Object({ z: Type.Number() })

const V = Type.Intersect([X, Y, Z])

const T = Type.Union([V])

const C = TypeCompiler.Compile(T)

console.log(C.Check('0000000000'))

// const AA = Type.Object({
//     key: Type.Literal("literal-string"),
//     value: Type.String(),
// });

// const BB = Type.Object({
//     key: Type.Literal("literal-number"),
//     value: Type.Number(),
// });

// const mySchema = Type.Union([AA, BB]);

// const justKeys = Type.Pick(mySchema, ["key"]);
