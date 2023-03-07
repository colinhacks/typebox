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

export type ObjectMapFunction = (object: Types.TObject) => Types.TObject

export namespace ObjectMap {
  function Intersect(schema: Types.TIntersect, callback: ObjectMapFunction) {
    return Types.Type.Intersect(schema.allOf.map((inner) => Visit(inner, callback)))
  }
  function Union(schema: Types.TUnion, callback: ObjectMapFunction) {
    return Types.Type.Union(schema.anyOf.map((inner) => Visit(inner, callback)))
  }
  function Object(schema: Types.TObject, callback: ObjectMapFunction) {
    return callback(schema)
  }
  function Visit(schema: Types.TSchema, callback: ObjectMapFunction): Types.TSchema {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema, callback)
    if (TypeGuard.TUnion(schema)) return Union(schema, callback)
    if (TypeGuard.TObject(schema)) return Object(schema, callback)
    return schema
  }
  export function Map(schema: Types.TSchema, callback: ObjectMapFunction): Types.TSchema {
    return Visit(ValueClone.Clone(schema), callback)
  }
}

// --------------------------------------------------------------------
// EvaluatedPartial
// --------------------------------------------------------------------
export namespace Evaluate {
  export function Partial<T extends Types.TSchema>(schema: T): T {
    return ObjectMap.Map(schema, (object) => Types.Type.Partial(object)) as T
  }
  export function Required<T extends Types.TSchema>(schema: T): T {
    return ObjectMap.Map(schema, (object) => Types.Type.Required(object)) as T
  }
  export function Omit<T extends Types.TSchema>(schema: T, keys: string[]): T {
    return ObjectMap.Map(schema, (object) => Types.Type.Omit(object, keys)) as T
  }
  export function Pick<T extends Types.TSchema>(schema: T, keys: string[]): T {
    return ObjectMap.Map(schema, (object) => Types.Type.Pick(object, keys)) as T
  }
  export function KeyOf<T extends Types.TSchema>(schema: T, keys: string[]) {
    const set = new Set<string>()
    ObjectMap.Map(schema, (object) => {
      const keys = globalThis.Object.keys(object.properties)
      keys.forEach((key) => set.add(key))
      return object
    })
    return Types.Type.Union([...set].map((key) => Types.Type.Literal(key)))
  }
}
