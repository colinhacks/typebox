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

// --------------------------------------------------------------------------
// Symbols
// --------------------------------------------------------------------------
export const Kind = Symbol.for('TypeBox.Kind')
export const Hint = Symbol.for('TypeBox.Hint')
export const Modifier = Symbol.for('TypeBox.Modifier')

// -------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------
export type TupleToIntersect<T extends any[]> = T extends [infer I] ? I : T extends [infer I, ...infer R] ? I & TupleToIntersect<R> : never
export type TupleToUnion<T extends any[]> = { [K in keyof T]: T[K] }[number]
export type UnionToIntersect<U> = (U extends unknown ? (arg: U) => 0 : never) extends (arg: infer I) => 0 ? I : never
export type UnionLast<U> = UnionToIntersect<U extends unknown ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never
export type UnionToTuple<U, L = UnionLast<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, L>>, L]
export type Evaluate<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
export type Assert<T, E> = T extends E ? T : never

// --------------------------------------------------------------------------
// Modifiers
// --------------------------------------------------------------------------
export type TModifier = TReadonlyOptional<TSchema> | TOptional<TSchema> | TReadonly<TSchema>
export type TReadonly<T extends TSchema> = T & { [Modifier]: 'Readonly' }
export type TOptional<T extends TSchema> = T & { [Modifier]: 'Optional' }
export type TReadonlyOptional<T extends TSchema> = T & { [Modifier]: 'ReadonlyOptional' }

// --------------------------------------------------------------------------
// Schema
// --------------------------------------------------------------------------
export interface SchemaOptions {
  $schema?: string
  /** Id for this schema */
  $id?: string
  /** Title of this schema */
  title?: string
  /** Description of this schema */
  description?: string
  /** Default value for this schema */
  default?: any
  /** Example values matching this schema. */
  examples?: any
  [prop: string]: any
}

export interface TKind {
  [Kind]: string
}

export interface TSchema extends SchemaOptions, TKind {
  [Hint]?: string
  [Modifier]?: string
  params: unknown[]
  static: unknown
}

// --------------------------------------------------------------------------
// TAnySchema
// --------------------------------------------------------------------------

export type TAnySchema =
  | TSchema
  | TAny
  | TArray
  | TBoolean
  | TConstructor
  | TDate
  | TEnum
  | TFunction
  | TInteger
  | TIntersect
  | TLiteral
  | TNull
  | TNumber
  | TObject
  | TPromise
  | TRecord
  | TSelf
  | TSymbol
  | TRef
  | TString
  | TTuple
  | TUndefined
  | TUnion
  | TUint8Array
  | TUnknown
  | TVoid

// --------------------------------------------------------------------------
// TNumeric
// --------------------------------------------------------------------------

export interface NumericOptions extends SchemaOptions {
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  multipleOf?: number
}

export type TNumeric = TInteger | TNumber

// --------------------------------------------------------------------------
// Any
// --------------------------------------------------------------------------

export interface TAny extends TSchema {
  [Kind]: 'Any'
  static: any
}

// --------------------------------------------------------------------------
// Array
// --------------------------------------------------------------------------

export interface ArrayOptions extends SchemaOptions {
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
}

export interface TArray<T extends TSchema = TSchema> extends TSchema, ArrayOptions {
  [Kind]: 'Array'
  static: Array<Static<T, this['params']>>
  type: 'array'
  items: T
}

// --------------------------------------------------------------------------
// Boolean
// --------------------------------------------------------------------------

export interface TBoolean extends TSchema {
  [Kind]: 'Boolean'
  static: boolean
  type: 'boolean'
}

// --------------------------------------------------------------------------
// Constructor
// --------------------------------------------------------------------------

export type TConstructorParameters<T extends TConstructor<TSchema[], TSchema>> = TTuple<T['parameters']>
export type TInstanceType<T extends TConstructor<TSchema[], TSchema>> = T['returns']
export type StaticContructorParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]
export interface TConstructor<T extends TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Constructor'
  static: new (...param: StaticContructorParameters<T, this['params']>) => Static<U, this['params']>
  type: 'object'
  instanceOf: 'Constructor'
  parameters: T
  returns: U
}

// --------------------------------------------------------------------------
// Date
// --------------------------------------------------------------------------
export interface DateOptions extends SchemaOptions {
  exclusiveMaximumTimestamp?: number
  exclusiveMinimumTimestamp?: number
  maximumTimestamp?: number
  minimumTimestamp?: number
}

export interface TDate extends TSchema, DateOptions {
  [Kind]: 'Date'
  static: Date
  type: 'object'
  instanceOf: 'Date'
}

// --------------------------------------------------------------------------
// Enum
// --------------------------------------------------------------------------
export interface TEnumOption<T> {
  type: 'number' | 'string'
  const: T
}

export interface TEnum<T extends Record<string, string | number> = Record<string, string | number>> extends TSchema {
  [Kind]: 'Union'
  static: T[keyof T]
  anyOf: TLiteral<string | number>[]
}
// ------------------------------------------------------------------------
// Extends
// ------------------------------------------------------------------------

export type TExtends<L extends TSchema, R extends TSchema, T extends TSchema, U extends TSchema> = Static<L> extends Static<R> ? T : U

// ------------------------------------------------------------------------
// Exclude
// ------------------------------------------------------------------------
export interface TExclude<T extends TUnion, U extends TUnion> extends TUnion<any[]> {
  static: Exclude<Static<T, this['params']>, Static<U, this['params']>>
}

// ------------------------------------------------------------------------
// Extract
// ------------------------------------------------------------------------
export interface TExtract<T extends TSchema, U extends TUnion> extends TUnion<any[]> {
  static: Extract<Static<T, this['params']>, Static<U, this['params']>>
}

// --------------------------------------------------------------------------
// Function
// --------------------------------------------------------------------------
export type TParameters<T extends TFunction> = TTuple<T['parameters']>
export type TReturnType<T extends TFunction> = T['returns']
export type TFunctionParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]
export interface TFunction<T extends readonly TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Function'
  static: (...param: TFunctionParameters<T, this['params']>) => Static<U, this['params']>
  type: 'object'
  instanceOf: 'Function'
  parameters: T
  returns: U
}

// --------------------------------------------------------------------------
// Integer
// --------------------------------------------------------------------------

export interface TInteger extends TSchema, NumericOptions {
  [Kind]: 'Integer'
  static: number
  type: 'integer'
}

// --------------------------------------------------------------------------
// Intersect
// --------------------------------------------------------------------------

export type IntersectReduce<I extends unknown, T extends readonly any[]> = T extends [infer A, ...infer B] ? IntersectReduce<I & A, B> : I extends object ? I : {}

// note: rename to IntersectStatic<T, P> in next minor release
export type IntersectEvaluate<T extends readonly TSchema[], P extends unknown[]> = { [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }

export type IntersectProperties<T extends readonly TObject[]> = {
  [K in keyof T]: T[K] extends TObject<infer P> ? P : {}
}

export interface IntersectOptions extends SchemaOptions {
  unevaluatedProperties?: boolean
}

type IntersectStatic<T extends TSchema[], P extends unknown[]> = TupleToIntersect<{ [K in keyof T]: Static<Assert<T[K], TSchema>, P> }>

export interface TIntersect<T extends TSchema[] = TSchema[]> extends TSchema, IntersectOptions {
  [Kind]: 'Intersect'
  static: IntersectStatic<T, []>
  allOf: [...T]
}

// -------------------------------------------------------------------------
// KeyOf
// -------------------------------------------------------------------------
// prettier-ignore
export type TKeyOfTuple<T extends TSchema> = { 
  [K in keyof Static<T>]: TLiteral<Assert<K, TLiteralValue>> 
} extends infer U ? UnionToTuple<{ [K in keyof U]: U[K] }[keyof U]> : never

// prettier-ignore
export type TKeyOf<T extends TSchema = TSchema> = (
  T extends TIntersect ? TKeyOfTuple<T> :
  T extends TUnion     ? TKeyOfTuple<T> :
  T extends TObject    ? TKeyOfTuple<T> :
  []
) extends infer R ? R extends [] ? TNever : TUnion<Assert<R, TSchema[]>> : never

// --------------------------------------------------------------------------
// Literal
// --------------------------------------------------------------------------

export type TLiteralValue = string | number | boolean

export interface TLiteral<T extends TLiteralValue = TLiteralValue> extends TSchema {
  [Kind]: 'Literal'
  static: T
  const: T
}

// --------------------------------------------------------------------------
// Never
// --------------------------------------------------------------------------

export interface TNever extends TSchema {
  [Kind]: 'Never'
  static: never
  allOf: [{ type: 'boolean'; const: false }, { type: 'boolean'; const: true }]
}

// --------------------------------------------------------------------------
// Not
// --------------------------------------------------------------------------

export type StaticNot<L, R = unknown> = unknown extends R ? unknown : L extends R ? R : any // universal type

export interface TNot<Not extends TSchema = TSchema, T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Not'
  static: StaticNot<Static<Not>, Static<T>>
  allOf: [{ not: Not }, T]
}

// --------------------------------------------------------------------------
// Null
// --------------------------------------------------------------------------

export interface TNull extends TSchema {
  [Kind]: 'Null'
  static: null
  type: 'null'
}

// --------------------------------------------------------------------------
// Number
// --------------------------------------------------------------------------

export interface TNumber extends TSchema, NumericOptions {
  [Kind]: 'Number'
  static: number
  type: 'number'
}

// --------------------------------------------------------------------------
// Object
// --------------------------------------------------------------------------

export type ReadonlyOptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonlyOptional<TSchema> ? K : never }[keyof T]
export type ReadonlyPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonly<TSchema> ? K : never }[keyof T]
export type OptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TOptional<TSchema> ? K : never }[keyof T]
export type RequiredPropertyKeys<T extends TProperties> = keyof Omit<T, ReadonlyOptionalPropertyKeys<T> | ReadonlyPropertyKeys<T> | OptionalPropertyKeys<T>>

// prettier-ignore
export type PropertiesReducer<T extends TProperties, R extends Record<keyof any, unknown>> = (
  Readonly<Partial<Pick<R, ReadonlyOptionalPropertyKeys<T>>>> &
  Readonly<Pick<R, ReadonlyPropertyKeys<T>>> &
  Partial<Pick<R, OptionalPropertyKeys<T>>> &
  Required<Pick<R, RequiredPropertyKeys<T>>>
) extends infer O ? { [K in keyof O]: O[K] } : never

// prettier-ignore
export type PropertiesReduce<T extends TProperties, P extends unknown[]> = PropertiesReducer<T, {
  [K in keyof T]: Static<T[K], P>
}>

export type TRecordProperties<K extends TUnion<TLiteral[]>, T extends TSchema> = Static<K> extends string ? { [X in Static<K>]: T } : never

export type TProperties = Record<keyof any, TSchema>

export type ObjectProperties<T> = T extends TObject<infer U> ? U : never

export type ObjectPropertyKeys<T> = T extends TObject<infer U> ? keyof U : never

export type TAdditionalProperties = undefined | TSchema | boolean

export interface ObjectOptions extends SchemaOptions {
  additionalProperties?: TAdditionalProperties
  minProperties?: number
  maxProperties?: number
}

export interface TObject<T extends TProperties = TProperties> extends TSchema, ObjectOptions {
  [Kind]: 'Object'
  static: PropertiesReduce<T, this['params']>
  additionalProperties?: TAdditionalProperties
  type: 'object'
  properties: T
  required?: string[]
}

// -------------------------------------------------------------------------------------
// Omit
// -------------------------------------------------------------------------------------
export type TOmitArray<T extends TSchema[], K extends keyof any> = Assert<{ [K2 in keyof T]: TOmit<Assert<T[K2], TSchema>, K> }, TSchema[]>
export type TOmitProperties<T extends TProperties, K extends keyof any> = Evaluate<Assert<Omit<T, K>, TProperties>>

// prettier-ignore
export type TOmit<T extends TSchema, K extends keyof any> = 
  T extends TIntersect<infer S> ? TIntersect<TOmitArray<S, K>> : 
  T extends TUnion<infer S> ? TUnion<TOmitArray<S, K>> : 
  T extends TObject<infer S> ? TObject<TOmitProperties<S, K>> : 
  T

// --------------------------------------------------------------------------
// Partial
// --------------------------------------------------------------------------
export type TPartialArray<T extends TSchema[]> = Assert<{ [K in keyof T]: TPartial<Assert<T[K], TSchema>> }, TSchema[]>

// prettier-ignore
export type TPartialProperties<T extends TProperties> = Evaluate<Assert<{
  [K in keyof T]: 
    T[K] extends TReadonlyOptional<infer U> ? TReadonlyOptional<U> : 
    T[K] extends TReadonly<infer U>         ? TReadonlyOptional<U> : 
    T[K] extends TOptional<infer U>         ? TOptional<U>         : 
    TOptional<T[K]>
}, TProperties>>

// prettier-ignore
export type TPartial<T extends TSchema> = 
  T extends TIntersect<infer S> ? TIntersect<TPartialArray<S>> : 
  T extends TUnion<infer S>     ? TUnion<TPartialArray<S>> : 
  T extends TObject<infer S>    ? TObject<TPartialProperties<S>> : 
  T

// -------------------------------------------------------------------------------------
// Pick
// -------------------------------------------------------------------------------------
export type TPickArray<T extends TSchema[], K extends keyof any> = Assert<{ [K2 in keyof T]: TPick<Assert<T[K2], TSchema>, K> }, TSchema[]>
export type TPickProperties<T extends TProperties, K extends keyof any> = Evaluate<Assert<Pick<T, K>, TProperties>>

// prettier-ignore
export type TPick<T extends TSchema, K extends keyof any> = 
  T extends TIntersect<infer S> ? TIntersect<TPickArray<S, K>> : 
  T extends TUnion<infer S>     ? TUnion<TPickArray<S, K>> : 
  T extends TObject<infer S>    ? TObject<TPickProperties<S, K>> : 
  T

// --------------------------------------------------------------------------
// Promise
// --------------------------------------------------------------------------

export interface TPromise<T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Promise'
  static: Promise<Static<T, this['params']>>
  type: 'object'
  instanceOf: 'Promise'
  item: TSchema
}

// --------------------------------------------------------------------------
// Record
// --------------------------------------------------------------------------

export type TRecordKey = TString | TNumeric | TUnion<TLiteral<any>[]>

export interface TRecord<K extends TRecordKey = TRecordKey, T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Record'
  static: Record<Static<K>, Static<T, this['params']>>
  type: 'object'
  patternProperties: { [pattern: string]: T }
  additionalProperties: false
}

// --------------------------------------------------------------------------
// Recursive
// --------------------------------------------------------------------------

export interface TSelf extends TSchema {
  [Kind]: 'Self'
  static: this['params'][0]
  $ref: string
}

export type TRecursiveReduce<T extends TSchema> = Static<T, [TRecursiveReduce<T>]>

export interface TRecursive<T extends TSchema> extends TSchema {
  static: TRecursiveReduce<T>
}

// --------------------------------------------------------------------------
// Ref
// --------------------------------------------------------------------------

export interface TRef<T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Ref'
  static: Static<T, this['params']>
  $ref: string
}

// -------------------------------------------------------------------------
// Required
// -------------------------------------------------------------------------
export type TRequiredArray<T extends TSchema[]> = Assert<{ [K in keyof T]: TRequired<Assert<T[K], TSchema>> }, TSchema[]>

// prettier-ignore
export type TRequiredProperties<T extends TProperties> = Evaluate<Assert<{
  [K in keyof T]: 
    T[K] extends TReadonlyOptional<infer U> ? TReadonly<U> : 
    T[K] extends TReadonly<infer U>         ? TReadonly<U> :  
    T[K] extends TOptional<infer U>         ? U : 
    T[K]
}, TProperties>>

// prettier-ignore
export type TRequired<T extends TSchema> = 
  T extends TIntersect<infer S> ? TIntersect<TRequiredArray<S>> : 
  T extends TUnion<infer S>     ? TUnion<TRequiredArray<S>> : 
  T extends TObject<infer S>    ? TObject<TRequiredProperties<S>> : 
  T

// --------------------------------------------------------------------------
// String
// --------------------------------------------------------------------------

export type StringFormatOption =
  | 'date-time'
  | 'time'
  | 'date'
  | 'email'
  | 'idn-email'
  | 'hostname'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | 'uri-reference'
  | 'iri'
  | 'uuid'
  | 'iri-reference'
  | 'uri-template'
  | 'json-pointer'
  | 'relative-json-pointer'
  | 'regex'

export interface StringOptions<Format extends string> extends SchemaOptions {
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: Format
  contentEncoding?: '7bit' | '8bit' | 'binary' | 'quoted-printable' | 'base64'
  contentMediaType?: string
}

export interface TString<Format extends string = string> extends TSchema, StringOptions<Format> {
  [Kind]: 'String'
  static: string
  type: 'string'
}

// --------------------------------------------------------------------------
// Symbol
// --------------------------------------------------------------------------

export type SymbolValue = string | number | undefined

export interface TSymbol<Value extends SymbolValue = SymbolValue> extends TSchema, SchemaOptions {
  [Kind]: 'Symbol'
  static: symbol
  value: Value
}
// --------------------------------------------------------------------------
// Tuple
// --------------------------------------------------------------------------

export type TupleToArray<T extends TTuple<TSchema[]>> = T extends TTuple<infer R> ? R : never

export interface TTuple<T extends TSchema[] = TSchema[]> extends TSchema {
  [Kind]: 'Tuple'
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : T[K] }
  type: 'array'
  items?: T
  additionalItems?: false
  minItems: number
  maxItems: number
}

// --------------------------------------------------------------------------
// Undefined
// --------------------------------------------------------------------------

export interface TUndefined extends TSchema {
  [Kind]: 'Undefined'
  static: undefined
  type: 'null'
  typeOf: 'Undefined'
}

// --------------------------------------------------------------------------
// Union
// --------------------------------------------------------------------------

export interface TUnion<T extends TSchema[] = TSchema[]> extends TSchema {
  [Kind]: 'Union'
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : never }[number]
  anyOf: T
}

// -------------------------------------------------------------------------
// Uint8Array
// -------------------------------------------------------------------------

export interface Uint8ArrayOptions extends SchemaOptions {
  maxByteLength?: number
  minByteLength?: number
}

export interface TUint8Array extends TSchema, Uint8ArrayOptions {
  [Kind]: 'Uint8Array'
  static: Uint8Array
  instanceOf: 'Uint8Array'
  type: 'object'
}

// --------------------------------------------------------------------------
// Unknown
// --------------------------------------------------------------------------

export interface TUnknown extends TSchema {
  [Kind]: 'Unknown'
  static: unknown
}

// --------------------------------------------------------------------------
// Unsafe
// --------------------------------------------------------------------------

export interface UnsafeOptions extends SchemaOptions {
  [Kind]?: string
}

export interface TUnsafe<T> extends TSchema {
  [Kind]: string
  static: T
}

// --------------------------------------------------------------------------
// Void
// --------------------------------------------------------------------------

export interface TVoid extends TSchema {
  [Kind]: 'Void'
  static: void
  type: 'null'
  typeOf: 'Void'
}

// --------------------------------------------------------------------------
// Static<T>
// --------------------------------------------------------------------------

/** Creates a static type from a TypeBox type */
export type Static<T extends TSchema, P extends unknown[] = []> = (T & { params: P })['static']

// --------------------------------------------------------------------------
// TypeGuard
// --------------------------------------------------------------------------
export class TypeGuardUnknownTypeError extends Error {
  constructor(public readonly schema: unknown) {
    super('TypeGuard: Unknown type')
  }
}
export namespace TypeGuard {
  function IsObject(value: unknown): value is Record<string | symbol, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
  function IsArray(value: unknown): value is any[] {
    return typeof value === 'object' && value !== null && Array.isArray(value)
  }
  function IsPattern(value: unknown): value is string {
    try {
      new RegExp(value as string)
      return true
    } catch {
      return false
    }
  }
  function IsControlCharacterFree(value: unknown): value is string {
    if (typeof value !== 'string') return false
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i)
      if ((code >= 7 && code <= 13) || code === 27 || code === 127) {
        return false
      }
    }
    return true
  }
  function IsString(value: unknown): value is string {
    return typeof value === 'string'
  }
  function IsNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value)
  }
  function IsBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }
  function IsOptionalNumber(value: unknown): value is number | undefined {
    return value === undefined || (value !== undefined && IsNumber(value))
  }
  function IsOptionalBoolean(value: unknown): value is boolean | undefined {
    return value === undefined || (value !== undefined && IsBoolean(value))
  }
  function IsOptionalString(value: unknown): value is string | undefined {
    return value === undefined || (value !== undefined && IsString(value))
  }
  function IsOptionalPattern(value: unknown): value is string | undefined {
    return value === undefined || (value !== undefined && IsString(value) && IsControlCharacterFree(value) && IsPattern(value))
  }
  function IsOptionalFormat(value: unknown): value is string | undefined {
    return value === undefined || (value !== undefined && IsString(value) && IsControlCharacterFree(value))
  }
  function IsOptionalSchema(value: unknown): value is boolean | undefined {
    return value === undefined || TSchema(value)
  }
  /** Returns true if the given schema is TAny */
  export function TAny(schema: unknown): schema is TAny {
    return TKind(schema) && schema[Kind] === 'Any' && IsOptionalString(schema.$id)
  }
  /** Returns true if the given schema is TArray */
  export function TArray(schema: unknown): schema is TArray {
    return (
      TKind(schema) &&
      schema[Kind] === 'Array' &&
      schema.type === 'array' &&
      IsOptionalString(schema.$id) &&
      TSchema(schema.items) &&
      IsOptionalNumber(schema.minItems) &&
      IsOptionalNumber(schema.maxItems) &&
      IsOptionalBoolean(schema.uniqueItems)
    )
  }
  /** Returns true if the given schema is TBoolean */
  export function TBoolean(schema: unknown): schema is TBoolean {
    // prettier-ignore
    return (
      TKind(schema) &&
      schema[Kind] === 'Boolean' && 
      schema.type === 'boolean' && 
      IsOptionalString(schema.$id)
    )
  }
  /** Returns true if the given schema is TConstructor */
  export function TConstructor(schema: unknown): schema is TConstructor {
    // prettier-ignore
    if (!(
      TKind(schema) &&
      schema[Kind] === 'Constructor' && 
      schema.type === 'object' && 
      schema.instanceOf === 'Constructor' && 
      IsOptionalString(schema.$id) && 
      IsArray(schema.parameters) && 
      TSchema(schema.returns))
    ) {
      return false
    }
    for (const parameter of schema.parameters) {
      if (!TSchema(parameter)) return false
    }
    return true
  }

  /** Returns true if the given schema is TDate */
  export function TDate(schema: unknown): schema is TDate {
    return (
      TKind(schema) &&
      schema[Kind] === 'Date' &&
      schema.type === 'object' &&
      schema.instanceOf === 'Date' &&
      IsOptionalString(schema.$id) &&
      IsOptionalNumber(schema.minimumTimestamp) &&
      IsOptionalNumber(schema.maximumTimestamp) &&
      IsOptionalNumber(schema.exclusiveMinimumTimestamp) &&
      IsOptionalNumber(schema.exclusiveMaximumTimestamp)
    )
  }
  /** Returns true if the given schema is TFunction */
  export function TFunction(schema: unknown): schema is TFunction {
    // prettier-ignore
    if (!(
      TKind(schema) &&
      schema[Kind] === 'Function' && 
      schema.type === 'object' &&
      schema.instanceOf === 'Function' &&
      IsOptionalString(schema.$id) && 
      IsArray(schema.parameters) && 
      TSchema(schema.returns))
    ) {
      return false
    }
    for (const parameter of schema.parameters) {
      if (!TSchema(parameter)) return false
    }
    return true
  }
  /** Returns true if the given schema is TInteger */
  export function TInteger(schema: unknown): schema is TInteger {
    return (
      TKind(schema) &&
      schema[Kind] === 'Integer' &&
      schema.type === 'integer' &&
      IsOptionalString(schema.$id) &&
      IsOptionalNumber(schema.multipleOf) &&
      IsOptionalNumber(schema.minimum) &&
      IsOptionalNumber(schema.maximum) &&
      IsOptionalNumber(schema.exclusiveMinimum) &&
      IsOptionalNumber(schema.exclusiveMaximum)
    )
  }
  /** Returns true if the given schema is TIntersect */
  export function TIntersect(schema: unknown): schema is TIntersect {
    // prettier-ignore
    if (!(
      TKind(schema) &&
      schema[Kind] === 'Intersect' && 
      IsArray(schema.allOf) && 
      IsOptionalBoolean(schema.unevaluatedProperties) &&
      IsOptionalString(schema.$id))
    ) {
      return false
    }
    for (const inner of schema.allOf) {
      if (!TSchema(inner)) return false
    }
    return true
  }
  /** Returns true if the given schema is TKind */
  export function TKind(schema: unknown): schema is Record<typeof Kind | string, unknown> {
    return IsObject(schema) && Kind in schema
  }
  /** Returns true if the given schema is TLiteral */
  export function TLiteral(schema: unknown): schema is TLiteral {
    // prettier-ignore
    return (
      TKind(schema) &&
      schema[Kind] === 'Literal' && 
      IsOptionalString(schema.$id) && 
      (
        IsString(schema.const) || 
        IsNumber(schema.const) || 
        IsBoolean(schema.const)
      )
    )
  }
  /** Returns true if the given schema is TNever */
  export function TNever(schema: unknown): schema is TNever {
    return (
      TKind(schema) &&
      schema[Kind] === 'Never' &&
      IsArray(schema.allOf) &&
      schema.allOf.length === 2 &&
      IsObject(schema.allOf[0]) &&
      IsString(schema.allOf[0].type) &&
      schema.allOf[0].type === 'boolean' &&
      schema.allOf[0].const === false &&
      IsObject(schema.allOf[1]) &&
      IsString(schema.allOf[1].type) &&
      schema.allOf[1].type === 'boolean' &&
      schema.allOf[1].const === true
    )
  }
  /** Returns true if the given schema is TNot */
  export function TNot(schema: unknown): schema is TNot {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Not' && 
      IsArray(schema.allOf) && 
      schema.allOf.length === 2 && 
      IsObject(schema.allOf[0]) && 
      TSchema(schema.allOf[0].not) && 
      TSchema(schema.allOf[1]) 
    )
  }
  /** Returns true if the given schema is TNull */
  export function TNull(schema: unknown): schema is TNull {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Null' && 
      schema.type === 'null' && 
      IsOptionalString(schema.$id)
    )
  }
  /** Returns true if the given schema is TNumber */
  export function TNumber(schema: unknown): schema is TNumber {
    return (
      TKind(schema) &&
      schema[Kind] === 'Number' &&
      schema.type === 'number' &&
      IsOptionalString(schema.$id) &&
      IsOptionalNumber(schema.multipleOf) &&
      IsOptionalNumber(schema.minimum) &&
      IsOptionalNumber(schema.maximum) &&
      IsOptionalNumber(schema.exclusiveMinimum) &&
      IsOptionalNumber(schema.exclusiveMaximum)
    )
  }
  /** Returns true if the given schema is TObject */
  export function TObject(schema: unknown): schema is TObject {
    if (
      !(
        TKind(schema) &&
        schema[Kind] === 'Object' &&
        schema.type === 'object' &&
        IsOptionalString(schema.$id) &&
        IsObject(schema.properties) &&
        (IsOptionalBoolean(schema.additionalProperties) || IsOptionalSchema(schema.additionalProperties)) &&
        IsOptionalNumber(schema.minProperties) &&
        IsOptionalNumber(schema.maxProperties)
      )
    ) {
      return false
    }
    for (const [key, value] of Object.entries(schema.properties)) {
      if (!IsControlCharacterFree(key)) return false
      if (!TSchema(value)) return false
    }
    return true
  }
  /** Returns true if the given schema is TPromise */
  export function TPromise(schema: unknown): schema is TPromise {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Promise' && 
      schema.type === 'object' && 
      schema.instanceOf === 'Promise' &&
      IsOptionalString(schema.$id) && 
      TSchema(schema.item)
    )
  }
  /** Returns true if the given schema is TRecord */
  export function TRecord(schema: unknown): schema is TRecord {
    // prettier-ignore
    if (!(
      TKind(schema) && 
      schema[Kind] === 'Record' && 
      schema.type === 'object' && 
      IsOptionalString(schema.$id) && 
      schema.additionalProperties === false && 
      IsObject(schema.patternProperties))
    ) {
      return false
    }
    const keys = Object.keys(schema.patternProperties)
    if (keys.length !== 1) {
      return false
    }
    if (!IsPattern(keys[0])) {
      return false
    }
    if (!TSchema(schema.patternProperties[keys[0]])) {
      return false
    }
    return true
  }
  /** Returns true if the given schema is TSelf */
  export function TSelf(schema: unknown): schema is TSelf {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Self' && 
      IsOptionalString(schema.$id) && 
      IsString(schema.$ref)
    )
  }
  /** Returns true if the given schema is TRef */
  export function TRef(schema: unknown): schema is TRef {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Ref' && 
      IsOptionalString(schema.$id) && 
      IsString(schema.$ref)
    )
  }
  /** Returns true if the given schema is TString */
  export function TString(schema: unknown): schema is TString {
    return (
      TKind(schema) &&
      schema[Kind] === 'String' &&
      schema.type === 'string' &&
      IsOptionalString(schema.$id) &&
      IsOptionalNumber(schema.minLength) &&
      IsOptionalNumber(schema.maxLength) &&
      IsOptionalPattern(schema.pattern) &&
      IsOptionalFormat(schema.format)
    )
  }
  /** Returns true if the given schema is TSymbol */
  export function TSymbol(schema: unknown): schema is TSymbol {
    // prettier-ignore
    return (
      TKind(schema) && schema[Kind] === 'Symbol' && 
      IsOptionalString(schema.$id) && (
        IsOptionalString(schema.value) ||
        IsOptionalNumber(schema.value)
      )
    )
  }
  /** Returns true if the given schema is TTuple */
  export function TTuple(schema: unknown): schema is TTuple {
    // prettier-ignore
    if (!(
      TKind(schema) && 
      schema[Kind] === 'Tuple' && 
      schema.type === 'array' && 
      IsOptionalString(schema.$id) && 
      IsNumber(schema.minItems) && 
      IsNumber(schema.maxItems) && 
      schema.minItems === schema.maxItems)
    ) {
      return false
    }
    if (schema.items === undefined && schema.additionalItems === undefined && schema.minItems === 0) {
      return true
    }
    if (!IsArray(schema.items)) {
      return false
    }
    for (const inner of schema.items) {
      if (!TSchema(inner)) return false
    }
    return true
  }
  /** Returns true if the given schema is TUndefined */
  export function TUndefined(schema: unknown): schema is TUndefined {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Undefined' && 
      schema.type === 'null' && 
      schema.typeOf === 'Undefined' && 
      IsOptionalString(schema.$id)
    )
  }
  /** Returns true if the given schema is TUnion */
  export function TUnion(schema: unknown): schema is TUnion {
    // prettier-ignore
    if (!(
      TKind(schema) && 
      schema[Kind] === 'Union' && 
      IsArray(schema.anyOf) && 
      IsOptionalString(schema.$id))
    ) {
      return false
    }
    for (const inner of schema.anyOf) {
      if (!TSchema(inner)) return false
    }
    return true
  }
  /** Returns true if the given schema is TUint8Array */
  export function TUint8Array(schema: unknown): schema is TUint8Array {
    return TKind(schema) && schema[Kind] === 'Uint8Array' && schema.type === 'object' && IsOptionalString(schema.$id) && schema.instanceOf === 'Uint8Array' && IsOptionalNumber(schema.minByteLength) && IsOptionalNumber(schema.maxByteLength)
  }
  /** Returns true if the given schema is TUnknown */
  export function TUnknown(schema: unknown): schema is TUnknown {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Unknown' && 
      IsOptionalString(schema.$id)
    )
  }
  /** Returns true if the given schema is TVoid */
  export function TVoid(schema: unknown): schema is TVoid {
    // prettier-ignore
    return (
      TKind(schema) && 
      schema[Kind] === 'Void' && 
      schema.type === 'null' && 
      schema.typeOf === 'Void' && 
      IsOptionalString(schema.$id)
    )
  }
  /** Returns true if this schema has the ReadonlyOptional modifier */
  export function TReadonlyOptional<T extends TSchema>(schema: T): schema is TReadonlyOptional<T> {
    return TSchema(schema) && schema[Modifier] === 'ReadonlyOptional'
  }
  /** Returns true if this schema has the Readonly modifier */
  export function TReadonly<T extends TSchema>(schema: T): schema is TReadonly<T> {
    return TSchema(schema) && schema[Modifier] === 'Readonly'
  }
  /** Returns true if this schema has the Optional modifier */
  export function TOptional<T extends TSchema>(schema: T): schema is TOptional<T> {
    return TSchema(schema) && schema[Modifier] === 'Optional'
  }
  /** Returns true if the given schema is TSchema */
  export function TSchema(schema: unknown): schema is TSchema {
    return (
      TAny(schema) ||
      TArray(schema) ||
      TBoolean(schema) ||
      TConstructor(schema) ||
      TDate(schema) ||
      TFunction(schema) ||
      TInteger(schema) ||
      TIntersect(schema) ||
      TLiteral(schema) ||
      TNever(schema) ||
      TNot(schema) ||
      TNull(schema) ||
      TNumber(schema) ||
      TObject(schema) ||
      TPromise(schema) ||
      TRecord(schema) ||
      TSelf(schema) ||
      TRef(schema) ||
      TString(schema) ||
      TSymbol(schema) ||
      TTuple(schema) ||
      TUndefined(schema) ||
      TUnion(schema) ||
      TUint8Array(schema) ||
      TUnknown(schema) ||
      TVoid(schema) ||
      TKind(schema)
    )
  }
}

// --------------------------------------------------------------------------
// TypeExtends
// --------------------------------------------------------------------------
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
  function AnyRight(left: TSchema, right: TAny) {
    return TypeExtendsResult.True
  }
  function Any(left: TAny, right: TSchema) {
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
  function ArrayRight(left: TSchema, right: TArray) {
    if (TypeGuard.TUnknown(left)) return TypeExtendsResult.False
    if (TypeGuard.TAny(left)) return TypeExtendsResult.Union
    if (TypeGuard.TNever(left)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  function Array(left: TArray, right: TSchema) {
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
  function BooleanRight(left: TSchema, right: TBoolean) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'boolean') return TypeExtendsResult.True
    return TypeGuard.TBoolean(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Boolean(left: TBoolean, right: TSchema): TypeExtendsResult {
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
  function Constructor(left: TConstructor, right: TSchema) {
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
  function Date(left: TDate, right: TSchema) {
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
  function Function(left: TFunction, right: TSchema) {
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
  function IntegerRight(left: TSchema, right: TInteger) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'number') return TypeExtendsResult.True
    return TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Integer(left: TInteger, right: TSchema): TypeExtendsResult {
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
  function IntersectRight(left: TSchema, right: TIntersect): TypeExtendsResult {
    return right.allOf.every((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Intersect(left: TIntersect, right: TSchema) {
    return left.allOf.some((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Literal
  // ------------------------------------------------------------------------------------------
  function IsLiteralString(schema: TLiteral) {
    return typeof schema.const === 'string'
  }
  function IsLiteralNumber(schema: TLiteral) {
    return typeof schema.const === 'number'
  }
  function IsLiteralBoolean(schema: TLiteral) {
    return typeof schema.const === 'boolean'
  }
  function Literal(left: TLiteral, right: TSchema): TypeExtendsResult {
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
  function NeverRight(left: TSchema, right: TNever) {
    return TypeExtendsResult.True
  }
  function Never(left: TNever, right: TSchema) {
    return TypeExtendsResult.True
  }
  // ------------------------------------------------------------------------------------------
  // Null
  // ------------------------------------------------------------------------------------------
  function Null(left: TNull, right: TSchema) {
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
  function NumberRight(left: TSchema, right: TNumber) {
    if (TypeGuard.TLiteral(left) && IsLiteralNumber(left)) return TypeExtendsResult.True
    return TypeGuard.TNumber(left) || TypeGuard.TInteger(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Number(left: TNumber, right: TSchema): TypeExtendsResult {
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
  function IsObjectPropertyCount(schema: TObject, count: number) {
    return globalThis.Object.keys(schema.properties).length === count
  }
  function IsObjectStringLike(schema: TObject) {
    return IsObjectArrayLike(schema)
  }
  function IsObjectNumberLike(schema: TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectBooleanLike(schema: TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectDateLike(schema: TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectUint8ArrayLike(schema: TObject) {
    return IsObjectArrayLike(schema)
  }
  function IsObjectFunctionLike(schema: TObject) {
    const length = Type.Number()
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True)
  }
  function IsObjectConstructorLike(schema: TObject) {
    return IsObjectPropertyCount(schema, 0)
  }
  function IsObjectArrayLike(schema: TObject) {
    const length = Type.Number()
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'length' in schema.properties && IntoBooleanResult(Visit(schema.properties['length'], length)) === TypeExtendsResult.True)
  }
  function IsObjectPromiseLike(schema: TObject) {
    const then = Type.Function([Type.Any()], Type.Any())
    return IsObjectPropertyCount(schema, 0) || (IsObjectPropertyCount(schema, 1) && 'then' in schema.properties && IntoBooleanResult(Visit(schema.properties['then'], then)) === TypeExtendsResult.True)
  }
  // ------------------------------------------------------------------------------------------
  // Property
  // ------------------------------------------------------------------------------------------
  function Property(left: TSchema, right: TSchema) {
    if (Visit(left, right) === TypeExtendsResult.False) return TypeExtendsResult.False
    if (TypeGuard.TOptional(left) && !TypeGuard.TOptional(right)) return TypeExtendsResult.False
    return TypeExtendsResult.True
  }
  function ObjectRight(left: TSchema, right: TObject) {
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
      return right[Hint] === 'Record' ? TypeExtendsResult.True : TypeExtendsResult.False
    }
    if (TypeGuard.TRecord(left) && TypeGuard.TNumber(RecordKey(left))) {
      return IsObjectPropertyCount(right, 0) ? TypeExtendsResult.True : TypeExtendsResult.False
    }
    return TypeExtendsResult.False
  }
  function Object(left: TObject, right: TSchema) {
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
  function Promise(left: TPromise, right: TSchema) {
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
  function RecordKey(schema: TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return Type.Number()
    if ('^.*$' in schema.patternProperties) return Type.String()
    throw Error('TypeExtends: Cannot get record key')
  }
  function RecordValue(schema: TRecord) {
    if ('^(0|[1-9][0-9]*)$' in schema.patternProperties) return schema.patternProperties['^(0|[1-9][0-9]*)$']
    if ('^.*$' in schema.patternProperties) return schema.patternProperties['^.*$']
    throw Error('TypeExtends: Cannot get record value')
  }
  function RecordRight(left: TSchema, right: TRecord) {
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
  function Record(left: TRecord, right: TSchema) {
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
  function StringRight(left: TSchema, right: TString) {
    if (TypeGuard.TLiteral(left) && typeof left.const === 'string') return TypeExtendsResult.True
    return TypeGuard.TString(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function String(left: TString, right: TSchema): TypeExtendsResult {
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
  function TupleRight(left: TSchema, right: TTuple) {
    if (TypeGuard.TUnknown(left)) return TypeExtendsResult.False
    if (TypeGuard.TAny(left)) return TypeExtendsResult.Union
    if (TypeGuard.TNever(left)) return TypeExtendsResult.True
    return TypeExtendsResult.False
  }
  function IsArrayOfTuple(left: TTuple, right: TSchema) {
    return TypeGuard.TArray(right) && left.items !== undefined && left.items.every((schema) => Visit(schema, right.items) === TypeExtendsResult.True)
  }
  function Tuple(left: TTuple, right: TSchema): TypeExtendsResult {
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
  function Uint8Array(left: TUint8Array, right: TSchema) {
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
  function Undefined(left: TUndefined, right: TSchema) {
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
  function UnionRight(left: TSchema, right: TUnion): TypeExtendsResult {
    return right.anyOf.some((schema) => Visit(left, schema) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Union(left: TUnion, right: TSchema) {
    return left.anyOf.every((schema) => Visit(schema, right) === TypeExtendsResult.True) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  // ------------------------------------------------------------------------------------------
  // Unknown
  // ------------------------------------------------------------------------------------------
  function UnknownRight(left: TSchema, right: TUnknown) {
    return TypeExtendsResult.True
  }
  function Unknown(left: TUnknown, right: TSchema) {
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
  function VoidRight(left: TSchema, right: TVoid) {
    if (TypeGuard.TUndefined(left)) return TypeExtendsResult.True
    return TypeGuard.TUndefined(left) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Void(left: TVoid, right: TSchema) {
    if (TypeGuard.TIntersect(right)) return IntersectRight(left, right)
    if (TypeGuard.TUnion(right)) return UnionRight(left, right)
    if (TypeGuard.TUnknown(right)) return UnknownRight(left, right)
    if (TypeGuard.TAny(right)) return AnyRight(left, right)
    if (TypeGuard.TObject(right)) return ObjectRight(left, right)
    return TypeGuard.TVoid(right) ? TypeExtendsResult.True : TypeExtendsResult.False
  }
  function Visit(left: TSchema, right: TSchema): TypeExtendsResult {
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
    throw Error(`TypeExtends: Unknown left operand '${left[Kind]}'`)
  }
  export function Extends(left: TSchema, right: TSchema): TypeExtendsResult {
    return Visit(left, right)
  }
}
// --------------------------------------------------------------------
// TypeClone
// --------------------------------------------------------------------
export namespace TypeClone {
  function IsObject(value: unknown): value is Record<string | symbol, any> {
    return typeof value === 'object' && value !== null && !globalThis.Array.isArray(value)
  }
  function IsArray(value: unknown): value is unknown[] {
    return globalThis.Array.isArray(value)
  }
  export function Clone<T>(value: T): T {
    if (IsObject(value)) {
      // prettier-ignore
      return (
        Object.getOwnPropertyNames(value).reduce((acc, key) => ({ ...acc, [key]: Clone((value as any)[key]) }),
        Object.getOwnPropertySymbols(value).reduce((acc, key) => ({ ...acc, [key]: Clone((value as any)[key])}), {}))
      ) as T
    } else if (IsArray(value)) {
      return (value as any).map((value: unknown) => Clone(value as any)) as T
    } else {
      return value
    }
  }
}
// --------------------------------------------------------------------
// ObjectMap
// --------------------------------------------------------------------
export namespace ObjectMap {
  function Intersect(schema: TIntersect, callback: (object: TObject) => TObject) {
    return Type.Intersect(
      schema.allOf.map((inner) => Visit(inner, callback)),
      { ...schema },
    )
  }
  function Union(schema: TUnion, callback: (object: TObject) => TObject) {
    return Type.Union(
      schema.anyOf.map((inner) => Visit(inner, callback)),
      { ...schema },
    )
  }
  function Object(schema: TObject, callback: (object: TObject) => TObject) {
    return callback(schema)
  }
  function Visit(schema: TSchema, callback: (object: TObject) => TObject): TSchema {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema, callback)
    if (TypeGuard.TUnion(schema)) return Union(schema, callback)
    if (TypeGuard.TObject(schema)) return Object(schema, callback)
    return schema
  }
  export function Map<T = TSchema>(schema: TSchema, callback: (object: TObject) => TObject, options: SchemaOptions = {}): T {
    return { ...Visit(TypeClone.Clone(schema), callback), ...options } as unknown as T
  }
}
// --------------------------------------------------------------------
// KeyResolver
// --------------------------------------------------------------------
export namespace KeyResolver {
  function Intersect(schema: TIntersect) {
    return [...schema.allOf.reduce((set, schema) => Visit(schema).map((key) => set.add(key))[0], new Set<string>())]
  }
  function Union(schema: TUnion) {
    const sets = schema.anyOf.map((inner) => Visit(inner))
    return [...sets.reduce((set, outer) => outer.map((key) => (sets.every((inner) => inner.includes(key)) ? set.add(key) : set))[0], new Set<string>())]
  }
  function Object(schema: TObject) {
    return globalThis.Object.keys(schema.properties)
  }
  function Visit(schema: TSchema): string[] {
    if (TypeGuard.TIntersect(schema)) return Intersect(schema)
    if (TypeGuard.TUnion(schema)) return Union(schema)
    if (TypeGuard.TObject(schema)) return Object(schema)
    return []
  }
  export function Resolve<T extends TSchema>(schema: T) {
    return Visit(schema)
  }
}
// --------------------------------------------------------------------------
// TypeBuilder
// --------------------------------------------------------------------------

let TypeOrdinal = 0

export namespace Type {
  // ----------------------------------------------------------------------
  // Modifiers
  // ----------------------------------------------------------------------

  /** Creates a readonly optional property */
  export function ReadonlyOptional<T extends TSchema>(item: T): TReadonlyOptional<T> {
    return { [Modifier]: 'ReadonlyOptional', ...item }
  }

  /** Creates a readonly property */
  export function Readonly<T extends TSchema>(item: T): TReadonly<T> {
    return { [Modifier]: 'Readonly', ...item }
  }

  /** Creates a optional property */
  export function Optional<T extends TSchema>(item: T): TOptional<T> {
    return { [Modifier]: 'Optional', ...item }
  }

  // ----------------------------------------------------------------------
  // Types
  // ----------------------------------------------------------------------

  /** `Standard` Creates a any type */
  export function Any(options: SchemaOptions = {}): TAny {
    return Create({ ...options, [Kind]: 'Any' })
  }

  /** `Standard` Creates a array type */
  export function Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
    return Create({ ...options, [Kind]: 'Array', type: 'array', items })
  }

  /** `Standard` Creates a boolean type */
  export function Boolean(options: SchemaOptions = {}): TBoolean {
    return Create({ ...options, [Kind]: 'Boolean', type: 'boolean' })
  }

  /** `Extended` Creates a tuple type from this constructors parameters */
  export function ConstructorParameters<T extends TConstructor<any[], any>>(schema: T, options: SchemaOptions = {}): TConstructorParameters<T> {
    return Tuple([...schema.parameters], { ...options })
  }

  /** `Extended` Creates a constructor type */
  export function Constructor<T extends TTuple<TSchema[]>, U extends TSchema>(parameters: T, returns: U, options?: SchemaOptions): TConstructor<TupleToArray<T>, U>

  /** `Extended` Creates a constructor type */
  export function Constructor<T extends TSchema[], U extends TSchema>(parameters: [...T], returns: U, options?: SchemaOptions): TConstructor<T, U>

  /** `Extended` Creates a constructor type */
  export function Constructor(parameters: any, returns: any, options: SchemaOptions = {}) {
    if (parameters[Kind] === 'Tuple') {
      const inner = parameters.items === undefined ? [] : parameters.items
      return Create({ ...options, [Kind]: 'Constructor', type: 'object', instanceOf: 'Constructor', parameters: inner, returns })
    } else if (globalThis.Array.isArray(parameters)) {
      return Create({ ...options, [Kind]: 'Constructor', type: 'object', instanceOf: 'Constructor', parameters, returns })
    } else {
      throw new Error('TypeBuilder.Constructor: Invalid parameters')
    }
  }

  /** `Extended` Creates a Date type */
  export function Date(options: DateOptions = {}): TDate {
    return Create({ ...options, [Kind]: 'Date', type: 'object', instanceOf: 'Date' })
  }

  /** `Standard` Creates a enum type */
  export function Enum<T extends Record<string, string | number>>(item: T, options: SchemaOptions = {}): TEnum<T> {
    const values = globalThis.Object.keys(item)
      .filter((key) => isNaN(key as any))
      .map((key) => item[key]) as T[keyof T][]
    const anyOf = values.map((value) => (typeof value === 'string' ? { [Kind]: 'Literal', type: 'string' as const, const: value } : { [Kind]: 'Literal', type: 'number' as const, const: value }))
    return Create({ ...options, [Kind]: 'Union', anyOf })
  }

  /** `Standard` Creates a conditional type expression  */
  export function Extends<L extends TSchema, R extends TSchema, T extends TSchema, U extends TSchema>(left: L, right: R, trueType: T, falseType: U): TExtends<L, R, T, U> {
    switch (TypeExtends.Extends(left, right)) {
      case TypeExtendsResult.Union:
        return Union([TypeClone.Clone(trueType), TypeClone.Clone(falseType)]) as any as TExtends<L, R, T, U>
      case TypeExtendsResult.True:
        return TypeClone.Clone(trueType) as TExtends<L, R, T, U>
      case TypeExtendsResult.False:
        return TypeClone.Clone(falseType) as TExtends<L, R, T, U>
    }
  }

  /** `Standard`  Constructs a type by excluding from UnionType all union members that are assignable to ExcludedMembers. */
  export function Exclude<T extends TUnion, U extends TUnion>(unionType: T, excludedMembers: U, options: SchemaOptions = {}): TExclude<T, U> {
    const anyOf = unionType.anyOf
      .filter((schema) => {
        const check = TypeExtends.Extends(schema, excludedMembers)
        return !(check === TypeExtendsResult.True || check === TypeExtendsResult.Union)
      })
      .map((schema) => TypeClone.Clone(schema))
    return Union(anyOf, options) as TExclude<T, U>
  }

  /** `Standard` Constructs a type by extracting from Type all union members that are assignable to Union. */
  export function Extract<T extends TSchema, U extends TUnion>(type: T, union: U, options: SchemaOptions = {}): TExtract<T, U> {
    if (TypeGuard.TUnion(type)) {
      const anyOf = type.anyOf.filter((schema: TSchema) => TypeExtends.Extends(schema, union) === TypeExtendsResult.True).map((schema: TSchema) => TypeClone.Clone(schema))
      return Union(anyOf, options) as TExtract<T, U>
    } else {
      const anyOf = union.anyOf.filter((schema) => TypeExtends.Extends(type, schema) === TypeExtendsResult.True).map((schema) => TypeClone.Clone(schema))
      return Union(anyOf, options) as TExtract<T, U>
    }
  }

  /** `Extended` Creates a function type */
  export function Function<T extends TTuple<TSchema[]>, U extends TSchema>(parameters: T, returns: U, options?: SchemaOptions): TFunction<TupleToArray<T>, U>

  /** `Extended` Creates a function type */
  export function Function<T extends TSchema[], U extends TSchema>(parameters: [...T], returns: U, options?: SchemaOptions): TFunction<T, U>

  /** `Extended` Creates a function type */
  export function Function(parameters: any, returns: any, options: SchemaOptions = {}) {
    if (parameters[Kind] === 'Tuple') {
      const inner = parameters.items === undefined ? [] : parameters.items
      return Create({ ...options, [Kind]: 'Function', type: 'object', instanceOf: 'Function', parameters: inner, returns })
    } else if (globalThis.Array.isArray(parameters)) {
      return Create({ ...options, [Kind]: 'Function', type: 'object', instanceOf: 'Function', parameters, returns })
    } else {
      throw new Error('TypeBuilder.Function: Invalid parameters')
    }
  }

  /** `Extended` Creates a type from this constructors instance type */
  export function InstanceType<T extends TConstructor<any[], any>>(schema: T, options: SchemaOptions = {}): TInstanceType<T> {
    return { ...options, ...TypeClone.Clone(schema.returns) }
  }

  /** `Standard` Creates a integer type */
  export function Integer(options: NumericOptions = {}): TInteger {
    return Create({ ...options, [Kind]: 'Integer', type: 'integer' })
  }

  /** `Standard` Creates a intersect type. */
  export function Intersect<T extends TSchema[]>(allOf: [...T], options: IntersectOptions = {}): TIntersect<T> {
    return Create({ ...options, [Kind]: 'Intersect', allOf })
  }

  /** `Standard` Creates a keyof type */
  export function KeyOf<T extends TSchema>(schema: T, options: SchemaOptions = {}): TKeyOf<T> {
    const keys = KeyResolver.Resolve(schema)
    const keyof =
      keys.length === 0
        ? Never(options)
        : Union(
            keys.map((key) => Literal(key)),
            options,
          )
    return keyof as TKeyOf<T>
  }

  /** `Standard` Creates a literal type */
  export function Literal<T extends TLiteralValue>(value: T, options: SchemaOptions = {}): TLiteral<T> {
    return Create({ ...options, [Kind]: 'Literal', const: value, type: typeof value as 'string' | 'number' | 'boolean' })
  }

  /** `Standard` Creates a never type */
  export function Never(options: SchemaOptions = {}): TNever {
    return Create({
      ...options,
      [Kind]: 'Never',
      allOf: [
        { type: 'boolean', const: false },
        { type: 'boolean', const: true },
      ],
    })
  }

  /** `Standard` Creates a not type */
  export function Not<N extends TSchema, T extends TSchema>(not: N, schema: T, options?: SchemaOptions): TNot<N, T> {
    return Create({ ...options, [Kind]: 'Not', allOf: [{ not }, schema] })
  }

  /** `Standard` Creates a null type */
  export function Null(options: SchemaOptions = {}): TNull {
    return Create({ ...options, [Kind]: 'Null', type: 'null' })
  }

  /** `Standard` Creates a number type */
  export function Number(options: NumericOptions = {}): TNumber {
    return Create({ ...options, [Kind]: 'Number', type: 'number' })
  }

  /** `Standard` Creates an object type */
  export function Object<T extends TProperties>(properties: T, options: ObjectOptions = {}): TObject<T> {
    const property_names = globalThis.Object.keys(properties)
    const optional = property_names.filter((name) => {
      const property = properties[name] as TModifier
      const modifier = property[Modifier]
      return modifier && (modifier === 'Optional' || modifier === 'ReadonlyOptional')
    })
    const required = property_names.filter((name) => !optional.includes(name))
    if (required.length > 0) {
      return Create({ ...options, [Kind]: 'Object', type: 'object', properties, required })
    } else {
      return Create({ ...options, [Kind]: 'Object', type: 'object', properties })
    }
  }

  /** `Standard` Creates a new object type whose keys are omitted from the given source type */
  export function Omit<T extends TSchema, K extends (keyof Static<T>)[]>(schema: T, keys: readonly [...K], options: SchemaOptions = {}): TOmit<T, K[number]> {
    // prettier-ignore
    return ObjectMap.Map<TOmit<T, K[number]>>(schema, (schema) => {
      const object = { ...TypeClone.Clone(schema), ...options }
      if (object.required) {
        object.required = object.required.filter((key: string) => !keys.includes(key as any))
        if (object.required.length === 0) delete object.required
      }
      for (const key of globalThis.Object.keys(object.properties)) {
        if (keys.includes(key as any)) delete object.properties[key]
      }
      return Create(object)
    }, options)
  }

  /** `Extended` Creates a tuple type from this functions parameters */
  export function Parameters<T extends TFunction<any[], any>>(schema: T, options: SchemaOptions = {}): TParameters<T> {
    return Tuple(schema.parameters, { ...options })
  }

  /** `Standard` Creates an object type whose properties are all optional */
  export function Partial<T extends TSchema>(schema: T, options: ObjectOptions = {}): TPartial<T> {
    // prettier-ignore
    return ObjectMap.Map<TPartial<T>>(schema, (schema) => {
      const next = TypeClone.Clone(schema)
      delete next.required
      for (const key of globalThis.Object.keys(next.properties)) {
        const property = next.properties[key]
        // prettier-ignore
        switch (property[Modifier]) {
          case 'ReadonlyOptional': property[Modifier] = 'ReadonlyOptional'; break;
          case 'Readonly': property[Modifier] = 'ReadonlyOptional'; break;
          case 'Optional': property[Modifier] = 'Optional'; break;
          default: property[Modifier] = 'Optional'; break;
        }
      }
      return Create(next)
    }, options)
  }

  /** `Standard` Creates a new object type whose keys are picked from the given source type */
  export function Pick<T extends TSchema, K extends (keyof Static<T>)[]>(schema: T, keys: readonly [...K], options: SchemaOptions = {}): TPick<T, K[number]> {
    // prettier-ignore
    return ObjectMap.Map<TPick<T, K[number]>>(schema, (schema) => {
      const object = TypeClone.Clone(schema)
      if (object.required) {
        object.required = object.required.filter((key: any) => keys.includes(key))
        if (object.required.length === 0) delete object.required
      }
      for (const key of globalThis.Object.keys(object.properties)) {
        if (!keys.includes(key as any)) delete object.properties[key]
      }
      return Create(object)
    }, options)
  }

  /** `Extended` Creates a Promise type */
  export function Promise<T extends TSchema>(item: T, options: SchemaOptions = {}): TPromise<T> {
    return Create({ ...options, [Kind]: 'Promise', type: 'object', instanceOf: 'Promise', item })
  }

  /** `Standard` Creates an object whose properties are derived from the given string literal union */
  export function Record<K extends TUnion<TLiteral[]>, T extends TSchema>(key: K, schema: T, options?: ObjectOptions): TObject<TRecordProperties<K, T>>

  /** `Standard` Creates a record type */
  export function Record<K extends TString | TNumeric, T extends TSchema>(key: K, schema: T, options?: ObjectOptions): TRecord<K, T>

  /** `Standard` Creates a record type */
  export function Record(key: any, value: any, options: ObjectOptions = {}) {
    // If string literal union return TObject with properties extracted from union.
    if (key[Kind] === 'Union') {
      return Object(
        key.anyOf.reduce((acc: any, literal: any) => {
          return { ...acc, [literal.const]: value }
        }, {}),
        { ...options, [Hint]: 'Record' },
      )
    }
    // otherwise return TRecord with patternProperties
    const pattern = ['Integer', 'Number'].includes(key[Kind]) ? '^(0|[1-9][0-9]*)$' : key[Kind] === 'String' && key.pattern ? key.pattern : '^.*$'
    return Create({
      ...options,
      [Kind]: 'Record',
      type: 'object',
      patternProperties: { [pattern]: value },
      additionalProperties: false,
    })
  }

  /** `Standard` Creates recursive type */
  export function Recursive<T extends TSchema>(callback: (self: TSelf) => T, options: SchemaOptions = {}): TRecursive<T> {
    if (options.$id === undefined) options.$id = `T${TypeOrdinal++}`
    const self = callback({ [Kind]: 'Self', $ref: `${options.$id}` } as any)
    self.$id = options.$id
    return Create({ ...options, ...self } as any)
  }

  /** `Standard` Creates a reference type. The referenced type must contain a $id */
  export function Ref<T extends TSchema>(schema: T, options: SchemaOptions = {}): TRef<T> {
    if (schema.$id === undefined) throw Error('TypeBuilder.Ref: Referenced schema must specify an $id')
    return Create({ ...options, [Kind]: 'Ref', $ref: schema.$id! })
  }

  /** `Standard` Creates a string type from a regular expression */
  export function RegEx(regex: RegExp, options: SchemaOptions = {}): TString {
    return Create({ ...options, [Kind]: 'String', type: 'string', pattern: regex.source })
  }

  /** `Standard` Creates an object type whose properties are all required */
  export function Required<T extends TSchema>(schema: T, options: SchemaOptions = {}): TRequired<T> {
    // prettier-ignore
    return ObjectMap.Map<TRequired<T>>(schema, (schema) => {
      const object = { ...TypeClone.Clone(schema), ...options }
      object.required = globalThis.Object.keys(object.properties)
      for (const key of globalThis.Object.keys(object.properties)) {
        const property = object.properties[key]
        // prettier-ignore
        switch (property[Modifier]) {
          case 'ReadonlyOptional': property[Modifier] = 'Readonly'; break
          case 'Readonly': property[Modifier] = 'Readonly'; break
          case 'Optional': delete property[Modifier]; break
          default: delete property[Modifier]; break
        }
      }
      return Create(object) as any
    }, options)
  }

  /** `Extended` Creates a type from this functions return type */
  export function ReturnType<T extends TFunction<any[], any>>(schema: T, options: SchemaOptions = {}): TReturnType<T> {
    return { ...options, ...TypeClone.Clone(schema.returns) }
  }

  /** Removes Kind and Modifier symbol property keys from this schema */
  export function Strict<T extends TSchema>(schema: T): T {
    return JSON.parse(JSON.stringify(schema))
  }

  /** `Standard` Creates a string type */
  export function String<Format extends string>(options: StringOptions<StringFormatOption | Format> = {}): TString<Format> {
    return Create({ ...options, [Kind]: 'String', type: 'string' })
  }
  /** `Standard` Creates a symbol type */
  export function Symbol<Value extends string | number | undefined>(value: Value, options?: SchemaOptions): TSymbol<Value> {
    return Create({ ...options, [Kind]: 'Symbol', value })
  }

  /** `Standard` Creates a tuple type */
  export function Tuple<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TTuple<T> {
    const additionalItems = false
    const minItems = items.length
    const maxItems = items.length
    const schema = (items.length > 0 ? { ...options, [Kind]: 'Tuple', type: 'array', items, additionalItems, minItems, maxItems } : { ...options, [Kind]: 'Tuple', type: 'array', minItems, maxItems }) as any
    return Create(schema)
  }

  /** `Extended` Creates a undefined type */
  export function Undefined(options: SchemaOptions = {}): TUndefined {
    return Create({ ...options, [Kind]: 'Undefined', type: 'null', typeOf: 'Undefined' })
  }

  /** `Standard` Creates a union type */
  export function Union(items: [], options?: SchemaOptions): TNever

  /** `Standard` Creates a union type */
  export function Union<T extends TSchema[]>(items: [...T], options?: SchemaOptions): TUnion<T>

  /** `Standard` Creates a union type */
  export function Union<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}) {
    return items.length === 0 ? Never({ ...options }) : Create({ ...options, [Kind]: 'Union', anyOf: items })
  }

  /** `Extended` Creates a Uint8Array type */
  export function Uint8Array(options: Uint8ArrayOptions = {}): TUint8Array {
    return Create({ ...options, [Kind]: 'Uint8Array', type: 'object', instanceOf: 'Uint8Array' })
  }

  /** `Standard` Creates an unknown type */
  export function Unknown(options: SchemaOptions = {}): TUnknown {
    return Create({ ...options, [Kind]: 'Unknown' })
  }

  /** `Standard` Creates a user defined schema that infers as type T  */
  export function Unsafe<T>(options: UnsafeOptions = {}): TUnsafe<T> {
    return Create({ ...options, [Kind]: options[Kind] || 'Unsafe' })
  }

  /** `Extended` Creates a void type */
  export function Void(options: SchemaOptions = {}): TVoid {
    return Create({ ...options, [Kind]: 'Void', type: 'null', typeOf: 'Void' })
  }

  function Create<T>(schema: Omit<T, 'static' | 'params'>): T {
    return schema as any
  }
}
