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
export type IntoModel<T extends Types.TSchema> = TypeModel<T>
export type IntoModelProperties<T extends Types.TProperties> = { [K in keyof T]: T[K] extends Types.TSchema ? IntoModel<T[K]> : never }
export type IntoModelTuple<T extends Types.TSchema[]> = [...{ [K in keyof T]: IntoModel<T[K]> }]

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
export class TypeModel<T extends Types.TSchema = Types.TSchema> {
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
    return new TypeModel({ ...this.#schema, default: value }) as this
  }
  public ReadonlyOptional(): TypeModel<Types.TReadonlyOptional<T>> {
    return new TypeModel(Types.Type.ReadonlyOptional(this.#schema))
  }
  public Optional(): TypeModel<Types.TOptional<T>> {
    return new TypeModel(Types.Type.Optional(this.#schema))
  }
  public Readonly(): TypeModel<Types.TReadonly<T>> {
    return new TypeModel(Types.Type.Readonly(this.#schema))
  }
  public Nullable() {
    return new UnionModel(Types.Type.Union([this.#schema, Types.Type.Null()]))
  }
  public Or<T extends Types.TSchema>(type: IntoModel<T>) {
    return new TypeModel(Types.Type.Union([this.#schema, type.Schema]))
  }
  public Not<U extends Types.TSchema>(type: IntoModel<U>) {
    return new NotModel(Types.Type.Not(type.Schema, this.Schema))
  }
  public get Code(): string {
    return this.#assert.Code()
  }
  public get Schema(): T {
    return Value.Clone(this.#schema)
  }
  public Compile(): this {
    const compiled = new TypeModel(this.#schema)
    compiled.#assert = new ModelAssertCompiled(this.#schema)
    return compiled as this
  }
}

// -----------------------------------------------------------------
// Object
// -----------------------------------------------------------------
export class ObjectModel<T extends Types.TObject = Types.TObject> extends TypeModel<T> {
  public And<U extends Types.TObject>(type: IntoModel<U>) {
    return new IntersectModel(Types.Type.Intersect([this.Schema, type.Schema]))
  }
  public Extend<U extends Types.TProperties>(properties: IntoModelProperties<U>) {
    const props = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties) as U
    const object = Types.Type.Object(props)
    return new IntersectModel(Types.Type.Intersect([this.Schema, object]))
  }
  public Partial() {
    return new ObjectModel(Types.Type.Partial(this.Schema))
  }
  public Required() {
    return new ObjectModel(Types.Type.Required(this.Schema))
  }
  public Pick<K extends Types.ObjectPropertyKeys<T>[]>(keys: [...K]) {
    return new ObjectModel(Types.Type.Pick(this.Schema, keys))
  }
  public Omit<K extends Types.ObjectPropertyKeys<T>[]>(keys: readonly [...K]) {
    return new ObjectModel(Types.Type.Omit(this.Schema, keys))
  }
  public Strict(): this {
    return new ObjectModel({ ...this.Schema, additionalProperties: false }) as this
  }
  public KeyOf() {
    return new KeyOfModel(Types.Type.KeyOf(this.Schema))
  }
}

// -----------------------------------------------------------------
// Intersect
// -----------------------------------------------------------------
export class IntersectModel<T extends Types.TIntersect> extends ObjectModel<T> {}

// -----------------------------------------------------------------
// Any
// -----------------------------------------------------------------
export class AnyModel<T extends Types.TAny> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Literal
// -----------------------------------------------------------------
export class LiteralModel<T extends Types.TLiteral<Types.TLiteralValue>> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Unknown
// -----------------------------------------------------------------
export class UnknownModel<T extends Types.TUnknown> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Null
// -----------------------------------------------------------------
export class NullModel<T extends Types.TNull> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Never
// -----------------------------------------------------------------
export class NeverModel<T extends Types.TNever> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Not
// -----------------------------------------------------------------
export class NotModel<T extends Types.TNot<Types.TSchema, Types.TSchema>> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Undefined
// -----------------------------------------------------------------
export class UndefinedModel<T extends Types.TUndefined> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Array
// -----------------------------------------------------------------
export class ArrayModel<T extends Types.TArray<Types.TSchema>> extends TypeModel<T> {
  public MinLength(n: number) {
    return new ArrayModel(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public MaxLength(n: number) {
    return new ArrayModel(Types.Type.Array({ ...this.Schema, maxItems: n }))
  }
  public Length(n: number) {
    return new ArrayModel(Types.Type.Array({ ...this.Schema, minItems: n, maxItems: n }))
  }
  public Distinct() {
    return new ArrayModel(Types.Type.Array({ ...this.Schema, uniqueItems: true }))
  }
}
// -----------------------------------------------------------------
// String
// -----------------------------------------------------------------
export class StringModel extends TypeModel<Types.TString> {
  public MinLength(n: number) {
    return new StringModel(Types.Type.String({ ...this.Schema, minLength: n }))
  }
  public MaxLength(n: number) {
    return new StringModel(Types.Type.String({ ...this.Schema, maxLength: n }))
  }
  public Length(n: number) {
    return new StringModel(Types.Type.String({ ...this.Schema, maxLength: n, minLength: n }))
  }
  public Email() {
    return new StringModel(Types.Type.String({ ...this.Schema, format: 'email' }))
  }
  public Uuid() {
    return new StringModel(Types.Type.String({ ...this.Schema, format: 'uuid' }))
  }
  public Url() {
    return new StringModel(Types.Type.String({ ...this.Schema, format: 'url' }))
  }
  public Ipv6() {
    return new StringModel(Types.Type.String({ ...this.Schema, format: 'ipv6' }))
  }
  public Ipv4() {
    return new StringModel(Types.Type.String({ ...this.Schema, format: 'ipv4' }))
  }
}
// -----------------------------------------------------------------
// Number
// -----------------------------------------------------------------
export class NumberModel extends TypeModel<Types.TNumber> {
  public GreaterThan(n: number) {
    return new NumberModel(Types.Type.Number({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new NumberModel(Types.Type.Number({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new NumberModel(Types.Type.Number({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new NumberModel(Types.Type.Number({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new NumberModel(Types.Type.Number({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new NumberModel(Types.Type.Number({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new NumberModel(Types.Type.Number({ ...this.Schema, maximum: 0 }))
  }
}
// -----------------------------------------------------------------
// Integer
// -----------------------------------------------------------------
export class IntegerModel extends TypeModel<Types.TInteger> {
  public GreaterThan(n: number) {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, exclusiveMinimum: n }))
  }
  public GreaterThanEqual(n: number) {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, minimum: n }))
  }
  public LessThan(n: number) {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, exclusiveMaximum: n }))
  }
  public LessThanEqual(n: number) {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, maximum: n }))
  }
  public MultipleOf(n: number) {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, multipleOf: n }))
  }
  public Positive() {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, minimum: 0 }))
  }
  public Negative() {
    return new IntegerModel(Types.Type.Integer({ ...this.Schema, maximum: 0 }))
  }
}

// -----------------------------------------------------------------
// Boolean
// -----------------------------------------------------------------
export class BooleanModel extends TypeModel<Types.TBoolean> {}

// -----------------------------------------------------------------
// Date
// -----------------------------------------------------------------
export class DateModel extends TypeModel<Types.TDate> {}

// -----------------------------------------------------------------
// KeyOf
// -----------------------------------------------------------------
export class KeyOfModel<T extends Types.TKeyOf<any>> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Object
// -----------------------------------------------------------------
export type PropertiesModel = Record<any, TypeModel>

// -----------------------------------------------------------------
// Promise
// -----------------------------------------------------------------
export class PromiseModel<T extends Types.TSchema> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Union
// -----------------------------------------------------------------
export class UnionModel<T extends Types.TUnion> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Tuple
// -----------------------------------------------------------------
export class TupleModel<T extends Types.TTuple> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Pick
// -----------------------------------------------------------------
export class PickModel<T extends Types.TObject, Properties extends Types.ObjectPropertyKeys<T>[]> extends TypeModel<Types.TPick<T, Properties>> {}

// -----------------------------------------------------------------
// Uint8Array
// -----------------------------------------------------------------
export class Uint8ArrayModel<T extends Types.TUint8Array> extends TypeModel<T> {
  public MinByteLength(n: number) {
    return new Uint8ArrayModel(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n }))
  }
  public MaxByteLength(n: number) {
    return new Uint8ArrayModel(Types.Type.Uint8Array({ ...this.Schema, maxByteLength: n }))
  }
  public Length(n: number) {
    return new Uint8ArrayModel(Types.Type.Uint8Array({ ...this.Schema, minByteLength: n, maxByteLength: n }))
  }
}

// -----------------------------------------------------------------
// Record
// -----------------------------------------------------------------
export class RecordModel<T extends Types.TSchema> extends TypeModel<Types.TRecord<Types.TString, T>> {}

// -----------------------------------------------------------------
// Recursive
// -----------------------------------------------------------------

export class SelfModel extends TypeModel<Types.TSelf> {}

export class RecursiveModel<T extends Types.TSchema> extends TypeModel<T> {}

// -----------------------------------------------------------------
// Function
// -----------------------------------------------------------------

export type FunctionModelParameters<T extends Types.TSchema[]> = [...{ [K in keyof T]: Types.Static<T[K]> }]

export type FunctionModel<T extends Types.TFunction<any[], any>> = (...param: FunctionModelParameters<T['parameters']>) => Types.Static<T['returns']>

export class FunctionModelDefinition<T extends Types.TFunction<any[], any>> {
  constructor(public readonly schema: T) {}
  public Implement(callback: FunctionModel<T>): FunctionModel<T> {
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
    return new DateModel(Types.Type.Date())
  }
  public Boolean() {
    return new BooleanModel(Types.Type.Boolean())
  }
  public String() {
    return new StringModel(Types.Type.String())
  }
  public Number() {
    return new NumberModel(Types.Type.Number())
  }
  public Integer() {
    return new IntegerModel(Types.Type.Integer())
  }
  public Object<T extends Types.TProperties>(properties: IntoModelProperties<T>) {
    const mapped = Object.keys(properties).reduce((acc, key) => ({ ...acc, [key]: properties[key].Schema }), {} as Types.TProperties)
    return new ObjectModel(Types.Type.Object(mapped)) as ObjectModel<Types.TObject<T>>
  }
  public Array<T extends Types.TSchema>(item: TypeModel<T>) {
    return new ArrayModel(Types.Type.Array(item.Schema))
  }
  public Union<T extends Types.TSchema[]>(union: [...IntoModelTuple<T>]) {
    return new UnionModel(Types.Type.Union(union.map((type) => type.Schema))) as UnionModel<Types.TUnion<T>>
  }
  public Tuple<T extends Types.TSchema[]>(tuple: IntoModelTuple<T>) {
    return new TupleModel(Types.Type.Tuple(tuple.map((type) => type.Schema))) as TupleModel<Types.TTuple<T>>
  }
  public Intersect<T extends Types.TObject[]>(objects: [...IntoModelTuple<T>]) {
    return new ObjectModel(Types.Type.Intersect(objects.map((type) => type.Schema))) as ObjectModel<Types.TIntersect<T>>
  }
  public Literal<T extends Types.TLiteralValue>(value: T) {
    return new LiteralModel(Types.Type.Literal(value))
  }
  public Promise<T extends Types.TSchema>(type: IntoModel<T>) {
    return new PromiseModel(Types.Type.Promise(type.Schema))
  }
  public Function<P extends Types.TSchema[], R extends Types.TSchema>(params: IntoModelTuple<P>, returns: IntoModel<R>) {
    return new FunctionModelDefinition(Types.Type.Function(params.map((param) => param.Schema) as [...P], returns.Schema))
  }
  public Null() {
    return new NullModel(Types.Type.Null())
  }
  public Never() {
    return new NeverModel(Types.Type.Never())
  }
  public Undefined() {
    return new UndefinedModel(Types.Type.Undefined())
  }
  public Unknown() {
    return new UnknownModel(Types.Type.Unknown())
  }
  public Any() {
    return new AnyModel(Types.Type.Any())
  }
  public Record<T extends Types.TSchema>(type: IntoModel<T>): RecordModel<T> {
    return new RecordModel(Types.Type.Record(Types.Type.String(), type.Schema))
  }
  public Uint8Array() {
    return new Uint8ArrayModel(Types.Type.Uint8Array())
  }
  public Recursive<T extends Types.TSchema>(callback: (self: SelfModel) => TypeModel<T>) {
    // prettier-ignore
    return new RecursiveModel(Types.Type.Recursive((Self) => callback(new SelfModel(Self)).Schema))
  }
}

export type Static<T> = T extends TypeModel<infer S> ? Types.Static<S> : unknown

export const Type = new ModelBuilder()
