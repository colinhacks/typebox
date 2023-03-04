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
import * as Types from '../typebox'

export enum TypeExtendsResult {
  Union,
  True,
  False,
}
export namespace TypeExtends {
  // ------------------------------------------------------------------------------------------
  // Primitive Sets
  // ------------------------------------------------------------------------------------------
  // prettier-ignore
  const primitives = new Map<string, Set<string>>([
    ['Unknown',   new Set(['Any', 'Unknown'])],
    ['String',    new Set(['Any', 'Unknown', 'String'])],
    ['Boolean',   new Set(['Any', 'Unknown', 'Boolean'])],
    ['Number',    new Set(['Any', 'Unknown', 'Integer', 'Number'])],
    ['Integer',   new Set(['Any', 'Unknown', 'Number', 'Integer'])],
    ['Undefined', new Set(['Any', 'Unknown', 'Void', 'Undefined'])],
    ['Null',      new Set(['Any', 'Unknown', 'Null'])],
    ['Void',      new Set(['Any', 'Unknown'])],
    ['Never',     new Set(['Never'])],
  ])

  // ------------------------------------------------------------------------------------------
  // Intersect
  // ------------------------------------------------------------------------------------------
  function IntersectRight(left: Types.TSchema, right: Types.TIntersect): TypeExtendsResult {
    return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Intersect(left: Types.TIntersect, right: Types.TSchema) {
    return left.allOf.some((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Union
  // ------------------------------------------------------------------------------------------
  function UnionRight(left: Types.TSchema, right: Types.TUnion): TypeExtendsResult {
    return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Union(left: Types.TUnion, right: Types.TSchema) {
    return left.anyOf.every((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Any
  // ------------------------------------------------------------------------------------------
  function Any(left: Types.TAny, right: Types.TSchema) {
    return TypeGuard.TIntersect(right) ||
      TypeGuard.TUnion(right) ||
      TypeGuard.TNever(right) ||
      TypeGuard.TObject(right) ||
      TypeGuard.TArray(right) ||
      TypeGuard.TTuple(right) ||
      TypeGuard.TUint8Array(right) ||
      TypeGuard.TDate(right) ||
      TypeGuard.TFunction(right) ||
      TypeGuard.TConstructor(right)
      ? TypeExtendsResult.Union
      : TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Primitive
  // ------------------------------------------------------------------------------------------
  function Primitive(left: Types.TPrimitive, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TPrimitive(right)) return TypeExtendsResult.False
    return primitives.get(left[Types.Kind])!.has(right[Types.Kind]) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Literal
  // ------------------------------------------------------------------------------------------
  function Literal(left: Types.TLiteral, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (TypeGuard.TLiteral(right) && right.const === left.const) return TypeExtendsResult.True
    if (typeof left.const === 'string' && TypeGuard.TString(right)) return TypeExtendsResult.True
    if (typeof left.const === 'number' && TypeGuard.TNumber(right)) return TypeExtendsResult.True
    if (typeof left.const === 'boolean' && TypeGuard.TBoolean(right)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Object
  // ------------------------------------------------------------------------------------------
  function Property(left: Types.TSchema, right: Types.TSchema) {
    if (Visit(left, right) === TypeExtendsResult.False) return TypeExtendsResult.False
    if (TypeGuard.TOptional(left) && !TypeGuard.TOptional(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }
  function Object(left: Types.TObject, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (TypeGuard.TRecord(right)) {
      const keyschema = GetRecordKey(right)
      const valueschema = GetRecordValue(right)
      // note: if not string, then we assume right record to be an empty set.
      if (!TypeGuard.TString(keyschema)) return TypeExtendsResult.True
      for (const key of globalThis.Object.keys(left.properties)) {
        if (Property(left.properties[key], valueschema) === TypeExtendsResult.False) {
          return TypeExtendsResult.False
        }
      }
      return TypeExtendsResult.True
    }
    if (!TypeGuard.TObject(right)) return TypeExtendsResult.False
    for (const key of globalThis.Object.keys(right.properties)) {
      if (!(key in left.properties)) continue
      if (Property(left.properties[key], right.properties[key]) === TypeExtendsResult.False) {
        return TypeExtendsResult.False
      }
    }
    return TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Record
  // ------------------------------------------------------------------------------------------
  function GetRecordKey(schema: Types.TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return { [Types.Kind]: 'Number', type: 'number' }
    if ('^.*$' in schema.patternProperties) return { [Types.Kind]: 'String', type: 'string' }
    throw Error('TypeExtends: Cannot get record value')
  }
  function GetRecordValue(schema: Types.TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return schema.patternProperties['^(0|[1-9][0-9]*)$']
    if ('^.*$' in schema.patternProperties) return schema.patternProperties['^.*$']
    throw Error('TypeExtends: Cannot get record value')
  }
  function Record(left: Types.TRecord, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (TypeGuard.TObject(right)) {
      const valueschema = GetRecordValue(left)
      for (const key of globalThis.Object.keys(right.properties)) {
        if (Property(valueschema, right.properties[key]) === TypeExtendsResult.False) {
          return TypeExtendsResult.False
        }
      }
      return TypeExtendsResult.True
    }
    if (!TypeGuard.TRecord(right)) return TypeExtendsResult.False
    return Visit(GetRecordValue(left), GetRecordValue(right))
  }
  // ------------------------------------------------------------------------------------------
  // Array
  // ------------------------------------------------------------------------------------------
  function IsObjectArrayLike(object: Types.TObject) {
    return globalThis.Object.keys(object.properties).length === 0 || (object.properties.length !== undefined && TypeGuard.TNumber(object.properties['length']))
  }
  function Array(left: Types.TArray, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (!TypeGuard.TArray(right)) return TypeExtendsResult.False
    return Visit(left.items, right.items)
  }
  // ------------------------------------------------------------------------------------------
  // Tuple
  // ------------------------------------------------------------------------------------------
  function IsTupleArrayRight(left: Types.TTuple, right: Types.TSchema) {
    return TypeGuard.TArray(right) && left.items !== undefined && left.items.every((schema) => Visit(schema, right.items) === TypeExtendsResult.True)
  }
  function Tuple(left: Types.TTuple, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TArray(right) && IsTupleArrayRight(left, right)) return TypeExtendsResult.True
    if (!TypeGuard.TTuple(right)) return TypeExtendsResult.False
    if ((left.items === undefined && right.items !== undefined) || (left.items !== undefined && right.items === undefined)) return TypeExtendsResult.False
    if (left.items === undefined && right.items === undefined) return TypeExtendsResult.True
    return left.items!.every((schema, index) => Visit(schema, right.items![index]) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Promise
  // ------------------------------------------------------------------------------------------
  function Promise(left: Types.TPromise, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TPromise(right)) return TypeExtendsResult.False
    return Visit(left.item, right.item)
  }
  // ------------------------------------------------------------------------------------------
  // Date
  // ------------------------------------------------------------------------------------------
  function Date(left: Types.TDate, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TDate(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Uint8Array
  // ------------------------------------------------------------------------------------------
  function Uint8Array(left: Types.TUint8Array, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TUint8Array(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Function
  // ------------------------------------------------------------------------------------------
  function Function(left: Types.TFunction, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TFunction(right)) return TypeExtendsResult.False
    if (left.parameters.length > right.parameters.length) return TypeExtendsResult.False
    if (!left.parameters.every((schema, index) => Visit(left.parameters[index], schema) === TypeExtendsResult.True)) {
      return TypeExtendsResult.False
    }
    return Visit(left.returns, right.returns)
  }
  // ------------------------------------------------------------------------------------------
  // Constructor
  // ------------------------------------------------------------------------------------------
  function Constructor(left: Types.TConstructor, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    if (!TypeGuard.TConstructor(right)) return TypeExtendsResult.False
    if (left.parameters.length > right.parameters.length) return TypeExtendsResult.False
    if (!left.parameters.every((schema, index) => Visit(left.parameters[index], schema) === TypeExtendsResult.True)) {
      return TypeExtendsResult.False
    }
    return Visit(left.returns, right.returns)
  }
  function Visit(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    const resolvedRight = right
    if (TypeGuard.TIntersect(left)) return Intersect(left, resolvedRight)
    if (TypeGuard.TUnion(left)) return Union(left, resolvedRight)
    if (TypeGuard.TAny(left)) return Any(left, resolvedRight)
    if (TypeGuard.TPrimitive(left)) return Primitive(left, right)
    if (TypeGuard.TLiteral(left)) return Literal(left, resolvedRight)
    if (TypeGuard.TObject(left)) return Object(left, resolvedRight)
    if (TypeGuard.TArray(left)) return Array(left, resolvedRight)
    if (TypeGuard.TTuple(left)) return Tuple(left, resolvedRight)
    if (TypeGuard.TPromise(left)) return Promise(left, resolvedRight)
    if (TypeGuard.TDate(left)) return Date(left, resolvedRight)
    if (TypeGuard.TUint8Array(left)) return Uint8Array(left, resolvedRight)
    if (TypeGuard.TFunction(left)) return Function(left, resolvedRight)
    if (TypeGuard.TConstructor(left)) return Constructor(left, resolvedRight)
    if (TypeGuard.TRecord(left)) return Record(left, resolvedRight)
    if (TypeGuard.TUserDefined(left)) throw Error(`TypeExtends: Cannot structurally compare custom type '${left[Types.Kind]}'`)
    throw Error(`TypeExtends: Unknown left operand '${left[Types.Kind]}'`)
  }
  export function Extends(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}
