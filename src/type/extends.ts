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
  // IntoBooleanResult
  // ------------------------------------------------------------------------------------------
  function IntoBooleanResult(result: TypeExtendsResult) {
    return result === TypeExtendsResult.False ? TypeExtendsResult.False : TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Any
  // ------------------------------------------------------------------------------------------
  function AnyRight(left: Types.TSchema, right: Types.TAny) {
    return TypeExtendsResult.True
  }
  function Any(left: Types.TAny, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right) && right.anyOf.some((schema) => TypeGuard.TAny(schema) || TypeGuard.TUnknown(schema))) return TypeExtendsResult.True
    if (TypeGuard.TUnion(right)) return TypeExtendsResult.Union
    if (TypeGuard.TUnknown(right)) return TypeExtendsResult.True
    if (TypeGuard.TAny(right)) return TypeExtendsResult.True
    return TypeExtendsResult.Union
  }
  // ------------------------------------------------------------------------------------------
  // Array
  // ------------------------------------------------------------------------------------------
  function ArrayRight(left: Types.TSchema, right: Types.TArray) {
    if (TypeGuard.TUnknown(left)) return TypeExtendsResult.False
    if (TypeGuard.TAny(left)) return TypeExtendsResult.Union
    if (TypeGuard.TNever(left)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  function Array(left: Types.TArray, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (!TypeGuard.TArray(right)) return TypeExtendsResult.False
    return IntoBooleanResult(Visit(left.items, right.items))
  }
  // ------------------------------------------------------------------------------------------
  // Boolean
  // ------------------------------------------------------------------------------------------
  function BooleanRight(left: Types.TSchema, right: Types.TBoolean) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'boolean') return TypeExtendsResult.True
    return TypeGuard.TBoolean(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Boolean(left: Types.TBoolean, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TBoolean(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Constructor
  // ------------------------------------------------------------------------------------------
  function Constructor(left: Types.TConstructor, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (!TypeGuard.TConstructor(right)) return TypeExtendsResult.False
    if (left.parameters.length > right.parameters.length) return TypeExtendsResult.False
    if (!left.parameters.every((schema, index) => IntoBooleanResult(Visit(right.parameters[index], schema)) === TypeExtendsResult.True)) {
      return TypeExtendsResult.False
    }
    return IntoBooleanResult(Visit(left.returns, right.returns))
  }
  // ------------------------------------------------------------------------------------------
  // Date
  // ------------------------------------------------------------------------------------------
  function Date(left: Types.TDate, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TDate(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Function
  // ------------------------------------------------------------------------------------------
  function Function(left: Types.TFunction, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (!TypeGuard.TFunction(right)) return TypeExtendsResult.False
    if (left.parameters.length > right.parameters.length) return TypeExtendsResult.False
    if (!left.parameters.every((schema, index) => IntoBooleanResult(Visit(right.parameters[index], schema)) === TypeExtendsResult.True)) {
      return TypeExtendsResult.False
    }
    return IntoBooleanResult(Visit(left.returns, right.returns))
  }
  // ------------------------------------------------------------------------------------------
  // Integer
  // ------------------------------------------------------------------------------------------
  function IntegerRight(left: Types.TSchema, right: Types.TInteger) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'number') return TypeExtendsResult.True
    return TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Integer(left: Types.TInteger, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TInteger(right) || TypeGuard.TNumber(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
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
  // Literal
  // ------------------------------------------------------------------------------------------
  function IsLiteralString(schema: Types.TLiteral) {
    return typeof schema.const === 'string'
  }
  function IsLiteralNumber(schema: Types.TLiteral) {
    return typeof schema.const === 'number'
  }
  function IsLiteralBoolean(schema: Types.TLiteral) {
    return typeof schema.const === 'boolean'
  }
  function Literal(left: Types.TLiteral, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    if (TypeGuard.TString(right)) return StringRight(left, right)
    if (TypeGuard.TNumber(right)) return NumberRight(left, right)
    if (TypeGuard.TInteger(right)) return IntegerRight(left, right)
    if (TypeGuard.TBoolean(right)) return BooleanRight(left, right)
    return TypeGuard.TLiteral(right) && right.const === left.const ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Never
  // ------------------------------------------------------------------------------------------
  function NeverRight(left: Types.TSchema, right: Types.TNever) {
    return TypeExtendsResult.True
  }
  function Never(left: Types.TNever, right: Types.TSchema) {
    return TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Null
  // ------------------------------------------------------------------------------------------
  function Null(left: Types.TNull, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TNull(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------------------------
  // Number
  // ------------------------------------------------------------------------------------------
  function NumberRight(left: Types.TSchema, right: Types.TNumber) {
    if (TypeGuard.TLiteral(left) && IsLiteralNumber(left)) return TypeExtendsResult.True
    return TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Number(left: Types.TNumber, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TInteger(right) || TypeGuard.TNumber(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Object
  // ------------------------------------------------------------------------------------------
  function IsObjectPropertyCount(schema: Types.TObject, count: number) {
    return globalThis.Object.keys(schema.properties).length === count
  }
  function IsObjectStringLike(schema: Types.TObject) {
    return IsObjectArrayLike(schema)
  }
  function IsObjectNumberLike(schema: Types.TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectBooleanLike(schema: Types.TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectDateLike(schema: Types.TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectUint8ArrayLike(schema: Types.TObject) {
    return IsObjectArrayLike(schema)
  }
  function IsObjectFunctionLike(schema: Types.TObject) {
    const length = Types.Type.Number()
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True)
  }
  function IsObjectConstructorLike(schema: Types.TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectArrayLike(schema: Types.TObject) {
    const length = Types.Type.Number()
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True)
  }
  function IsObjectPromiseLike(schema: Types.TObject) {
    const then = Types.Type.Function([Types.Type.Any()], Types.Type.Any())
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'then' in schema.properties && IntoBooleanResult(Visit(schema.properties['then'], then)) === TypeExtendsResult.True)
  }
  // ------------------------------------------------------------------------------------------
  // Property
  // ------------------------------------------------------------------------------------------
  function Property(left: Types.TSchema, right: Types.TSchema) {
    if (Visit(left, right) === TypeExtendsResult.False) return TypeExtendsResult.False
    if (TypeGuard.TOptional(left) && !TypeGuard.TOptional(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }
  function ObjectRight(left: Types.TSchema, right: Types.TObject) {
    if (TypeGuard.TUnknown(left)) return TypeExtendsResult.False
    if (TypeGuard.TAny(left)) return TypeExtendsResult.Union
    if (TypeGuard.TNever(left)) return TypeExtendsResult.True
    if (TypeGuard.TLiteral(left) && IsLiteralString(left) && IsObjectStringLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TLiteral(left) && IsLiteralNumber(left) && IsObjectNumberLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TLiteral(left) && IsLiteralBoolean(left) && IsObjectBooleanLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TString(left) && IsObjectStringLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TNumber(left) && IsObjectNumberLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TInteger(left) && IsObjectNumberLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TBoolean(left) && IsObjectBooleanLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TUint8Array(left) && IsObjectUint8ArrayLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TDate(left) && IsObjectDateLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TConstructor(left) && IsObjectConstructorLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TFunction(left) && IsObjectFunctionLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TRecord(left) && TypeGuard.TString(RecordKey(left))) {
      // When expressing a Record with literal key values, the Record is converted into a Object with
      // the Hint assigned as `Record`. This is used to invert the extends logic.
      return right[Types.Hint] === 'Record' ? TypeExtendsResult.True : TypeExtendsResult.False
    }
    if (TypeGuard.TRecord(left) && TypeGuard.TNumber(RecordKey(left))) {
      return IsObjectPropertyCount(right, 0) ? TypeExtendsResult.True : TypeExtendsResult.False
    }
    return TypeExtendsResult.False
  }
  function Object(left: Types.TObject, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
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
  // Promise
  // ------------------------------------------------------------------------------------------
  function Promise(left: Types.TPromise, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right) && IsObjectPromiseLike(right)) return TypeExtendsResult.True
    if (!TypeGuard.TPromise(right)) return TypeExtendsResult.False
    return IntoBooleanResult(Visit(left.item, right.item))
  }
  // ------------------------------------------------------------------------------------------
  // Record
  // ------------------------------------------------------------------------------------------
  function RecordKey(schema: Types.TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return Types.Type.Number()
    if ('^.*$' in schema.patternProperties) return Types.Type.String()
    throw Error('TypeExtends: Cannot get record key')
  }
  function RecordValue(schema: Types.TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return schema.patternProperties['^(0|[1-9][0-9]*)$']
    if ('^.*$' in schema.patternProperties) return schema.patternProperties['^.*$']
    throw Error('TypeExtends: Cannot get record value')
  }
  function RecordRight(left: Types.TSchema, right: Types.TRecord) {
    const Key = RecordKey(right)
    const Value = RecordValue(right)
    if (TypeGuard.TLiteral(left) && IsLiteralString(left) && TypeGuard.TNumber(Key) && IntoBooleanResult(Visit(left, Value)) === TypeExtendsResult.True) return TypeExtendsResult.True
    if (TypeGuard.TUint8Array(left) && TypeGuard.TNumber(Key)) return Visit(left, Value)
    if (TypeGuard.TString(left) && TypeGuard.TNumber(Key)) return Visit(left, Value)
    if (TypeGuard.TArray(left) && TypeGuard.TNumber(Key)) return Visit(left, Value)
    if (TypeGuard.TObject(left)) {
      for (const key of globalThis.Object.keys(left.properties)) {
        if (Property(Value, left.properties[key]) === TypeExtendsResult.False) {
          return TypeExtendsResult.False
        }
      }
      return TypeExtendsResult.True
    }
    return TypeExtendsResult.False
  }
  function Record(left: Types.TRecord, right: Types.TSchema) {
    const Value = RecordValue(left)
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (!TypeGuard.TRecord(right)) return TypeExtendsResult.False
    return Visit(Value, RecordValue(right))
  }
  // ------------------------------------------------------------------------------------------
  // String
  // ------------------------------------------------------------------------------------------
  function StringRight(left: Types.TSchema, right: Types.TString) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'string') return TypeExtendsResult.True
    return TypeGuard.TString(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function String(left: Types.TString, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TString(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Tuple
  // ------------------------------------------------------------------------------------------
  function TupleRight(left: Types.TSchema, right: Types.TTuple) {
    if (TypeGuard.TUnknown(left)) return TypeExtendsResult.False
    if (TypeGuard.TAny(left)) return TypeExtendsResult.Union
    if (TypeGuard.TNever(left)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  function IsArrayOfTuple(left: Types.TTuple, right: Types.TSchema) {
    return TypeGuard.TArray(right) && left.items !== undefined && left.items.every((schema) => Visit(schema, right.items) === TypeExtendsResult.True)
  }
  function Tuple(left: Types.TTuple, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right) && IsObjectArrayLike(right)) return TypeExtendsResult.True
    if (TypeGuard.TArray(right) && IsArrayOfTuple(left, right)) return TypeExtendsResult.True
    if (!TypeGuard.TTuple(right)) return TypeExtendsResult.False
    if ((left.items === undefined && right.items !== undefined) || (left.items !== undefined && right.items === undefined)) return TypeExtendsResult.False
    if (left.items === undefined && right.items === undefined) return TypeExtendsResult.True
    return left.items!.every((schema, index) => Visit(schema, right.items![index]) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Uint8Array
  // ------------------------------------------------------------------------------------------
  function Uint8Array(left: Types.TUint8Array, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    return TypeGuard.TUint8Array(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Undefined
  // ------------------------------------------------------------------------------------------
  function Undefined(left: Types.TUndefined, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TNever(right)) return NeverRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    if (TypeGuard.TRecord(right)) return RecordRight(left, right)
    if (TypeGuard.TVoid(right)) return VoidRight(left, right)
    return TypeGuard.TUndefined(right) ? TypeExtendsResult.True : TypeExtendsResult.False
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
  // Unknown
  // ------------------------------------------------------------------------------------------
  function UnknownRight(left: Types.TSchema, right: Types.TUnknown) {
    return TypeExtendsResult.True
  }
  function Unknown(left: Types.TUnknown, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TString(right)) return StringRight(left, right)
    if (TypeGuard.TNumber(right)) return NumberRight(left, right)
    if (TypeGuard.TInteger(right)) return IntegerRight(left, right)
    if (TypeGuard.TBoolean(right)) return BooleanRight(left, right)
    if (TypeGuard.TArray(right)) return ArrayRight(left, right)
    if (TypeGuard.TTuple(right)) return TupleRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    return TypeGuard.TUnknown(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Void
  // ------------------------------------------------------------------------------------------
  function VoidRight(left: Types.TSchema, right: Types.TVoid) {
    if (TypeGuard.TUndefined(left)) return TypeExtendsResult.True
    return TypeGuard.TUndefined(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Void(left: Types.TVoid, right: Types.TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    return TypeGuard.TVoid(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Visit(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    const resolvedRight = right
    if (TypeGuard.TAny(left)) return Any(left, resolvedRight)
    if (TypeGuard.TArray(left)) return Array(left, resolvedRight)
    if (TypeGuard.TBoolean(left)) return Boolean(left, right)
    if (TypeGuard.TConstructor(left)) return Constructor(left, resolvedRight)
    if (TypeGuard.TDate(left)) return Date(left, resolvedRight)
    if (TypeGuard.TFunction(left)) return Function(left, resolvedRight)
    if (TypeGuard.TInteger(left)) return Integer(left, right)
    if (TypeGuard.TIntersect(left)) return Intersect(left, resolvedRight)
    if (TypeGuard.TLiteral(left)) return Literal(left, resolvedRight)
    if (TypeGuard.TNever(left)) return Never(left, resolvedRight)
    if (TypeGuard.TNull(left)) return Null(left, resolvedRight)
    if (TypeGuard.TNumber(left)) return Number(left, right)
    if (TypeGuard.TRecord(left)) return Record(left, resolvedRight)
    if (TypeGuard.TString(left)) return String(left, right)
    if (TypeGuard.TObject(left)) return Object(left, resolvedRight)
    if (TypeGuard.TTuple(left)) return Tuple(left, resolvedRight)
    if (TypeGuard.TPromise(left)) return Promise(left, resolvedRight)
    if (TypeGuard.TUint8Array(left)) return Uint8Array(left, resolvedRight)
    if (TypeGuard.TUndefined(left)) return Undefined(left, resolvedRight)
    if (TypeGuard.TUnion(left)) return Union(left, resolvedRight)
    if (TypeGuard.TUnknown(left)) return Unknown(left, resolvedRight)
    if (TypeGuard.TVoid(left)) return Void(left, resolvedRight)
    if (TypeGuard.TUserDefined(left)) throw Error(`TypeExtends: Cannot structurally compare type '${left[Types.Kind]}'`)
    throw Error(`TypeExtends: Unknown left operand '${left[Types.Kind]}'`)
  }
  export function Extends(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}
