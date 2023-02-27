/*--------------------------------------------------------------------------

@sinclair/typebox/model

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

import { TypeCompiler, ValueError, TypeCheck } from '@sinclair/typebox/compiler'
import { Format } from '@sinclair/typebox/format'
import { Value } from '@sinclair/typebox/value'
import * as Types from '@sinclair/typebox'

// -----------------------------------------------------------------
// Formats
// -----------------------------------------------------------------
// prettier-ignore
Format.Set('email', (value) => /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(value))
// prettier-ignore
Format.Set('uuid', (value) => /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value))
// prettier-ignore
Format.Set('url', (value) => /^(?:https?|wss?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu.test(value))
// prettier-ignore
Format.Set('ipv6', (value) => /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i.test(value))
// prettier-ignore
Format.Set('ipv4', (value) => /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(value))

// -----------------------------------------------------------------
// Into
// -----------------------------------------------------------------
export type IntoType<T extends Types.TSchema> = ModelType<T>
export type IntoProperties<T extends Types.TProperties> = { [K in keyof T]: T[K] extends Types.TSchema ? IntoType<T[K]> : never }
export type IntoTuple<T extends Types.TSchema[]> = [...{ [K in keyof T]: IntoType<T[K]> }]

// -----------------------------------------------------------------
// Error
// -----------------------------------------------------------------
export class ModelError extends Error {
  constructor(public readonly errors: ValueError[]) {
    super('Invalid Type')
  }
}

// -----------------------------------------------------------------
// Assert
// -----------------------------------------------------------------
export interface ModelAssert<T extends Types.TSchema> {
  Check(value: unknown): value is Types.Static<T>
  Errors(value: unknown): IterableIterator<ValueError>
  Code(): string
}
export class ModelAssertDynamic<T extends Types.TSchema> implements ModelAssert<T> {
  readonly #schema: T
  constructor(schema: T) {
    this.#schema = schema
  }
  public Check(value: unknown): value is Types.Static<T, []> {
    return Value.Check(this.#schema, [], value)
  }
  public Errors(value: unknown): IterableIterator<ValueError> {
    return Value.Errors(this.#schema, [], value)
  }
  public Code(): string {
    return TypeCompiler.Code(this.#schema, [])
  }
}
export class ModelAssertCompiled<T extends Types.TSchema> implements ModelAssert<T> {
  readonly #typecheck: TypeCheck<T>
  constructor(schema: T) {
    this.#typecheck = TypeCompiler.Compile(schema)
  }
  public Check(value: unknown): value is Types.Static<T, []> {
    return this.#typecheck.Check(value)
  }
  public Errors(value: unknown): IterableIterator<ValueError> {
    return this.#typecheck.Errors(value)
  }
  public Code(): string {
    return this.#typecheck.Code()
  }
}
// -----------------------------------------------------------------
// Type
// -----------------------------------------------------------------
export class ModelType<T extends Types.TSchema = Types.TSchema> {
  #assert: ModelAssert<T>
  #schema: T
  constructor(schema: T) {
    this.#assert = new ModelAssertDynamic(schema)
    this.#schema = schema
  }
  public Check(value: unknown): value is Types.Static<T> {
    return this.#assert.Check(value)
  }
  public Assert(value: unknown): void {
    if (this.#assert.Check(value)) return
    throw new ModelError([...this.#assert.Errors(value)])
  }
  public Parse(value: unknown): Types.Static<T> {
    this.Assert(value)
    return value
  }
  public Ensure(value: unknown): Types.Static<T> {
    return Value.Cast(this.#schema, [], value)
  }
  public Create(): Types.Static<T> {
    return Value.Create(this.#schema, [])
  }
  public Default(value: Types.Static<T>): this {
    return new ModelType({ ...this.#schema, default: value }) as this
  }
  public ReadonlyOptional(): ModelType<Types.TReadonlyOptional<T>> {
    return new ModelType(Types.Type.ReadonlyOptional(this.#schema))
  }
  public Optional(): ModelType<Types.TOptional<T>> {
    return new ModelType(Types.Type.Optional(this.#schema))
  }
  public Readonly(): ModelType<Types.TReadonly<T>> {
    return new ModelType(Types.Type.Readonly(this.#schema))
  }
  public Nullable() {
    return new ModelUnion(Types.Type.Union([this.#schema, Types.Type.Null()]))
  }
  public Or<T extends Types.TSchema>(type: IntoType<T>) {
    return new ModelType(Types.Type.Union([this.#schema, type.Schema]))
  }
  public get Code(): string {
    return this.#assert.Code()
  }
  public get Schema(): T {
    return Value.Clone(this.#schema)
  }
  public Compile(): this {
    const compiled = new ModelType(this.#schema)
    compiled.#assert = new ModelAssertCompiled(this.#schema)
    return compiled as this
  }
}
export class ModelObject<T extends Types.TObject = Types.TObject> extends ModelType<T> {
  public And<U extends Types.TObject>(type: IntoType<U>) {
    return new ModelIntersect(Types.Type.Intersect([this.Schema, type.Schema]))
  }
  public Extend<U extends Types.TProperties>(properties: IntoProperties<U>) {
    const props = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties) as U
    const object = Types.Type.Object(props)
    return new ModelIntersect(Types.Type.Intersect([this.Schema, object]))
  }
  public Partial() {
    return new ModelObject(Types.Type.Partial(this.Schema))
  }
  public Required() {
    return new ModelObject(Types.Type.Required(this.Schema))
  }
  public Pick<K extends Types.ObjectPropertyKeys<T>[]>(keys: [...K]) {
    return new ModelObject(Types.Type.Pick(this.Schema, keys))
  }
  public Omit<K extends Types.ObjectPropertyKeys<T>[]>(keys: readonly [...K]) {
    return new ModelObject(Types.Type.Omit(this.Schema, keys))
  }
  public Strict(): this {
    return new ModelObject({ ...this.Schema, additionalProperties: false }) as this
  }
  public KeyOf() {
    return new ModelKeyOf(Types.Type.KeyOf(this.Schema))
  }
}

export class ModelIntersect<T extends Types.TIntersect> extends ModelObject<T> {}

// -----------------------------------------------------------------
// Any
// -----------------------------------------------------------------
export class ModelAny<T extends Types.TAny> extends ModelType<T> {}

// -----------------------------------------------------------------
// Literal
// -----------------------------------------------------------------
export class ModelLiteral<T extends Types.TLiteral<Types.TLiteralValue>> extends ModelType<T> {}

// -----------------------------------------------------------------
// Unknown
// -----------------------------------------------------------------
export class ModelUnknown<T extends Types.TUnknown> extends ModelType<T> {}

// -----------------------------------------------------------------
// Null
// -----------------------------------------------------------------
export class ModelNull<T extends Types.TNull> extends ModelType<T> {}

// -----------------------------------------------------------------
// Never
// -----------------------------------------------------------------
export class ModelNever<T extends Types.TNever> extends ModelType<T> {}

// -----------------------------------------------------------------
// Undefined
// -----------------------------------------------------------------
export class ModelUndefined<T extends Types.TUndefined> extends ModelType<T> {}

// -----------------------------------------------------------------
// Array
// -----------------------------------------------------------------
export class ModelArray<T extends Types.TArray<Types.TSchema>> extends ModelType<T> {
  public MinLength(n: number) {
    return new ModelArray(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public MaxLength(n: number) {
    return new ModelArray(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public Length(n: number) {
    return new ModelArray(Types.Type.Array({ ...this.Schema, minItems: n, maxItems: n }))
  }
  public Distinct() {
    return new ModelArray(Types.Type.Array({ ...this.Schema, uniqueItems: true }))
  }
}
// -----------------------------------------------------------------
// String
// -----------------------------------------------------------------
export class ModelString extends ModelType<Types.TString> {
  public MinLength(n: number) {
    return new ModelString(Types.Type.String({ ...this.Schema, minLength: n }))
  }
  public MaxLength(n: number) {
    return new ModelString(Types.Type.String({ ...this.Schema, maxLength: n }))
  }
  public Length(n: number) {
    return new ModelString(Types.Type.String({ ...this.Schema, maxLength: n, minLength: n }))
  }
  public Email() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'email' }))
  }
  public Uuid() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'uuid' }))
  }
  public Url() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'url' }))
  }
  public Ipv6() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'ipv6' }))
  }
  public Ipv4() {
    return new ModelString(Types.Type.String({ ...this.Schema, format: 'ipv4' }))
  }
}
// -----------------------------------------------------------------
// Number
// -----------------------------------------------------------------
export class ModelNumber extends ModelType<Types.TNumber> {
  public GreaterThan(n: number) {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new ModelNumber(Types.Type.Number({ ...this.Schema, maximum: 0 }))
  }
}
// -----------------------------------------------------------------
// Integer
// -----------------------------------------------------------------
export class ModelInteger extends ModelType<Types.TInteger> {
  public GreaterThan(n: number) {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new ModelInteger(Types.Type.Integer({ ...this.Schema, maximum: 0 }))
  }
}

// -----------------------------------------------------------------
// Boolean
// -----------------------------------------------------------------
export class ModelBoolean extends ModelType<Types.TBoolean> {}

// -----------------------------------------------------------------
// Date
// -----------------------------------------------------------------
export class ModelDate extends ModelType<Types.TDate> {}

// -----------------------------------------------------------------
// KeyOf
// -----------------------------------------------------------------
export class ModelKeyOf<T extends Types.TKeyOf<any>> extends ModelType<T> {}

// -----------------------------------------------------------------
// Object
// -----------------------------------------------------------------
export type ModelProperties = Record<any, ModelType>

// -----------------------------------------------------------------
// Promise
// -----------------------------------------------------------------
export class ModelPromise<T extends Types.TSchema> extends ModelType<T> {}

// -----------------------------------------------------------------
// Union
// -----------------------------------------------------------------
export class ModelUnion<T extends Types.TUnion> extends ModelType<T> {}

// -----------------------------------------------------------------
// Tuple
// -----------------------------------------------------------------
export class ModelTuple<T extends Types.TTuple> extends ModelType<T> {}

// -----------------------------------------------------------------
// Pick
// -----------------------------------------------------------------
export class ModelPick<T extends Types.TObject, Properties extends Types.ObjectPropertyKeys<T>[]> extends ModelType<Types.TPick<T, Properties>> {}

// -----------------------------------------------------------------
// Uint8Array
// -----------------------------------------------------------------
export class ModelUint8Array<T extends Types.TUint8Array> extends ModelType<T> {
  public MinByteLength(n: number) {
    return new ModelUint8Array(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n }))
  }
  public MaxByteLength(n: number) {
    return new ModelUint8Array(Types.Type.Uint8Array({ ...this.Schema, maxByteLength: n }))
  }
  public Length(n: number) {
    return new ModelUint8Array(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n, maxByteLength: n }))
  }
}

// -----------------------------------------------------------------
// Record
// -----------------------------------------------------------------
export class ModelRecord<T extends Types.TSchema> extends ModelType<Types.TRecord<Types.TString, T>> {}

// -----------------------------------------------------------------
// Recursive
// -----------------------------------------------------------------

export class ModelSelf extends ModelType<Types.TSelf> {}

export class ModelRecursive<T extends Types.TSchema> extends ModelType<T> {}

// -----------------------------------------------------------------
// Function
// -----------------------------------------------------------------

export type ModelFunctionParameters<T extends Types.TSchema[]> = [...{ [K in keyof T]: Types.Static<T[K]> }]

export type ModelFunction<T extends Types.TFunction<any[], any>> = (...param: ModelFunctionParameters<T['parameters']>) => Types.Static<T['returns']>

export class ModelFunctionDefinition<T extends Types.TFunction<any[], any>> {
  constructor(public readonly schema: T) {}
  public Implement(callback: ModelFunction<T>): ModelFunction<T> {
    const typecheck = TypeCompiler.Compile(Types.Type.Parameters(this.schema))
    return (...params: unknown[]) => {
      if (typecheck.Check(params)) return callback(...params)
      const error: ValueError = typecheck.Errors(params).next()!.value
      throw new Error(`${error.path} ${error.message}`)
    }
  }
}

/** Type Model Builder */
export class ModelBuilder {
  public Date() {
    return new ModelDate(Types.Type.Date())
  }
  public Boolean() {
    return new ModelBoolean(Types.Type.Boolean())
  }
  public String() {
    return new ModelString(Types.Type.String())
  }
  public Number() {
    return new ModelNumber(Types.Type.Number())
  }
  public Integer() {
    return new ModelInteger(Types.Type.Integer())
  }
  public Object<T extends Types.TProperties>(properties: IntoProperties<T>) {
    const mapped = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties)
    return new ModelObject(Types.Type.Object(mapped)) as ModelObject<Types.TObject<T>>
  }
  public Array<T extends Types.TSchema>(item: ModelType<T>) {
    return new ModelArray(Types.Type.Array(item.Schema))
  }
  public Union<T extends Types.TSchema[]>(union: [...IntoTuple<T>]) {
    return new ModelUnion(Types.Type.Union(union.map((type) => type.Schema))) as ModelUnion<Types.TUnion<T>>
  }
  public Tuple<T extends Types.TSchema[]>(tuple: IntoTuple<T>) {
    return new ModelTuple(Types.Type.Tuple(tuple.map((type) => type.Schema))) as ModelTuple<Types.TTuple<T>>
  }
  public Intersect<T extends Types.TObject[]>(objects: [...IntoTuple<T>]) {
    return new ModelObject(Types.Type.Intersect(objects.map((type) => type.Schema))) as ModelObject<Types.TIntersect<T>>
  }
  public Literal<T extends Types.TLiteralValue>(value: T) {
    return new ModelLiteral(Types.Type.Literal(value))
  }
  public Promise<T extends Types.TSchema>(type: IntoType<T>) {
    return new ModelPromise(Types.Type.Promise(type.Schema))
  }
  public Function<P extends Types.TSchema[], R extends Types.TSchema>(params: IntoTuple<P>, returns: IntoType<R>) {
    return new ModelFunctionDefinition(Types.Type.Function(params.map((param) => param.Schema) as [...P], returns.Schema))
  }
  public Null() {
    return new ModelNull(Types.Type.Null())
  }
  public Never() {
    return new ModelNever(Types.Type.Never())
  }
  public Undefined() {
    return new ModelUndefined(Types.Type.Undefined())
  }
  public Unknown() {
    return new ModelUnknown(Types.Type.Unknown())
  }
  public Any() {
    return new ModelAny(Types.Type.Any())
  }
  public Record<T extends Types.TSchema>(type: IntoType<T>): ModelRecord<T> {
    return new ModelRecord(Types.Type.Record(Types.Type.String(), type.Schema))
  }
  public Uint8Array() {
    return new ModelUint8Array(Types.Type.Uint8Array())
  }
  public Recursive<T extends Types.TSchema>(callback: (self: ModelSelf) => ModelType<T>) {
    // prettier-ignore
    return new ModelRecursive(Types.Type.Recursive((Self) => callback(new ModelSelf(Self)).Schema))
  }
}

export type Static<T> = T extends ModelType<infer S> ? Types.Static<S> : unknown

export const Type = new ModelBuilder()
