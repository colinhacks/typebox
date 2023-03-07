/*--------------------------------------------------------------------------

@sinclair/typebox/type

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { TypeGuard } from './guard'
import * as Types from './type'

// --------------------------------------------------------------------
// EvaluatedPartial
// --------------------------------------------------------------------
export type EvaluatedPartialIntersect<T extends Types.TIntersect> = { [K in keyof T['allOf']]: T['allOf'][K] extends Types.TSchema ? EvaluatedPartial<T['allOf'][K]> : never }
export type EvaluatedPartialUnion<T extends Types.TUnion> = { [K in keyof T['anyOf']]: T['anyOf'][K] extends Types.TSchema ? EvaluatedPartial<T['anyOf'][K]> : never }
export type EvaluatedPartialObject<T extends Types.TObject> = Types.TPartial<T>
export type EvaluatedPartial<T extends Types.TSchema> = T extends Types.TIntersect ? EvaluatedPartialIntersect<T> : T extends Types.TUnion ? EvaluatedPartialUnion<T> : T extends Types.TObject ? EvaluatedPartialObject<T> : T
export namespace PartialEvaluator {
  function Intersect(schema: Types.TIntersect) {
    return Types.Type.Intersect(schema.allOf.map((inner) => Visit(inner)))
  }
  function Union(schema: Types.TUnion) {
    return Types.Type.Intersect(schema.anyOf.map((inner) => Visit(inner)))
  }
  function Object(schema: Types.TObject) {
    return Types.Type.Partial(schema)
  }
  function Visit(schema: Types.TSchema): Types.TSchema {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema)
    if (TypeGuard.TUnion(schema)) return Union(schema)
    if (TypeGuard.TObject(schema)) return Object(schema)
    return schema
  }
  export function Evaluate<T extends Types.TSchema>(schema: T): EvaluatedPartial<T> {
    return Visit(schema) as EvaluatedPartial<T>
  }
}

// --------------------------------------------------------------------
// EvaluatedRequired
// --------------------------------------------------------------------
export type EvaluatedRequiredIntersect<T extends Types.TIntersect> = { [K in keyof T['allOf']]: T['allOf'][K] extends Types.TSchema ? EvaluatedRequired<T['allOf'][K]> : never }
export type EvaluatedRequiredUnion<T extends Types.TUnion> = { [K in keyof T['anyOf']]: T['anyOf'][K] extends Types.TSchema ? EvaluatedRequired<T['anyOf'][K]> : never }
export type EvaluatedRequiredObject<T extends Types.TObject> = Types.TRequired<T>
export type EvaluatedRequired<T extends Types.TSchema> = T extends Types.TIntersect ? EvaluatedRequiredIntersect<T> : T extends Types.TUnion ? EvaluatedRequiredUnion<T> : T extends Types.TObject ? EvaluatedRequiredObject<T> : T

export namespace RequiredEvaluator {
  function Intersect(schema: Types.TIntersect) {
    return Types.Type.Intersect(schema.allOf.map((inner) => Visit(inner)))
  }
  function Union(schema: Types.TUnion) {
    return Types.Type.Union(schema.anyOf.map((inner) => Visit(inner)))
  }
  function Object(schema: Types.TObject) {
    return Types.Type.Required(schema)
  }
  function Visit(schema: Types.TSchema): Types.TSchema {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema)
    if (TypeGuard.TUnion(schema)) return Union(schema)
    if (TypeGuard.TObject(schema)) return Object(schema)
    return schema
  }
  export function Evaluate<T extends Types.TSchema>(schema: T): EvaluatedRequired<T> {
    return Visit(schema) as EvaluatedRequired<T>
  }
}
