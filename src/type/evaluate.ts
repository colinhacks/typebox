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

// -------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------
export type Evaluate<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
export type Assert<T, E> = T extends E ? T : never

// -------------------------------------------------------------------------------------
// Omit
// -------------------------------------------------------------------------------------
export type TOmitArray<T extends Types.TSchema[], K extends keyof any> = Assert<{ [K2 in keyof T]: TOmit2<T[K2], K> }, Types.TSchema[]>
export type TOmitProperties<T extends Types.TProperties, K extends keyof any> = Evaluate<Assert<Omit<T, K>, Types.TProperties>>

// prettier-ignore
export type TOmit2<T extends Types.TSchema, K extends keyof any> = 
  T extends Types.TIntersect<infer S> ? Types.TIntersect<TOmitArray<S, K>> : 
  T extends Types.TUnion<infer S> ? Types.TUnion<TOmitArray<S, K>> : 
  T extends Types.TObject<infer S> ? Types.TObject<TOmitProperties<S, K>> : 
  T

// -------------------------------------------------------------------------------------
// Pick
// -------------------------------------------------------------------------------------
export type TPickArray<T extends Types.TSchema[], K extends keyof any> = Assert<{ [K2 in keyof T]: TPick2<T[K2], K> }, Types.TSchema[]>
export type TPickProperties<T extends Types.TProperties, K extends keyof any> = Evaluate<Assert<Pick<T, K>, Types.TProperties>>

// prettier-ignore
export type TPick2<T extends Types.TSchema, K extends keyof any> = 
  T extends Types.TIntersect<infer S> ? Types.TIntersect<TPickArray<S, K>> : 
  T extends Types.TUnion<infer S>     ? Types.TUnion<TPickArray<S, K>> : 
  T extends Types.TObject<infer S>    ? Types.TObject<TPickProperties<S, K>> : 
  T

// -------------------------------------------------------------------------
// TPartial
// -------------------------------------------------------------------------
export type TPartialArray<T extends Types.TSchema[]> = Assert<{ [K in keyof T]: TPartial2<T[K]> }, Types.TSchema[]>

// prettier-ignore
export type TPartialProperties<T extends Types.TProperties> = Evaluate<Assert<{
  [K in keyof T]: 
    T[K] extends Types.TReadonlyOptional<infer U> ? Types.TReadonlyOptional<U> : 
    T[K] extends Types.TReadonly<infer U>         ? Types.TReadonlyOptional<U> : 
    T[K] extends Types.TOptional<infer U>         ? Types.TOptional<U>         : 
    Types.TOptional<T[K]>
}, Types.TProperties>>

// prettier-ignore
export type TPartial2<T extends Types.TSchema> = 
  T extends Types.TIntersect<infer S> ? Types.TIntersect<TPartialArray<S>> : 
  T extends Types.TUnion<infer S>     ? Types.TUnion<TPartialArray<S>> : 
  T extends Types.TObject<infer S>    ? Types.TObject<TPartialProperties<S>> : 
  T

// -------------------------------------------------------------------------
// TRequired
// -------------------------------------------------------------------------
export type TRequiredArray<T extends Types.TSchema[]> = Assert<{ [K in keyof T]: TRequired2<T[K]> }, Types.TSchema[]>

// prettier-ignore
export type TRequiredProperties<T extends Types.TProperties> = Evaluate<Assert<{
  [K in keyof T]: 
    T[K] extends Types.TReadonlyOptional<infer U> ? Types.TReadonly<U> : 
    T[K] extends Types.TReadonly<infer U>         ? Types.TReadonly<U> :  
    T[K] extends Types.TOptional<infer U>         ? U : 
    T[K]
}, Types.TProperties>>

// prettier-ignore
export type TRequired2<T extends Types.TSchema> = 
  T extends Types.TIntersect<infer S> ? Types.TIntersect<TRequiredArray<S>> : 
  T extends Types.TUnion<infer S>     ? Types.TUnion<TRequiredArray<S>> : 
  T extends Types.TObject<infer S>    ? Types.TObject<TRequiredProperties<S>> : 
  T

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
  export function Omit<T extends Types.TSchema, K extends (keyof Types.Static<T>)[]>(schema: T, keys: readonly [...K]): TOmit2<T, K[number]> {
    return Map(schema, (object) => Types.Type.Omit(object, keys)) as TOmit2<T, K[number]>
  }
  export function Pick<T extends Types.TSchema, K extends (keyof Types.Static<T>)[]>(schema: T, keys: readonly [...K]): TPick2<T, K[number]> {
    return Map(schema, (object) => Types.Type.Pick(object, keys)) as TPick2<T, K[number]>
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
