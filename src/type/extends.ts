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

// --------------------------------------------------------------------------
// TypeExtendsResult
// --------------------------------------------------------------------------

export enum TypeExtendsResult {
  Union,
  True,
  False,
}

// --------------------------------------------------------------------------
// TypeExtends
// --------------------------------------------------------------------------

/** Performs structural equivalence checks against TypeBox types. */
export namespace TypeExtends {
  const referenceMap = new Map<string, Types.TAnySchema>()

  // ------------------------------------------------------------------------
  // Rules
  // ------------------------------------------------------------------------

  function AnyUnknownOrCustomRule(right: Types.TSchema) {
    // https://github.com/microsoft/TypeScript/issues/40049
    if (TypeGuard.TUnion(right) && right.anyOf.some((schema: Types.TSchema) => schema[Types.Kind] === 'Any' || schema[Types.Kind] === 'Unknown')) return true
    if (TypeGuard.TUnknown(right)) return true
    if (TypeGuard.TAny(right)) return true
    if (TypeGuard.TUserDefined(right)) throw Error(`Structural: Cannot structurally compare custom type '${right[Types.Kind]}'`)
    return false
  }

  function ObjectRightRule(left: Types.TAnySchema, right: Types.TObject) {
    // type A = boolean extends {}     ? 1 : 2 // additionalProperties: false
    // type B = boolean extends object ? 1 : 2 // additionalProperties: true
    const additionalProperties = right.additionalProperties
    const propertyLength = globalThis.Object.keys(right.properties).length
    return additionalProperties === false && propertyLength === 0
  }

  function UnionRightRule(left: Types.TAnySchema, right: Types.TUnion): TypeExtendsResult {
    const result = right.anyOf.some((right: Types.TSchema) => Visit(left, right) !== TypeExtendsResult.False)
    return result ? TypeExtendsResult.True : TypeExtendsResult.False
  }

  // ------------------------------------------------------------------------
  // Records
  // ------------------------------------------------------------------------

  function RecordPattern(schema: Types.TRecord) {
    return globalThis.Object.keys(schema.patternProperties)[0] as string
  }

  function RecordNumberOrStringKey(schema: Types.TRecord) {
    const pattern = RecordPattern(schema)
    return pattern === '^.*$' || pattern === '^(0|[1-9][0-9]*)$'
  }

  function RecordValue(schema: Types.TRecord) {
    const pattern = RecordPattern(schema)
    return schema.patternProperties[pattern]
  }

  function RecordKey(schema: Types.TRecord) {
    const pattern = RecordPattern(schema)
    if (pattern === '^.*$') {
      return Types.Type.String()
    } else if (pattern === '^(0|[1-9][0-9]*)$') {
      return Types.Type.Number()
    } else {
      const keys = pattern.slice(1, pattern.length - 1).split('|')
      const schemas = keys.map((key) => (isNaN(+key) ? Types.Type.Literal(key) : Types.Type.Literal(parseFloat(key))))
      return Types.Type.Union(schemas)
    }
  }

  function PropertyMap(schema: Types.TObject | Types.TRecord) {
    const comparable = new Map<string, Types.TSchema>()
    if (TypeGuard.TRecord(schema)) {
      const propertyPattern = RecordPattern(schema as Types.TRecord)
      if (propertyPattern === '^.*$' || propertyPattern === '^(0|[1-9][0-9]*)$') throw Error('Cannot extract record properties without property constraints')
      const propertySchema = schema.patternProperties[propertyPattern] as Types.TSchema
      const propertyKeys = propertyPattern.slice(1, propertyPattern.length - 1).split('|')
      propertyKeys.forEach((propertyKey) => {
        comparable.set(propertyKey, propertySchema)
      })
    } else {
      globalThis.Object.entries(schema.properties).forEach(([propertyKey, propertySchema]) => {
        comparable.set(propertyKey, propertySchema as Types.TSchema)
      })
    }
    return comparable
  }

  // ------------------------------------------------------------------------
  // Indexable
  // ------------------------------------------------------------------------

  function Indexable<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TUnion(right)) {
      return TypeExtendsResult.False
    } else {
      return Visit(left, right)
    }
  }

  // ------------------------------------------------------------------------
  // Checks
  // ------------------------------------------------------------------------

  function Any(left: Types.TAny, right: Types.TSchema): TypeExtendsResult {
    return AnyUnknownOrCustomRule(right) ? TypeExtendsResult.True : TypeExtendsResult.Union
  }

  function Array(left: Types.TArray, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      if (right.properties['length'] !== undefined && right.properties['length'][Types.Kind] === 'Number') return TypeExtendsResult.True
      if (globalThis.Object.keys(right.properties).length === 0) return TypeExtendsResult.True
      return TypeExtendsResult.False
    } else if (!TypeGuard.TArray(right)) {
      return TypeExtendsResult.False
    } else if (left.items === undefined && right.items !== undefined) {
      return TypeExtendsResult.False
    } else if (left.items !== undefined && right.items === undefined) {
      return TypeExtendsResult.False
    } else if (left.items === undefined && right.items === undefined) {
      return TypeExtendsResult.False
    } else {
      const result = Visit(left.items, right.items) !== TypeExtendsResult.False
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    }
  }

  function Boolean(left: Types.TBoolean, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TBoolean(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Constructor(left: Types.TConstructor, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && globalThis.Object.keys(right.properties).length === 0) {
      return TypeExtendsResult.True
    } else if (!TypeGuard.TConstructor(right)) {
      return TypeExtendsResult.False
    } else if (right.parameters.length < left.parameters.length) {
      return TypeExtendsResult.False
    } else {
      if (Visit(left.returns, right.returns) === TypeExtendsResult.False) {
        return TypeExtendsResult.False
      }
      for (let i = 0; i < left.parameters.length; i++) {
        const result = Visit(right.parameters[i], left.parameters[i])
        if (result === TypeExtendsResult.False) return TypeExtendsResult.False
      }
      return TypeExtendsResult.True
    }
  }

  function Date(left: Types.TDate, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TRecord(right)) {
      return TypeExtendsResult.False
    } else if (TypeGuard.TDate(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Function(left: Types.TFunction, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      if (right.properties['length'] !== undefined && right.properties['length'][Types.Kind] === 'Number') return TypeExtendsResult.True
      if (globalThis.Object.keys(right.properties).length === 0) return TypeExtendsResult.True
      return TypeExtendsResult.False
    } else if (!TypeGuard.TFunction(right)) {
      return TypeExtendsResult.False
    } else if (right.parameters.length < left.parameters.length) {
      return TypeExtendsResult.False
    } else if (Visit(left.returns, right.returns) === TypeExtendsResult.False) {
      return TypeExtendsResult.False
    } else {
      for (let i = 0; i < left.parameters.length; i++) {
        const result = Visit(right.parameters[i], left.parameters[i])
        if (result === TypeExtendsResult.False) return TypeExtendsResult.False
      }
      return TypeExtendsResult.True
    }
  }

  function Integer(left: Types.TInteger, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TInteger(right) || TypeGuard.TNumber(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Literal(left: Types.TLiteral, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TRecord(right)) {
      if (typeof left.const === 'string') {
        return Indexable(left, RecordValue(right as Types.TRecord))
      } else {
        return TypeExtendsResult.False
      }
    } else if (TypeGuard.TLiteral(right) && left.const === right.const) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TString(right) && typeof left.const === 'string') {
      return TypeExtendsResult.True
    } else if (TypeGuard.TNumber(right) && typeof left.const === 'number') {
      return TypeExtendsResult.True
    } else if (TypeGuard.TInteger(right) && typeof left.const === 'number') {
      return TypeExtendsResult.True
    } else if (TypeGuard.TBoolean(right) && typeof left.const === 'boolean') {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Number(left: Types.TNumber, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TNumber(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TInteger(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Null(left: Types.TNull, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TNull(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Properties(left: Map<string, Types.TSchema>, right: Map<string, Types.TSchema>) {
    if (right.size > left.size) return TypeExtendsResult.False
    if (![...right.keys()].every((rightKey) => left.has(rightKey))) return TypeExtendsResult.False
    for (const rightKey of right.keys()) {
      const leftProp = left.get(rightKey)!
      const rightProp = right.get(rightKey)!
      if (Visit(leftProp, rightProp) === TypeExtendsResult.False) {
        return TypeExtendsResult.False
      }
    }
    return TypeExtendsResult.True
  }

  function Object(left: Types.TObject, right: Types.TAnySchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      return Properties(PropertyMap(left), PropertyMap(right))
    } else if (TypeGuard.TRecord(right)) {
      if (!RecordNumberOrStringKey(right as Types.TRecord)) {
        return Properties(PropertyMap(left), PropertyMap(right))
      } else {
        return TypeExtendsResult.True
      }
    } else {
      return TypeExtendsResult.False
    }
  }

  function Promise(left: Types.TPromise, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      if (ObjectRightRule(left, right) || globalThis.Object.keys(right.properties).length === 0) {
        return TypeExtendsResult.True
      } else {
        return TypeExtendsResult.False
      }
    } else if (!TypeGuard.TPromise(right)) {
      return TypeExtendsResult.False
    } else {
      const result = Visit(left.item, right.item) !== TypeExtendsResult.False
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    }
  }

  function Record(left: Types.TRecord, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      if (RecordPattern(left) === '^.*$' && right[Types.Hint] === 'Record') {
        return TypeExtendsResult.True
      } else if (RecordPattern(left) === '^.*$') {
        return TypeExtendsResult.False
      } else {
        return globalThis.Object.keys(right.properties).length === 0 ? TypeExtendsResult.True : TypeExtendsResult.False
      }
    } else if (TypeGuard.TRecord(right)) {
      if (!RecordNumberOrStringKey(left as Types.TRecord) && !RecordNumberOrStringKey(right as Types.TRecord)) {
        return Properties(PropertyMap(left), PropertyMap(right))
      } else if (RecordNumberOrStringKey(left as Types.TRecord) && !RecordNumberOrStringKey(right as Types.TRecord)) {
        const leftKey = RecordKey(left as Types.TRecord)
        const rightKey = RecordKey(right as Types.TRecord)
        if (Visit(rightKey, leftKey) === TypeExtendsResult.False) {
          return TypeExtendsResult.False
        } else {
          return TypeExtendsResult.True
        }
      } else {
        return TypeExtendsResult.True
      }
    } else {
      return TypeExtendsResult.False
    }
  }

  function Ref(left: Types.TRef, right: Types.TSchema): TypeExtendsResult {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Visit(resolved, right)
  }

  function Self(left: Types.TSelf, right: Types.TSchema): TypeExtendsResult {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced self $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Visit(resolved, right)
  }

  function String(left: Types.TString, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TRecord(right)) {
      return Indexable(left, RecordValue(right))
    } else if (TypeGuard.TString(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Tuple(left: Types.TTuple, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right)) {
      const result = ObjectRightRule(left, right) || globalThis.Object.keys(right.properties).length === 0
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    } else if (TypeGuard.TRecord(right)) {
      return Indexable(left, RecordValue(right))
    } else if (TypeGuard.TArray(right)) {
      if (right.items === undefined) {
        return TypeExtendsResult.False
      } else if (TypeGuard.TUnion(right.items) && left.items) {
        const result = left.items.every((left: Types.TSchema) => UnionRightRule(left, right.items as Types.TUnion) !== TypeExtendsResult.False)
        return result ? TypeExtendsResult.True : TypeExtendsResult.False
      } else if (TypeGuard.TAny(right.items)) {
        return TypeExtendsResult.True
      } else {
        return TypeExtendsResult.False
      }
    }
    if (!TypeGuard.TTuple(right)) return TypeExtendsResult.False
    if (left.items === undefined && right.items === undefined) return TypeExtendsResult.True
    if (left.items === undefined && right.items !== undefined) return TypeExtendsResult.False
    if (left.items !== undefined && right.items === undefined) return TypeExtendsResult.False
    if (left.items === undefined && right.items === undefined) return TypeExtendsResult.True
    if (left.minItems !== right.minItems || left.maxItems !== right.maxItems) return TypeExtendsResult.False
    for (let i = 0; i < left.items!.length; i++) {
      if (Visit(left.items![i], right.items![i]) === TypeExtendsResult.False) return TypeExtendsResult.False
    }
    return TypeExtendsResult.True
  }

  function Uint8Array(left: Types.TUint8Array, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TObject(right) && ObjectRightRule(left, right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TRecord(right)) {
      return Indexable(left, RecordValue(right as Types.TRecord))
    } else if (TypeGuard.TUint8Array(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Undefined(left: Types.TUndefined, right: Types.TSchema): TypeExtendsResult {
    if (AnyUnknownOrCustomRule(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUndefined(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TVoid(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnion(right)) {
      return UnionRightRule(left, right)
    } else {
      return TypeExtendsResult.False
    }
  }

  function Union(left: Types.TUnion, right: Types.TSchema): TypeExtendsResult {
    if (left.anyOf.some((left: Types.TSchema) => TypeGuard.TAny(left))) {
      return TypeExtendsResult.Union
    } else if (TypeGuard.TUnion(right)) {
      const result = left.anyOf.every((left: Types.TSchema) => right.anyOf.some((right: Types.TSchema) => Visit(left, right) !== TypeExtendsResult.False))
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    } else {
      const result = left.anyOf.every((left: Types.TSchema) => Visit(left, right) !== TypeExtendsResult.False)
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    }
  }

  function Unknown(left: Types.TUnknown, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TUnion(right)) {
      const result = right.anyOf.some((right: Types.TSchema) => TypeGuard.TAny(right) || TypeGuard.TUnknown(right))
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    } else if (TypeGuard.TAny(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnknown(right)) {
      return TypeExtendsResult.True
    } else {
      return TypeExtendsResult.False
    }
  }

  function Void(left: Types.TVoid, right: Types.TSchema): TypeExtendsResult {
    if (TypeGuard.TUnion(right)) {
      const result = right.anyOf.some((right: Types.TSchema) => TypeGuard.TAny(right) || TypeGuard.TUnknown(right))
      return result ? TypeExtendsResult.True : TypeExtendsResult.False
    } else if (TypeGuard.TAny(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TUnknown(right)) {
      return TypeExtendsResult.True
    } else if (TypeGuard.TVoid(right)) {
      return TypeExtendsResult.True
    } else {
      return TypeExtendsResult.False
    }
  }

  let recursionDepth = 0
  function Visit<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Types.TSchema): TypeExtendsResult {
    recursionDepth += 1
    if (recursionDepth >= 1000) return TypeExtendsResult.True
    if (left.$id !== undefined) referenceMap.set(left.$id!, left)
    if (right.$id !== undefined) referenceMap.set(right.$id!, right)
    const resolvedRight = right[Types.Kind] === 'Self' ? referenceMap.get(right.$ref)! : right
    if (TypeGuard.TAny(left)) {
      return Any(left, resolvedRight)
    } else if (TypeGuard.TArray(left)) {
      return Array(left, resolvedRight)
    } else if (TypeGuard.TBoolean(left)) {
      return Boolean(left, resolvedRight)
    } else if (TypeGuard.TConstructor(left)) {
      return Constructor(left, resolvedRight)
    } else if (TypeGuard.TDate(left)) {
      return Date(left, resolvedRight)
    } else if (TypeGuard.TFunction(left)) {
      return Function(left, resolvedRight)
    } else if (TypeGuard.TInteger(left)) {
      return Integer(left, resolvedRight)
    } else if (TypeGuard.TLiteral(left)) {
      return Literal(left, resolvedRight)
    } else if (TypeGuard.TNull(left)) {
      return Null(left, resolvedRight)
    } else if (TypeGuard.TNumber(left)) {
      return Number(left, resolvedRight)
    } else if (TypeGuard.TObject(left)) {
      return Object(left, resolvedRight)
    } else if (TypeGuard.TPromise(left)) {
      return Promise(left, resolvedRight)
    } else if (TypeGuard.TRecord(left)) {
      return Record(left, resolvedRight)
    } else if (TypeGuard.TRef(left)) {
      return Ref(left, resolvedRight)
    } else if (TypeGuard.TSelf(left)) {
      return Self(left, resolvedRight)
    } else if (TypeGuard.TString(left)) {
      return String(left, resolvedRight)
    } else if (TypeGuard.TTuple(left)) {
      return Tuple(left, resolvedRight)
    } else if (TypeGuard.TUndefined(left)) {
      return Undefined(left, resolvedRight)
    } else if (TypeGuard.TUint8Array(left)) {
      return Uint8Array(left, resolvedRight)
    } else if (TypeGuard.TUnion(left)) {
      return Union(left, resolvedRight)
    } else if (TypeGuard.TUnknown(left)) {
      return Unknown(left, resolvedRight)
    } else if (TypeGuard.TVoid(left)) {
      return Void(left, resolvedRight)
    } else if (TypeGuard.TUserDefined(left)) {
      throw Error(`Structural: Cannot structurally compare custom type '${left[Types.Kind]}'`)
    } else {
      throw Error(`Structural: Unknown left operand '${left[Types.Kind]}'`)
    }
  }

  /** Structurally tests if the left schema extends the right. */
  export function Check(left: Types.TSchema, right: Types.TSchema): TypeExtendsResult {
    referenceMap.clear()
    recursionDepth = 0
    return Visit(left, right)
  }
}
