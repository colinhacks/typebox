/*--------------------------------------------------------------------------

@sinclair/typebox/compiler

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

import { ValueErrors, ValueError } from '../errors/index'
import { TypeSystem } from '../system/index'
import { TypeExtends, TypeGuard } from '../guard/index'
import { Format } from '../format/index'
import { Custom } from '../custom/index'
import { ValueHash } from '../hash/index'
import * as Types from '../typebox'

// -------------------------------------------------------------------
// CheckFunction
// -------------------------------------------------------------------

export type CheckFunction = (value: unknown) => boolean

// -------------------------------------------------------------------
// TypeCheck
// -------------------------------------------------------------------

export class TypeCheck<T extends Types.TSchema> {
  constructor(private readonly schema: T, private readonly references: Types.TSchema[], private readonly checkFunc: CheckFunction, private readonly code: string) {}

  /** Returns the generated validation code used to validate this type. */
  public Code(): string {
    return this.code
  }

  /** Returns an iterator for each error in this value. */
  public Errors(value: unknown): IterableIterator<ValueError> {
    return ValueErrors.Errors(this.schema, this.references, value)
  }

  /** Returns true if the value matches the compiled type. */
  public Check(value: unknown): value is Types.Static<T> {
    return this.checkFunc(value)
  }
}
// -------------------------------------------------------------------
// Character
// -------------------------------------------------------------------
namespace Character {
  export function DollarSign(code: number) {
    return code === 36
  }
  export function Underscore(code: number) {
    return code === 95
  }
  export function Numeric(code: number) {
    return code >= 48 && code <= 57
  }
  export function Alpha(code: number) {
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
  }
}

// -------------------------------------------------------------------
// Identifier
// -------------------------------------------------------------------
namespace Identifier {
  export function Encode($id: string) {
    const buffer: string[] = []
    for (let i = 0; i < $id.length; i++) {
      const code = $id.charCodeAt(i)
      if (Character.Numeric(code) || Character.Alpha(code)) {
        buffer.push($id.charAt(i))
      } else {
        buffer.push(`_${code}_`)
      }
    }
    return buffer.join('').replace(/__/g, '_')
  }
}

// -------------------------------------------------------------------
// MemberExpression
// -------------------------------------------------------------------
export namespace MemberExpression {
  function Check(propertyName: string) {
    if (propertyName.length === 0) return false
    {
      const code = propertyName.charCodeAt(0)
      if (!(Character.DollarSign(code) || Character.Underscore(code) || Character.Alpha(code))) {
        return false
      }
    }
    for (let i = 1; i < propertyName.length; i++) {
      const code = propertyName.charCodeAt(i)
      if (!(Character.DollarSign(code) || Character.Underscore(code) || Character.Alpha(code) || Character.Numeric(code))) {
        return false
      }
    }
    return true
  }
  export function Encode(object: string, key: string) {
    return !Check(key) ? `${object}['${key}']` : `${object}.${key}`
  }
}

// -------------------------------------------------------------------
// TypeCompiler
// -------------------------------------------------------------------

export class TypeCompilerUnknownTypeError extends Error {
  constructor(public readonly schema: Types.TSchema) {
    super('TypeCompiler: Unknown type')
  }
}

/** Compiles Types for Runtime Type Checking */
export namespace TypeCompiler {
  // -------------------------------------------------------------------
  // Guards
  // -------------------------------------------------------------------
  function IsNumber(value: unknown): value is number {
    return typeof value === 'number' && !globalThis.isNaN(value)
  }

  // -------------------------------------------------------------------
  // Types
  // -------------------------------------------------------------------
  function* Any(schema: Types.TAny, value: string): IterableIterator<string> {
    yield '(true)'
  }

  function* Array(schema: Types.TArray, value: string): IterableIterator<string> {
    const expression = CreateExpression(schema.items, 'value')
    yield `(Array.isArray(${value}) && ${value}.every(value => ${expression}))`
    if (IsNumber(schema.minItems)) yield `(${value}.length >= ${schema.minItems})`
    if (IsNumber(schema.maxItems)) yield `(${value}.length <= ${schema.maxItems})`
    if (schema.uniqueItems === true) yield `((function() { const set = new Set(); for(const element of ${value}) { const hashed = hash(element); if(set.has(hashed)) { return false } else { set.add(hashed) } } return true })())`
  }

  function* Boolean(schema: Types.TBoolean, value: string): IterableIterator<string> {
    yield `(typeof ${value} === 'boolean')`
  }

  function* Constructor(schema: Types.TConstructor, value: string): IterableIterator<string> {
    yield* Visit(schema.returns, `${value}.prototype`)
  }

  function* Date(schema: Types.TDate, value: string): IterableIterator<string> {
    yield `(${value} instanceof Date) && !isNaN(${value}.getTime())`
    if (IsNumber(schema.exclusiveMinimumTimestamp)) yield `(${value}.getTime() > ${schema.exclusiveMinimumTimestamp})`
    if (IsNumber(schema.exclusiveMaximumTimestamp)) yield `(${value}.getTime() < ${schema.exclusiveMaximumTimestamp})`
    if (IsNumber(schema.minimumTimestamp)) yield `(${value}.getTime() >= ${schema.minimumTimestamp})`
    if (IsNumber(schema.maximumTimestamp)) yield `(${value}.getTime() <= ${schema.maximumTimestamp})`
  }

  function* Function(schema: Types.TFunction, value: string): IterableIterator<string> {
    yield `(typeof ${value} === 'function')`
  }

  function* Integer(schema: Types.TInteger, value: string): IterableIterator<string> {
    yield `(typeof ${value} === 'number' && Number.isInteger(${value}))`
    if (IsNumber(schema.multipleOf)) yield `(${value} % ${schema.multipleOf} === 0)`
    if (IsNumber(schema.exclusiveMinimum)) yield `(${value} > ${schema.exclusiveMinimum})`
    if (IsNumber(schema.exclusiveMaximum)) yield `(${value} < ${schema.exclusiveMaximum})`
    if (IsNumber(schema.minimum)) yield `(${value} >= ${schema.minimum})`
    if (IsNumber(schema.maximum)) yield `(${value} <= ${schema.maximum})`
  }

  function* Literal(schema: Types.TLiteral, value: string): IterableIterator<string> {
    if (typeof schema.const === 'number' || typeof schema.const === 'boolean') {
      yield `(${value} === ${schema.const})`
    } else {
      yield `(${value} === '${schema.const}')`
    }
  }

  function* Never(schema: Types.TNever, value: string): IterableIterator<string> {
    yield `(false)`
  }

  function* Null(schema: Types.TNull, value: string): IterableIterator<string> {
    yield `(${value} === null)`
  }

  function* Number(schema: Types.TNumber, value: string): IterableIterator<string> {
    if (TypeSystem.AllowNaN) {
      yield `(typeof ${value} === 'number')`
    } else {
      yield `(typeof ${value} === 'number' && !isNaN(${value}))`
    }
    if (IsNumber(schema.multipleOf)) yield `(${value} % ${schema.multipleOf} === 0)`
    if (IsNumber(schema.exclusiveMinimum)) yield `(${value} > ${schema.exclusiveMinimum})`
    if (IsNumber(schema.exclusiveMaximum)) yield `(${value} < ${schema.exclusiveMaximum})`
    if (IsNumber(schema.minimum)) yield `(${value} >= ${schema.minimum})`
    if (IsNumber(schema.maximum)) yield `(${value} <= ${schema.maximum})`
  }

  function* Object(schema: Types.TObject, value: string): IterableIterator<string> {
    if (TypeSystem.AllowArrayObjects) {
      yield `(typeof ${value} === 'object' && ${value} !== null)`
    } else {
      yield `(typeof ${value} === 'object' && ${value} !== null && !Array.isArray(${value}))`
    }
    if (IsNumber(schema.minProperties)) yield `(Object.getOwnPropertyNames(${value}).length >= ${schema.minProperties})`
    if (IsNumber(schema.maxProperties)) yield `(Object.getOwnPropertyNames(${value}).length <= ${schema.maxProperties})`
    const propertyKeys = globalThis.Object.getOwnPropertyNames(schema.properties)
    if (schema.additionalProperties === false) {
      // Optimization: If the property key length matches the required keys length
      // then we only need check that the values property key length matches that
      // of the property key length. This is because exhaustive testing for values
      // will occur in subsequent property tests.
      if (schema.required && schema.required.length === propertyKeys.length) {
        yield `(Object.getOwnPropertyNames(${value}).length === ${propertyKeys.length})`
      } else {
        const keys = `[${propertyKeys.map((key) => `'${key}'`).join(', ')}]`
        yield `(Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key)))`
      }
    }
    if (TypeGuard.TSchema(schema.additionalProperties)) {
      const expression = CreateExpression(schema.additionalProperties, 'value[key]')
      const keys = `[${propertyKeys.map((key) => `'${key}'`).join(', ')}]`
      yield `(Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key) || ${expression}))`
    }
    for (const propertyKey of propertyKeys) {
      const memberExpression = MemberExpression.Encode(value, propertyKey)
      const propertySchema = schema.properties[propertyKey]
      if (schema.required && schema.required.includes(propertyKey)) {
        yield* Visit(propertySchema, memberExpression)
        if (TypeExtends.Undefined(propertySchema)) {
          yield `('${propertyKey}' in ${value})`
        }
      } else {
        const expression = CreateExpression(propertySchema, memberExpression)
        yield `(${memberExpression} === undefined ? true : (${expression}))`
      }
    }
  }

  function* Promise(schema: Types.TPromise<any>, value: string): IterableIterator<string> {
    yield `(typeof value === 'object' && typeof ${value}.then === 'function')`
  }

  function* Record(schema: Types.TRecord<any, any>, value: string): IterableIterator<string> {
    if (TypeSystem.AllowArrayObjects) {
      yield `(typeof ${value} === 'object' && ${value} !== null && !(${value} instanceof Date))`
    } else {
      yield `(typeof ${value} === 'object' && ${value} !== null && !(${value} instanceof Date) && !Array.isArray(${value}))`
    }
    const [keyPattern, valueSchema] = globalThis.Object.entries(schema.patternProperties)[0]
    const local = PushLocal(`new RegExp(/${keyPattern}/)`)
    yield `(Object.getOwnPropertyNames(${value}).every(key => ${local}.test(key)))`
    const expression = CreateExpression(valueSchema, 'value')
    yield `(Object.values(${value}).every(value => ${expression}))`
  }

  function* Ref(schema: Types.TRef<any>, value: string): IterableIterator<string> {
    // Reference: If we have seen this reference before we can just yield and return
    // the function call. If this isn't the case we defer to visit to generate and
    // set the function for subsequent passes. Consider for refactor.
    if (state_local_function_names.has(schema.$ref)) return yield `(${CreateFunctionName(schema.$ref)}(${value}))`
    if (!state_reference_map.has(schema.$ref)) throw Error(`TypeCompiler.Ref: Cannot de-reference schema with $id '${schema.$ref}'`)
    const reference = state_reference_map.get(schema.$ref)!
    yield* Visit(reference, value)
  }

  function* Self(schema: Types.TSelf, value: string): IterableIterator<string> {
    const func = CreateFunctionName(schema.$ref)
    yield `(${func}(${value}))`
  }

  function* String(schema: Types.TString, value: string): IterableIterator<string> {
    yield `(typeof ${value} === 'string')`
    if (IsNumber(schema.minLength)) yield `(${value}.length >= ${schema.minLength})`
    if (IsNumber(schema.maxLength)) yield `(${value}.length <= ${schema.maxLength})`
    if (schema.pattern !== undefined) {
      const local = PushLocal(`${new RegExp(schema.pattern)};`)
      yield `(${local}.test(${value}))`
    }
    if (schema.format !== undefined) {
      yield `(format('${schema.format}', ${value}))`
    }
  }

  function* Tuple(schema: Types.TTuple<any[]>, value: string): IterableIterator<string> {
    yield `(Array.isArray(${value}))`
    if (schema.items === undefined) return yield `(${value}.length === 0)`
    yield `(${value}.length === ${schema.maxItems})`
    for (let i = 0; i < schema.items.length; i++) {
      const expression = CreateExpression(schema.items[i], `${value}[${i}]`)
      yield `(${expression})`
    }
  }

  function* Undefined(schema: Types.TUndefined, value: string): IterableIterator<string> {
    yield `(${value} === undefined)`
  }

  function* Union(schema: Types.TUnion<any[]>, value: string): IterableIterator<string> {
    const expressions = schema.anyOf.map((schema: Types.TSchema) => CreateExpression(schema, value))
    yield `(${expressions.join(' || ')})`
  }

  function* Uint8Array(schema: Types.TUint8Array, value: string): IterableIterator<string> {
    yield `(${value} instanceof Uint8Array)`
    if (IsNumber(schema.maxByteLength)) yield `(${value}.length <= ${schema.maxByteLength})`
    if (IsNumber(schema.minByteLength)) yield `(${value}.length >= ${schema.minByteLength})`
  }

  function* Unknown(schema: Types.TUnknown, value: string): IterableIterator<string> {
    yield '(true)'
  }

  function* Void(schema: Types.TVoid, value: string): IterableIterator<string> {
    yield `(${value} === null)`
  }

  function* UserDefined(schema: Types.TSchema, value: string): IterableIterator<string> {
    const schema_key = `schema_key_${state_remote_custom_types.size}`
    state_remote_custom_types.set(schema_key, schema)
    yield `(custom('${schema[Types.Kind]}', '${schema_key}', ${value}))`
  }

  function* Visit<T extends Types.TSchema>(schema: T, value: string): IterableIterator<string> {
    // Reference: Referenced schemas can originate from either additional schemas
    // or inline in the schema itself. Ideally the recursive path should align to
    // reference path. Consider for refactor.
    if (schema.$id && !state_local_function_names.has(schema.$id)) {
      state_local_function_names.add(schema.$id)
      const name = CreateFunctionName(schema.$id)
      const body = CreateFunction(name, schema, 'value')
      PushFunction(body)
      yield `(${name}(${value}))`
      return
    }
    const anySchema = schema as any
    switch (anySchema[Types.Kind]) {
      case 'Any':
        return yield* Any(anySchema, value)
      case 'Array':
        return yield* Array(anySchema, value)
      case 'Boolean':
        return yield* Boolean(anySchema, value)
      case 'Constructor':
        return yield* Constructor(anySchema, value)
      case 'Date':
        return yield* Date(anySchema, value)
      case 'Function':
        return yield* Function(anySchema, value)
      case 'Integer':
        return yield* Integer(anySchema, value)
      case 'Literal':
        return yield* Literal(anySchema, value)
      case 'Never':
        return yield* Never(anySchema, value)
      case 'Null':
        return yield* Null(anySchema, value)
      case 'Number':
        return yield* Number(anySchema, value)
      case 'Object':
        return yield* Object(anySchema, value)
      case 'Promise':
        return yield* Promise(anySchema, value)
      case 'Record':
        return yield* Record(anySchema, value)
      case 'Ref':
        return yield* Ref(anySchema, value)
      case 'Self':
        return yield* Self(anySchema, value)
      case 'String':
        return yield* String(anySchema, value)
      case 'Tuple':
        return yield* Tuple(anySchema, value)
      case 'Undefined':
        return yield* Undefined(anySchema, value)
      case 'Union':
        return yield* Union(anySchema, value)
      case 'Uint8Array':
        return yield* Uint8Array(anySchema, value)
      case 'Unknown':
        return yield* Unknown(anySchema, value)
      case 'Void':
        return yield* Void(anySchema, value)
      default:
        if (!Custom.Has(anySchema[Types.Kind])) throw new TypeCompilerUnknownTypeError(schema)
        return yield* UserDefined(anySchema, value)
    }
  }

  // -------------------------------------------------------------------
  // Compiler State
  // -------------------------------------------------------------------

  const state_reference_map = new Map<string, Types.TSchema>() // tracks schemas with identifiers
  const state_local_variables = new Set<string>() // local variables and functions
  const state_local_function_names = new Set<string>() // local function names used call ref validators
  const state_remote_custom_types = new Map<string, unknown>() // remote custom types used during compilation

  function ResetCompiler() {
    state_reference_map.clear()
    state_local_variables.clear()
    state_local_function_names.clear()
    state_remote_custom_types.clear()
  }

  function AddReferences(schemas: Types.TSchema[] = []) {
    for (const schema of schemas) {
      if (!schema.$id) throw new Error(`TypeCompiler: Referenced schemas must specify an $id.`)
      if (state_reference_map.has(schema.$id)) throw new Error(`TypeCompiler: Duplicate schema $id found for '${schema.$id}'`)
      state_reference_map.set(schema.$id, schema)
    }
  }

  function CreateExpression(schema: Types.TSchema, value: string): string {
    return `(${[...Visit(schema, value)].join(' && ')})`
  }

  function CreateFunctionName($id: string) {
    return `check_${Identifier.Encode($id)}`
  }

  function CreateFunction(name: string, schema: Types.TSchema, value: string): string {
    const expression = [...Visit(schema, value)].map((condition) => `    ${condition}`).join(' &&\n')
    return `function ${name}(value) {\n  return (\n${expression}\n )\n}`
  }

  function PushFunction(functionBody: string) {
    state_local_variables.add(functionBody)
  }

  function PushLocal(expression: string) {
    const local = `local_${state_local_variables.size}`
    state_local_variables.add(`const ${local} = ${expression}`)
    return local
  }

  function GetLocals() {
    return [...state_local_variables.values()]
  }

  // -------------------------------------------------------------------
  // Compile
  // -------------------------------------------------------------------

  function Build<T extends Types.TSchema>(schema: T, references: Types.TSchema[] = []): string {
    ResetCompiler()
    AddReferences(references)
    const check = CreateFunction('check', schema, 'value')
    const locals = GetLocals()
    return `${locals.join('\n')}\nreturn ${check}`
  }

  /** Compiles the given type for runtime type checking. This compiler only accepts known TypeBox types non-inclusive of unsafe types. */
  export function Compile<T extends Types.TSchema>(schema: T, references: Types.TSchema[] = []): TypeCheck<T> {
    TypeGuard.Assert(schema, references)
    const code = Build(schema, references)
    const custom_schemas = new Map(state_remote_custom_types)
    const compiledFunction = globalThis.Function('custom', 'format', 'hash', code)
    const checkFunction = compiledFunction(
      (kind: string, schema_key: string, value: unknown) => {
        if (!Custom.Has(kind) || !custom_schemas.has(schema_key)) return false
        const schema = custom_schemas.get(schema_key)!
        const func = Custom.Get(kind)!
        return func(schema, value)
      },
      (format: string, value: string) => {
        if (!Format.Has(format)) return false
        const func = Format.Get(format)!
        return func(value)
      },
      (value: unknown) => {
        return ValueHash.Create(value)
      },
    )
    return new TypeCheck(schema, references, checkFunction, code)
  }
}
