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

import { ValueClone } from '../value/clone'
import { TypeGuard } from './guard'
import * as Types from './type'

// -------------------------------------------------------------------------
// TPartial
// -------------------------------------------------------------------------
export type TPartialIntersect<T extends Types.TSchema[]> = {
  [K in keyof T]: TPartial2<T[K]> extends infer S ? (S extends Types.TSchema ? S : never) : never
} extends infer O
  ? O extends Types.TSchema[]
    ? Types.TIntersect<O>
    : never
  : never

export type TPartialUnion<T extends Types.TSchema[]> = {
  [K in keyof T]: TPartial2<T[K]> extends infer S ? (S extends Types.TSchema ? S : never) : never
} extends infer O
  ? O extends Types.TSchema[]
    ? Types.TUnion<O>
    : never
  : never

export type TPartialObject<T extends Types.TObject> = {
  [K in keyof T['properties']]: T['properties'][K] extends Types.TReadonlyOptional<infer U>
    ? Types.TReadonlyOptional<U>
    : T['properties'][K] extends Types.TReadonly<infer U>
    ? Types.TReadonlyOptional<U>
    : T['properties'][K] extends Types.TOptional<infer U>
    ? Types.TOptional<U>
    : Types.TOptional<T['properties'][K]>
} extends infer Properties
  ? Properties extends Types.TProperties
    ? Types.TObject<Properties>
    : never
  : never

export type TPartial2<T extends Types.TSchema> = T extends Types.TIntersect<infer S> ? TPartialIntersect<S> : T extends Types.TUnion<infer S> ? TPartialUnion<S> : T extends Types.TObject ? TPartialObject<T> : T
// -------------------------------------------------------------------------
// TRequired
// -------------------------------------------------------------------------
export type TRequiredIntersect<T extends Types.TSchema[]> = {
  [K in keyof T]: TRequired2<T[K]> extends infer S ? (S extends Types.TSchema ? S : never) : never
} extends infer O
  ? O extends Types.TSchema[]
    ? Types.TIntersect<O>
    : never
  : never

export type TRequiredUnion<T extends Types.TSchema[]> = {
  [K in keyof T]: TRequired2<T[K]> extends infer S ? (S extends Types.TSchema ? S : never) : never
} extends infer O
  ? O extends Types.TSchema[]
    ? Types.TUnion<O>
    : never
  : never

export type TRequiredObject<T extends Types.TObject> = {
  [K in keyof T['properties']]: T['properties'][K] extends Types.TReadonlyOptional<infer U>
    ? Types.TReadonly<U>
    : T['properties'][K] extends Types.TReadonly<infer U>
    ? Types.TReadonly<U>
    : T['properties'][K] extends Types.TOptional<infer U>
    ? U
    : T['properties'][K]
} extends infer Properties
  ? Properties extends Types.TProperties
    ? Types.TObject<Properties>
    : never
  : never

export type TRequired2<T extends Types.TSchema> = T extends Types.TIntersect<infer S> ? TRequiredIntersect<S> : T extends Types.TUnion<infer S> ? TRequiredUnion<S> : T extends Types.TObject ? TRequiredObject<T> : T

// --------------------------------------------------------------------
// TypeUtility
// --------------------------------------------------------------------
export namespace TypeUtility {
  function Intersect(schema: Types.TIntersect, callback: (object: Types.TObject) => Types.TObject) {
    return Types.Type.Intersect(schema.allOf.map((inner) => Visit(inner, callback)))
  }
  function Union(schema: Types.TUnion, callback: (object: Types.TObject) => Types.TObject) {
    return Types.Type.Union(schema.anyOf.map((inner) => Visit(inner, callback)))
  }
  function Object(schema: Types.TObject, callback: (object: Types.TObject) => Types.TObject) {
    return callback(schema)
  }
  function Visit(schema: Types.TSchema, callback: (object: Types.TObject) => Types.TObject): Types.TSchema {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema, callback)
    if (TypeGuard.TUnion(schema)) return Union(schema, callback)
    if (TypeGuard.TObject(schema)) return Object(schema, callback)
    return schema
  }
  function Map(schema: Types.TSchema, callback: (object: Types.TObject) => Types.TObject): Types.TSchema {
    return Visit(ValueClone.Clone(schema), callback)
  }
  export function Partial<T extends Types.TSchema>(schema: T): TPartial2<T> {
    return Map(schema, (object) => Types.Type.Partial(object)) as TPartial2<T>
  }
  export function Required<T extends Types.TSchema>(schema: T): TRequired2<T> {
    return Map(schema, (object) => Types.Type.Required(object)) as TRequired2<T>
  }
  export function Omit(schema: Types.TSchema, keys: string[]): Types.TSchema {
    return Map(schema, (object) => Types.Type.Omit(object, keys))
  }
  export function Pick(schema: Types.TSchema, keys: string[]): Types.TSchema {
    return Map(schema, (object) => Types.Type.Pick(object, keys))
  }
}
// --------------------------------------------------------------------
// KeyOf
// --------------------------------------------------------------------
export namespace KeyOf {
  function Intersect(schema: Types.TIntersect) {
    const result = new Set<string>()
    for (const inner of schema.allOf) {
      for (const key of Visit(inner)) {
        result.add(key)
      }
    }
    return [...result]
  }
  function Union(schema: Types.TUnion) {
    const sets = schema.anyOf.map((inner) => Visit(inner))
    const result = new Set<string>()
    for (const set of sets) {
      for (const key of set) {
        if (!sets.every((set) => set.includes(key))) continue
        result.add(key)
      }
    }
    return [...result]
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
  export function Evaluate(schema: Types.TSchema) {
    const keys = Visit(schema)
    return Types.Type.Union(keys.map((key) => Types.Type.Literal(key)))
  }
}
