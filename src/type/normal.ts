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
import { TypeExtends, TypeExtendsResult } from './extends'
import { TypeGuard } from './guard'
import * as Types from './type'

export namespace TypeNormal {
  function NormalizeProperty(current: Types.TSchema, next: Types.TSchema): Types.TSchema {
    if (TypeGuard.TNever(current)) return current
    return TypeExtends.Extends(next, current) === TypeExtendsResult.True ? Types.Type.Intersect([next, current]) : Types.Type.Never()
  }
  function NormalizeProperties(current: Types.TProperties, next: Types.TProperties) {
    const properties = ValueClone.Clone(current)
    for (const key of globalThis.Object.keys(next)) {
      properties[key] = key in properties ? NormalizeProperty(current[key], next[key]) : NormalizeProperty(Types.Type.Any(), next[key])
    }
    return properties
  }
  function Intersect<T extends Types.TIntersect>(schema: T) {
    const properties = schema.allOf.reduce((acc, schema) => {
      const normal = Normal(schema) as Types.TObject
      return NormalizeProperties(acc, normal.properties)
    }, {} as Types.TProperties)
    return Types.Type.Object(properties)
  }

  function Union<T extends Types.TUnion>(schema: T) {
    return schema as any
  }

  export function Normal<T extends Types.TSchema>(schema: T): Types.TSchema {
    if (TypeGuard.TIntersect(schema)) {
      return Intersect(schema)
    } else if (TypeGuard.TUnion(schema)) {
      return Union(schema)
    } else {
      return schema
    }
  }
}
