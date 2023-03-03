/*--------------------------------------------------------------------------

@sinclair/typebox

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

import * as Types from './type'

// // normalization constraints
// export type NormalizeNormalizable<T extends Normalizable, N = Normalize<T>> = N extends TObject ? TObject<{
//     [K in keyof N['properties']]: Normalize<N['properties'][K]>
//   }> : TObject<{}>

//   export type NormalizeNormalizableTuple<T extends Normalizable[]> = {
//     [K in keyof T]: NormalizeNormalizable<T[K]>
//   } extends infer R ? R extends TObject[] ? R : [] : []

// export type ObjectTupleToPropertyTuple<T> = T extends TObject[] ? { [K in keyof T]: T[K] extends TObject ? T[K]['properties'] : never } : never

//   // prettier-ignore
//   export type NormalizeIntersect<T extends Normalizable[]> = Types.TObject< // T is Normalizable[]
//     Types.AssertProperties<
//       Types.TupleToIntersect<
//         ObjectTupleToPropertyTuple<
//           NormalizeNormalizableTuple<T>
//         >
//       >
//     >
//   >
//   // prettier-ignore
//   export type NormalizeUnion<T extends Normalizable[]> = Types.TObject<
//     Types.AssertProperties<
//       Types.TupleToUnion<
//         ObjectTupleToPropertyTuple<
//           NormalizeNormalizableTuple<T>
//         >
//       >
//     >
//   >

//   export type Normalizable = TObject | TIntersect<any[]> | TUnion<any[]>

//   // prettier-ignore
//   export type NormalizableKeys<T extends Types.TSchema> = keyof Types.Normalize<T>['properties']

export type Normalized<T extends Types.TSchema> = T extends Types.TIntersect ? T : T extends Types.TUnion ? T : T

export namespace Normal {
  //   // ---------------------------------------------------------------------------
  //   // Normalization
  //   // ---------------------------------------------------------------------------

  //   /** `Standard` Returns the normalized representation of this schema. */
  //   public Normalize<T extends TSchema>(schema: T): Normalize<T> {
  //     const isNormalizable = (schema: Record<any, any>): schema is Normalizable               => isIntersect(schema) || isUnion(schema) || isObject(schema)
  //     const isIntersect    = (schema: Record<any, any>): schema is TIntersect<Normalizable[]> => Kind in schema && schema[Kind] === 'Intersect' && schema.allOf.every((schema: Record<any, any>) => isNormalizable(schema))
  //     const isUnion        = (schema: Record<any, any>): schema is TUnion<Normalizable[]>     => Kind in schema && schema[Kind] === 'Union' && schema.anyOf.every((schema: Record<any, any>) => isNormalizable(schema))
  //     const isObject       = (schema: Record<any, any>): schema is TObject                    => Kind in schema && schema[Kind] === 'Object'
  //     if(!isNormalizable(schema)) throw Error('Schema cannot be normalized')
  //     if (isIntersect(schema)) {
  //       return this.NormalizeIntersect(schema)
  //     } else if (isUnion(schema)) {
  //       return this.NormalizeUnion(schema)
  //     } else {
  //       return this.Clone(schema)
  //     }
  //   }

  //   private NormalizeProperties(current: TProperties, next: TProperties) {
  //     const properties = this.Clone(current)
  //     for(const key of globalThis.Object.keys(next)) {
  //       properties[key] = (key in properties)
  //         ? this.Intersect([this.Clone(next[key]), this.Clone(properties[key])])
  //         : this.Clone(next[key])
  //     }
  //     return properties
  //   }

  //   private NormalizeIntersect<T extends TIntersect<TSchema[]>>(schema: T): Normalize<T> {
  //     const properties = schema.allOf.reduce((acc, schema) => {
  //       const normal = this.Normalize(schema) as TObject
  //       return this.NormalizeProperties(acc, normal.properties)
  //     }, {} as TProperties)
  //     return this.Object(properties) as Normalize<T>
  //   }

  //   private NormalizeUnion<T extends TUnion>(schema: T): Normalize<T> {
  //     return this.Object({}) as Normalize<T>
  //   }
  export function Normalize<T extends Types.TSchema>(schema: T): Normalized<T> {
    throw 1
  }
}
